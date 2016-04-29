var d3cola = cola.d3adaptor()
    .linkDistance(60)
    .avoidOverlaps(true);

var outer = d3.select("body").append("svg")
    .attr("pointer-events", "all");

outer.append('rect')
    .attr('class', 'background')
    .attr('width', "100%")
    .attr('height', "100%")
    .call(d3.behavior.zoom().on("zoom", redraw));

var vis = outer
    .append('g')
    .attr('transform', 'translate(800,400) scale(0.7)');

function redraw() {
    vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

var groupsLayer = vis.append("g");
var nodesLayer = vis.append("g");
var linksLayer = vis.append("g");

var graph = window.data
    , nodeLookup = {};

for (var i = 0; i < graph.nodes.length; i++) {
    var node = graph.nodes[i];
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

function parseDunnart() {
    d3cola
        .nodes(graph.nodes)
        .links(graph.links)
        .groups(graph.groups)
        .constraints(graph.constraints)
        .jaccardLinkLengths(20, 0.1)
        .avoidOverlaps(true)
        .start();

    var controls = document.getElementsByClassName('controls')[0];
    var checkboxes = {};
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
    for (var i = 0; i < graph.groups.length; i++) {
        var group = graph.groups[i];
        var control = createCheckbox(group.label, i);
        controls.appendChild(control);
        var checkbox = control.querySelector('#group' + i);
        checkboxes[group.label] = checkbox;
        checkbox.addEventListener('change', rerender);
        for (var j = 0; j < group.leaves.length; j++) {
            var leave = group.leaves[j];
            leave.group = group.label;
        }
    }


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

    function rerender() {
        node.attr('style', function (d) {
            return checkboxes[d.group].checked ? 'display: inherit;' : 'display: none;';
        });
        link.attr('visibility', function (l) {
            return checkboxes[l.source.group].checked && checkboxes[l.target.group].checked ? 'visible' : 'hidden'
        });

        label.attr('style', function (d) {
            return checkboxes[d.group].checked ? 'display: inherit;' : 'display: none;';
        });
        group.attr('opacity', function (d) {
            return checkboxes[d.label].checked ? '1' : '0';
        });
    }

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
            .attr('stroke-dasharray', function(d) {
               return d.source.type=='class' || d.target.type =='class' ? '2,2' : '';
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
                return d.bounds.x+pad/2;
            })
            .attr("y", function (d) {
                return d.bounds.y+pad/2;
            })
            .attr("width", function (d) {
                return d.bounds.width()-pad;
            })
            .attr("height", function (d) {
                return d.bounds.height()-pad;
            });

        label.attr("transform", function (d) {
            return "translate(" + d.x + margin + "," + (d.y + margin - d.height / 2) + ")";
        });
    });
}
function isIE() {
    return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
}