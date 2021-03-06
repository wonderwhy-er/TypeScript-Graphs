import {IClass} from "../middle/Metadata";

var cola = window['cola'];
var d3 = window['d3'];

(function () {
    var d3cola = cola
        .d3adaptor()
        .linkDistance(60)
        .avoidOverlaps(true);

    var outer = d3.select("body").append("svg")
        .attr("pointer-events", "all");


    var data:IClass[] = window['data'], nodeLookup = {};

    function start() {
        createCheckBoxes();
        parseDunnart(convertDataToGraph(data));
    }

    function convertDataToGraph(info) {
        var graph = {
            nodes: [],
            links: [],
            groups: [],
            constraints: []
        };


        var classMap = Object.create(null);
        //TODO move to typescript
        //TODO refactor to work with real objects instead of many arguments

        function getClass(cls) {
            if (!classMap[cls.name]) {
                var group = {
                    "leaves": [],
                    "style": "fill:#ffdd3c;fill-opacity:0.37254902000000001;stroke:#ffdd3c;stroke-opacity:1",
                    "padding": 10,
                    "label": cls.name,
                    "text": cls.text,
                    "path": cls.path,
                    "line": cls.line
                };
                graph.groups.push(group);

                var node = {
                    "label": cls.name,
                    "text": cls.text,
                    "type": 'class',
                    "group": cls.name,
                    "path": cls.path,
                    "line": cls.line,
                    "x": Math.random() * 1000 - 500,
                    "y": Math.random() * 1000 - 500,
                };
                var index = graph.nodes.push(node) - 1;
                group.leaves.push(index);
                var clsNode = classMap[cls.name] = Object.create(null);
                clsNode.group = group;
                clsNode.index = index;
                clsNode.node = node;
                clsNode.methods = Object.create(null);
            }
            return classMap[cls.name];
        }

        function addCall(clsDef, methodName, call, calledClass) {
            var target = getProperty(cls, methodName);
            var source = getProperty(calledClass, call.name);
            //console.log(callerClass, '.', callerMethod, '->', calledClass, '.', calledProperty);
            if (target && source) {
                graph.links.push({
                    target: source.index,
                    source: target.index,
                    label: call.text,
                    path: call.path,
                    line: call.line
                });
            }
        }

        function getProperty(clsDef, propertyName) {
            var clsNode = getClass(clsDef);
            var methodDef = clsDef.methods[propertyName];
            if (methodDef && !clsNode.methods[propertyName]) {
                var node = {
                    "label": propertyName,
                    "type": 'method',
                    "group": clsDef.name,
                    "text": methodDef.text,
                    "path": methodDef.path,
                    "line": methodDef.line,
                    "x": Math.random() * 1000 - 500,
                    "y": Math.random() * 1000 - 500
                };
                var index = graph.nodes.push(node) - 1;
                clsNode.group.leaves.push(index);
                clsNode.methods[propertyName] = {
                    node: node,
                    index: index
                };

                graph.links.push({
                    target: index,
                    source: clsNode.index,
                    text: methodDef.text,
                    path: methodDef.path,
                    line: methodDef.line
                });

                if (index == undefined) {
                    console.log('getProperty', arguments);
                }
            }
            return clsNode.methods[propertyName];
        }

        var res = '';

        var classDefMap = {};
        for (var i = 0; i < info.length; i++) {
            var cls = info[i];
            classDefMap[cls.name] = cls;
        }

        for (var i = 0; i < info.length; i++) {
            var cls = info[i];
            Object.keys(cls.methods).forEach(function (methodName) {
                cls.methods[methodName].calls.forEach(function (call) {
                    if (cls.name != call.target && checkboxes[cls.name] && checkboxes[cls.name].checked && checkboxes[call.target] && checkboxes[call.target].checked) {
                        addCall(cls, methodName, call, classDefMap[call.target]);
                    }
                });
            })
        }

        return graph;
    }

    var checkboxes:{[key:string]:HTMLInputElement} = {};

    function createCheckBoxes() {
        var search:HTMLInputElement = <HTMLInputElement>document.getElementById('search');
        var close = (<HTMLElement>document.querySelector('#search ~ i'));
        close.onclick = () => {
            search.value = '';
            search.onkeyup(undefined);
        };
        search.onkeyup = () => {
            var pattern = new RegExp(search.value);
            Object.keys(checkboxes).forEach((key) => {
                if(pattern.test(key)) {
                    checkboxes[key].parentElement.style.display = 'block';
                } else {
                    checkboxes[key].parentElement.style.display = 'none';
                }
            })
        };

        var controls = document.getElementsByClassName('controls')[0];
        document.getElementById('check').addEventListener('click', function () {
            var keys = Object.keys(checkboxes);
            keys.forEach(function (key) {
                if(!(checkboxes[key].parentElement.style.display =='none')) {
                    checkboxes[key].checked = true;
                }
            });
            rerender();
        });
        document.getElementById('uncheck').addEventListener('click', function () {
            var keys = Object.keys(checkboxes);
            keys.forEach(function (key) {
                if(!(checkboxes[key].parentElement.style.display == 'none')) {
                    checkboxes[key].checked = false;
                }
            });
            rerender();
        });
        for (var i = 0; i < data.length; i++) {
            var cls = data[i];
            var control = createCheckbox(cls.name, i);
            controls.appendChild(control);
            var checkbox = (<HTMLElement>control).querySelector('#group' + i);
            checkboxes[cls.name] = checkbox;
            checkbox.addEventListener('change', rerender);
        }
    }

    var previousGraph;

    function rerender() {
        var newGraph = convertDataToGraph(data);
        copyProps(newGraph, previousGraph);
        parseDunnart(newGraph);
        previousGraph = newGraph;
    }

    function copyProps(newGraph, oldGraph) {
        if (oldGraph) {
            var nodeMap = {};
            for (var i = 0; i < oldGraph.nodes.length; i++) {
                var node = oldGraph.nodes[i];
                nodeMap[node.label] = node;
            }
            var groupMap = {};
            for (var i = 0; i < oldGraph.groups.length; i++) {
                var group = oldGraph.groups[i];
                groupMap[group.label] = group;
            }
            for (var i = 0; i < newGraph.nodes.length; i++) {
                var node = newGraph.nodes[i];
                var oldNode = nodeMap[node.label];
                if (oldNode) {
                    node.x = oldNode.x;
                    node.y = oldNode.y;
                    node.width = oldNode.width;
                    node.height = oldNode.height;
                }
            }
            for (var i = 0; i < newGraph.groups.length; i++) {
                var group = newGraph.groups[i];
                var oldGroup = groupMap[group.label];
                if (oldGroup) {
                    group.x = oldGroup.x;
                    group.y = oldGroup.y;
                    group.width = oldGroup.width;
                    group.height = oldGroup.height;
                }
            }
        }
    }

    function openInWebStorm(d) {
        if (d.path && d.line) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", `/webstorm?path=${encodeURIComponent(d.path)}&line=${encodeURIComponent(d.line)}`);
            xmlHttp.send();
        }
    }

    function createCheckbox(label, index) {
        var div = document.createElement('div');
        var html =
            `<li>
        <input name="${label}" id='group${index}' type='checkbox' checked value="${label}">
        <label for="group${index}">${label}</label>
        </li>`;

        div.innerHTML = html;
        return div.firstChild;
    }

    var startScale = 1;
    var startPosition = [700, 350];

    function parseDunnart(graph) {
        outer.selectAll("*").remove();

        function redraw() {
            startPosition = d3.event.translate;
            startScale = d3.event.scale;
            vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }


        outer.append('rect')
            .attr('class', 'background')
            .attr('width', "100%")
            .attr('height', "100%")
            .call(d3.behavior.zoom().scale(startScale).translate(startPosition).on("zoom", redraw));


        var vis = outer
            .append('g')
            .attr("transform", "translate(" + startPosition + ")" + " scale(" + startScale + ")");
        //.attr('transform', 'translate(800,400) scale(0.7)');

        var groupsLayer = vis.append("g");
        var nodesLayer = vis.append("g");
        var linksLayer = vis.append("g");

        d3cola
            .nodes(graph.nodes)
            .links(graph.links)
            .groups(graph.groups)
            .constraints(graph.constraints)
            .jaccardLinkLengths(20, 0.1)
            .avoidOverlaps(true)
            .start();


        // define arrow markers for graph links
        outer.append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 5)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5L2,0')
            .attr('stroke-width', '0px')
            .attr('fill', '#000');

        var group = groupsLayer.selectAll(".group")
            .data(graph.groups)
            .enter().append("rect")
            .attr("rx", 8).attr("ry", 8)
            .attr("class", "group")
            .on('click', function (d) {
                if (d3.event.ctrlKey) {
                    openInWebStorm(d);
                }
            })
            .on("dblclick", function (d, i) {
                checkboxes[d.label].checked = !checkboxes[d.label].checked;
                rerender();
            })
            .attr("style", function (d) {
                return d.style;
            }).call(d3cola.drag);

        var link = linksLayer.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .on('click', function (d) {
                if (d3.event.ctrlKey) {
                    openInWebStorm(d);
                }
            })
            .attr("class", "link");


        link.append("title")
            .text(function (d) {
                return d.label;
            });

        var margin = 12, pad = 24;
        var node = nodesLayer.selectAll(".node")
            .data(graph.nodes)
            .enter().append("rect")
            .attr("class", "node")
            .on('click', function (d) {
                if (d3.event.ctrlKey) {
                    openInWebStorm(d);
                }
            })
            .attr("width", function (d) {
                return d.width + 2 * pad + 2 * margin;
            })
            .attr("height", function (d) {
                return d.height + 2 * pad + 2 * margin;
            })
            .attr("rx", function (d) {
                return d.rx;
            }).attr("ry", function (d) {
                return d.rx;
            })
            .call(d3cola.drag);


        var label = nodesLayer.selectAll(".label")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", "label")
            .on('click', function (d) {
                if (d3.event.ctrlKey) {
                    openInWebStorm(d);
                }
            })
            .call(d3cola.drag);

        var insertLinebreaks = function (d) {
            var el = d3.select(this);
            var words = d.label.split(' ');
            el.text('');

            for (var i = 0; i < words.length; i++) {
                var tspan = el.append('tspan').text(words[i]);
                tspan.attr('x', 0).attr('dy', '15')
                    .attr("font-size", d.type == 'class' ? 14 : 12)
                    .attr("font-weight", d.type == 'class' ? 'bold' : 'normal');
            }
        };

        label.each(insertLinebreaks);

        node.append("title")
            .text(function (d) {
                //console.log(d);
                return d.text;
            });

        label.append("title")
            .text(function (d) {
                //console.log(d);
                return d.text;
            });

        d3cola.on("tick", function () {
            node.each(function (d) {
                d.innerBounds = d.bounds.inflate(-margin);
            });
            link.each(function (d) {
                d.route = cola.vpsc.makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, 5);
                if (isIE())  this.parentNode.insertBefore(this, this);
            });

            link.attr("x1", function (d) {
                    return d.route.sourceIntersection.x;
                })
                .attr("y1", function (d) {
                    return d.route.sourceIntersection.y;
                })
                .attr("x2", function (d) {
                    return d.route.arrowStart.x;
                })
                .attr("y2", function (d) {
                    return d.route.arrowStart.y;
                })
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', function (d) {
                    return d.source.type == 'class' || d.target.type == 'class' ? '2,2' : '';
                })

            label.each(function (d) {
                var b = this.getBBox();
                d.width = b.width + 2 * margin + 8;
                d.height = b.height + 2 * margin + 8;
            });

            node.attr("x", function (d) {
                    return d.innerBounds.x;
                })
                .attr("y", function (d) {
                    return d.innerBounds.y;
                })
                .attr("width", function (d) {
                    return d.innerBounds.width();
                })
                .attr("height", function (d) {
                    return d.innerBounds.height();
                });

            group
                .attr("x", function (d) {
                    return d.bounds.x + pad / 2;
                })
                .attr("y", function (d) {
                    return d.bounds.y + pad / 2;
                })
                .attr("width", function (d) {
                    return d.bounds.width() - pad;
                })
                .attr("height", function (d) {
                    return d.bounds.height() - pad;
                });

            label.attr("transform", function (d) {
                return "translate(" + d.x + margin + "," + (d.y + margin - d.height / 2) + ")";
            });
        });
    }

    function isIE() {
        return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
    }

    window.document.body.onload = start;

})();