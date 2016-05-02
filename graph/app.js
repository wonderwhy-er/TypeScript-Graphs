var d3cola = cola.d3adaptor()
    .linkDistance(60)
    .avoidOverlaps(true);

var outer = d3.select("body").append("svg")
    .attr("pointer-events", "all");




var data = window.data, nodeLookup = {};
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

    function getClass(className, label) {
        if (!classMap[className]) {
            var group = {
                "leaves": [],
                "style": "fill:#ffdd3c;fill-opacity:0.37254902000000001;stroke:#ffdd3c;stroke-opacity:1",
                "padding": 10,
                "label": className
            };
            graph.groups.push(group);

            var node = {
                "label": className,
                "text": label,
                "type": 'class',
                "group": className
            };
            var index = graph.nodes.push(node) - 1;
            group.leaves.push(index);
            var cls = classMap[className] = Object.create(null);
            cls.group = group;
            cls.index = index;
            cls.node = node;
            cls.methods = Object.create(null);
        }
        return classMap[className];
    }

    function addCall(callerClass, callerMethod, calledClass, calledProperty, callLabel, callerLabel, calledLabel, callerClassText, calledClassText) {
        var target = getProperty(callerClass, callerMethod, callerLabel, callerClassText);
        var source = getProperty(calledClass, calledProperty, calledLabel, calledClassText);
        //console.log(callerClass, '.', callerMethod, '->', calledClass, '.', calledProperty);
        graph.links.push({
            target: source.index,
            source: target.index,
            label: callLabel
        });
    }

    function getProperty(className, propertyName, text, classLabel) {
        var cls = getClass(className, classLabel);
        if (!cls.methods[propertyName]) {
            var node = {
                "label": propertyName,
                "text": text,
                "type": 'method',
                "group": className
            };
            var index = graph.nodes.push(node) - 1;
            cls.group.leaves.push(index);
            cls.methods[propertyName] = {
                node: node,
                index: index
            };

            graph.links.push({
                target: index,
                source: cls.index
            });

            if (index == undefined) {
                console.log('getProperty', arguments);
            }
        }
        return cls.methods[propertyName];
    }

    var res = '';
    for (var i = 0; i < info.length; i++) {
        var cls = info[i];
        Object.keys(cls.methods).forEach(function (key) {
            cls.methods[key].calls.forEach(function (call) {
                if (cls.name != call.target && checkboxes[cls.name].checked && checkboxes[call.target].checked) {
                    addCall(cls.name, key, call.target, call.name, call.text, cls.methods[key].text, '', cls.text, '');
                }
            });
        })
    }

    return graph;
}
var checkboxes = {};

function createCheckBoxes() {
    var controls = document.getElementsByClassName('controls')[0];
    var control = createCheckbox('all', 'all');
    controls.appendChild(control);
    control.addEventListener('change', function () {
        var keys = Object.keys(checkboxes);
        var check = !checkboxes[keys[0]].checked;
        keys.forEach(function (key) {
            checkboxes[key].checked = check;
        });
        rerender();
    });
    for (var i = 0; i < data.length; i++) {
        var cls = data[i];
        var control = createCheckbox(cls.name, i);
        controls.appendChild(control);
        var checkbox = control.querySelector('#group' + i);
        checkboxes[cls.name] = checkbox;
        checkbox.addEventListener('change', rerender);
    }
}

var previousGraph;
function rerender() {
    var newGraph = convertDataToGraph(data);
    copyProps(newGraph,previousGraph);
    parseDunnart(newGraph);
    previousGraph = newGraph;
}

function copyProps(newGraph,oldGraph) {
    if(oldGraph) {
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
            if(oldNode) {
                node.x = oldNode.x;
                node.y = oldNode.y;
                node.width = oldNode.width;
                node.height = oldNode.height;
            }
        }
        for (var i = 0; i < newGraph.groups.length; i++) {
            var group = newGraph.groups[i];
            var oldGroup = groupMap[group.label];
            if(oldGroup) {
                group.x = oldGroup.x;
                group.y = oldGroup.y;
                group.width = oldGroup.width;
                group.height = oldGroup.height;
            }
        }
    }
}

function createCheckbox(label, index) {
    var div = document.createElement('div');
    var html =
        `<span>
        <input name="${label}" id='group${index}' type='checkbox' checked value="${label}">
        <label for="${label}">${label}</label>
        </span>`;

    div.innerHTML = html;
    return div.firstChild;
}

function parseDunnart(graph) {
    outer.selectAll("*").remove();

    function redraw() {
        vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }


    outer.append('rect')
        .attr('class', 'background')
        .attr('width', "100%")
        .attr('height', "100%")
        .call(d3.behavior.zoom().on("zoom", redraw));

    var vis = outer
        .append('g')
        .attr('transform', 'translate(800,400) scale(0.7)');

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