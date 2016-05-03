/// <reference path="typings/main.d.ts" />

import * as ts from "typescript";
import {parse, tokenKindName} from "./parse";
import {writeFileSync} from "fs";

const fileNames = process.argv.slice(2);
generateProjectData(parse(fileNames));
console.log(fileNames);


interface IProjectData {
    files:IFile[];
}

interface IFile {
    text:string;
    nodes:INode[];
    fileName: string;
    path:any;
}

interface INode {
    kind:string;
    type:string;
    start:IPos;
    end:IPos;
    children:INode[];
}

interface IPos {
    line:number;
    character:number;
}

function generateProjectData(parsedData:{
    sourceFiles:ts.SourceFile[],
    checker:ts.TypeChecker
}):void {
    var info:IProjectData = {
        files: []
    };
    for (const sourceFile of parsedData.sourceFiles) {
        var fileInfo:IFile = {
            text: sourceFile.text,
            path: sourceFile.path,
            fileName: sourceFile.fileName,
            nodes: []
        };
        ts.forEachChild(sourceFile, (node:ts.Node) => {
            fileInfo.nodes.push(visitNode(node, parsedData.checker, sourceFile));
        });
        info.files.push(fileInfo);
    }
    writeFileSync('projectData.js', 'window.data = ' + JSON.stringify(info), 'UTF-8');
}

function visitNode(node:ts.Node, checker:ts.TypeChecker, sourceFile:ts.SourceFile):INode {
    var info = collectNodeInfo(node, checker, sourceFile);
    ts.forEachChild(node, (childNode) => {
        info.children.push(visitNode(childNode, checker, sourceFile));
    });
    return info;
}

function collectNodeInfo(node:ts.Node, checker:ts.TypeChecker, sourceFile:ts.SourceFile):INode {
    var symbol = checker.getSymbolAtLocation(node);
    var type = symbol ? checker.getTypeOfSymbolAtLocation(symbol, node) : checker.getTypeAtLocation(node);
    var typeName

    try{
        typeName = checker.typeToString(type);
    } catch(e) {
        typeName = 'unknown';
    }


    return {
        kind: tokenKindName(node.kind),
        type: typeName,
        start: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)),
        end: sourceFile.getLineAndCharacterOfPosition(node.getEnd()),
        children: []
    };
}