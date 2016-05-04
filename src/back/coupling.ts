/// <reference path="../../typings/main.d.ts" />

import {writeFileSync} from "fs";
import * as ts from "typescript";
import {parse, tokenKindName} from "./parse";
import {startServer} from "./server";
import {IClass, IMethod, ICall} from "../middle/Metadata";

function generateCouplingData(parsedData:{
    sourceFiles:ts.SourceFile[],
    checker:ts.TypeChecker
}):void {
    // Build a program using the set of root file names in fileNames
    var info = [];
    for (const sourceFile of parsedData.sourceFiles) {
        // Walk the tree to search for classes
        console.log('----' + sourceFile.fileName + '----');
        ts.forEachChild(sourceFile, (node:ts.Node) => {
            var newClasses = visit(node, sourceFile);
            info = info.concat(newClasses);
        })
    }

    function visit(node:ts.Node, file:ts.SourceFile) {
        var classes:IClass[] = [];
        if (node.kind == ts.SyntaxKind.ClassDeclaration) {
            classes.push(visitClass(node, file));
            visitStructure(node);
        }
        ts.forEachChild(node, (node) => {
            classes = classes.concat(visit(node, file));
        });
        return classes;
    }

    function visitClass(node:ts.Node, file:ts.SourceFile):IClass {
        var name = getIdentifierName(node);
        return {
            name: name,
            methods: getMethods(node, name, file),
            text: node.getText(),
            path: file.path,
            line: file.getLineAndCharacterOfPosition(node.getStart(file)).line.toString()
        };
    }

    function getMethods(node:ts.Node, className:string, file:ts.SourceFile):{[key:string]:IMethod} {
        var methods:{[key:string]:IMethod} = {};
        ts.forEachChild(node, (node:ts.Node) => {
                //TODO public properties
                if (node.kind == ts.SyntaxKind.Constructor) {
                    methods['Constructor'] = {
                        text: node.getText(),
                        calls: getCalls(node, className, file),
                        path: file.path,
                        line: file.getLineAndCharacterOfPosition(node.getStart(file)).line.toString()
                    };
                } else if (node.kind == ts.SyntaxKind.MethodDeclaration) {
                    methods[getIdentifierName(node)] = {
                        text: node.getText(),
                        calls: getCalls(node, className, file),
                        path: file.path,
                        line: file.getLineAndCharacterOfPosition(node.getStart(file)).line.toString()
                    };
                } else if (
                    node.kind == ts.SyntaxKind.GetAccessor ||
                    node.kind == ts.SyntaxKind.SetAccessor
                ) {
                    methods[getIdentifierName(node)] = {
                        text: node.getText(),
                        calls: getCalls(node, className, file),
                        path: file.path,
                        line: file.getLineAndCharacterOfPosition(node.getStart(file)).line.toString()
                    };
                }
            }
        )
        ;
        return methods;
    }

    function getCalls(node:ts.Node, className:string, file:ts.SourceFile) {
        var res = [];
        ts.forEachChild(node, (node) => {
            if (
                node.kind == ts.SyntaxKind.PropertyAccessExpression
            ) {
                res.push(getCallTarget(node, className, file));
                res = res.concat(getCalls(node, className, file));
            } else {
                res = res.concat(getCalls(node, className, file));
            }
        });
        return res;
    }

    function getCallTarget(node:ts.Node, className:string, file:ts.SourceFile):ICall {
        var children = node.getChildren();
        var propertyOwner = children[children.length - 3];
        var symbol = parsedData.checker.getSymbolAtLocation(propertyOwner);
        var type = symbol ? parsedData.checker.getTypeOfSymbolAtLocation(symbol, propertyOwner) : parsedData.checker.getTypeAtLocation(propertyOwner);
        var target = parsedData.checker.typeToString(type).split('<')[0];
        if (target.split('typeof').length > 1) {
            target = target.split('typeof ')[1];
        }

        //console.log(propertyOwner.getText(), target, checker.typeToString(type));

        if (target == 'this') {
            target = className;
        }

        if (target == 'any') {
            target = propertyOwner.getText()+'(any)';
        }


        var lineAndPos = file.getLineAndCharacterOfPosition(node.getStart());
        //console.log(propertyOwner.getText(), target);
        return {
            text: `(${lineAndPos.line}:${lineAndPos.character}) ${file.text.split('\n')[lineAndPos.line]}\n
            Propert: ${node.getText()}\n
            Property owner: ${propertyOwner.getText()},
            Property owner: ${tokenKindName(propertyOwner.kind)}
            `,
            path: file.path,
            line: file.getLineAndCharacterOfPosition(node.getStart(file)).line.toString(),
            name: getIdentifierName(node),
            target: target
        }
    }

    function getIdentifierName(node:ts.Node) {
        var name = '';
        ts.forEachChild(node, (node) => {
            if (node.kind == ts.SyntaxKind.Identifier) {
                name = node.getText();
            }
        });
        return name;
    }

    function visitStructure(node:ts.Node, prefix = '') {
        console.log(prefix + tokenKindName(node.kind) + ": " + node.getText());
        ts.forEachChild(node, (node) => {
            visitStructure(node, prefix + '-');
        });
    }

    //TODO for now suspected sources are inherited/dynamic or non function properties, should be fixed
    function findMissingClassesAndProperties(info:IClass[]) {
        var classMap = {};
        for (var i = 0; i < info.length; i++) {
            var cls = info[i];
            classMap[cls.name] = cls;
        }

        for (var i = 0; i < info.length; i++) {
            var cls = info[i];
            var methodNames = Object.keys(cls.methods);
            for (var j = 0; j < methodNames.length; j++) {
                var methodName = methodNames[j];
                var method:IMethod = cls.methods[methodName];
                for (var k = 0; k < method.calls.length; k++) {
                    var call = method.calls[k];
                    if (!classMap.hasOwnProperty(call.target)) {
                        var missingClass:IClass = {
                            text: "",
                            name: call.target,
                            path: undefined,
                            line: undefined,
                            methods: Object.create(null)
                        }
                        info.push(missingClass);
                        classMap[call.target] = missingClass;
                    }
                    var targetClass = classMap[call.target];

                    if (!targetClass.methods[call.name]) {
                        var missingMethod:IMethod = {
                            text: '',
                            path: targetClass.path;
                        line:targetClass.line;
                        calls:[]
                    }
                        ;
                        targetClass.methods[call.name] = missingMethod;
                    }
                }
            }
        }
    }

    findMissingClassesAndProperties(info);
    writeFileSync('compiled/public/js/coupling_data.js', 'window.data = ' + JSON.stringify(info), 'UTF-8');
    var port = startServer();
    var childProcess = require('child_process');
    childProcess.exec(`start chrome http://localhost:${port}/couplings`);
}

const fileNames = process.argv.slice(2);
generateCouplingData(parse(fileNames));
console.log(fileNames);
