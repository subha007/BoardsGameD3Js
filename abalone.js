(function(global, win, htmldoc){

    /* SVG Description */
    var SvgArea = function() {
        global.svgWidth = htmldoc.getElementById("svgwidth").value;
        global.svgHeight = htmldoc.getElementById("svgheight").value;
    }

    // Constructor
    var AbaloneBoard = function(){
        global.svgArea = new SvgArea();
        global.edgeCount = 6;
        global.circlesPerSide = htmldoc.getElementById("circlesPerSide").value;
        global.borderBeam = htmldoc.getElementById("borderbeam").value;
        global.radialLength = htmldoc.getElementById("radialwidth").value;
        global.cellGap = htmldoc.getElementById("cellradiusgap").value;

        global.isLockSvgSize = htmldoc.getElementById("svgaspectratiocheck").checked;
        global.isLockSvgAbalone = htmldoc.getElementById("svglockcalculatecheck").checked;
    }

    AbaloneBoard.prototype.initialize = function() {
        global.normalizeSvgLength = Math.min(global.svgWidth, global.svgHeight);
        global.svgWidth = global.svgHeight = global.normalizeSvgLength;
        global.origin = { x: global.svgWidth/2, y: global.svgHeight/2 };
        global.extAnglerad = Math.PI / global.edgeCount * 2;
        global.innerRadialLength = global.radialLength - global.borderBeam;
        global.xUnit = global.innerRadialLength / (2 * (global.circlesPerSide - 1) +
                        (1 / Math.sin(global.extAnglerad)));
        global.yUnit = global.xUnit * Math.tan(global.extAnglerad);
        global.cellRows = 2 * global.circlesPerSide - 1;
        global.cellCols = global.cellRows;

        // Arrays
        global.outerHexVertices = [];
        global.translationMatrix = [];
        global.cellPositions = [];
        global.positionText = [];

        /* Styles */
        global.svgBorderColor = htmldoc.getElementById("svgbordercolor").value;
        global.svgFill = htmldoc.getElementById("svgfill").value;
        global.svgBorderWidth = htmldoc.getElementById("svgborderwidth").value;
        global.outerBorderStroke = htmldoc.getElementById("outerborderstroke").value;
        global.outerBorderFill = htmldoc.getElementById("outerborderfill").value;
        global.outerBorderStrokeWidth = htmldoc.getElementById("outerborderstrokewidth").value;
        global.cellBorderStroke = htmldoc.getElementById("cellborderstroke").value;
        global.cellBorderFill = htmldoc.getElementById("cellborderfill").value;
        global.cellBorderStrokeWidth = htmldoc.getElementById("cellborderstrokewidth").value;
    }

    AbaloneBoard.prototype.render = function() {
        // If lock then set the width and height
        if(global.isLockSvgAbalone === true) {
            if(global.svgWidth / 2 <= global.radialLength) {
                global.radialLength = global.svgWidth / 2 - global.borderBeam;
                htmldoc.getElementById("radialwidth").value = global.radialLength;
            }
        }

        function calculatOuterHex() {
            for (var i = 0; i <= global.edgeCount; ++i) {
                global.outerHexVertices.push(global.origin.x
                            + global.radialLength * Math.cos((i) * global.extAnglerad));
                global.outerHexVertices.push(global.origin.y
                            + global.radialLength * Math.sin((i) * global.extAnglerad));
            }
        }

        function calculateTranslationMatrix() {
            for (var y = (-1) * (global.circlesPerSide - 1), indx1 = 0;
                    y <= (global.circlesPerSide - 1) ; ++y, indx1++) {

                var noOfCols = global.cellRows - Math.abs(y);
                var rowData = [];

                for (var x = (-1) * (noOfCols - 1), indx2 = 0;
                        x <= (noOfCols - 1) ; x += 2, indx2++) {
                    rowData.push({ x: x, y: y });
                }

                global.translationMatrix.push(rowData);
            }
        }

        function calculateCircleCentres() {
            for (var x = 0; x < global.translationMatrix.length; x++) {

                var rowData = [];
                for (var y = 0; y < global.translationMatrix[x].length; y++) {

                    rowData.push({
                        cx: global.origin.x + global.translationMatrix[x][y].x * global.xUnit,
                        cy: global.origin.y + global.translationMatrix[x][y].y * global.yUnit,
                        r: global.xUnit - global.cellGap
                    });
                }

                global.cellPositions.push(rowData);
            }
        }

        function calculateTextCentres() {

            // Get Row Numbers (Alphabets A to I)
            for (var x = 0; x < global.cellRows; x++) {

                global.positionText.push({
                    x: global.origin.x + global.translationMatrix[x][0].x * global.xUnit - global.borderbeam - global.xUnit,
                    y: global.origin.y + global.translationMatrix[x][0].y * global.yUnit,
                    value: 'A' + x
                });
            }
        }

        function draw() {
            d3.select(".abalone").select("svg").remove();

            var svg = d3.select(".abalone").append("svg")
                        .attr("class", "svgview")
                        .attr({ width: global.svgWidth, height: global.svgHeight });

            var svgborder = svg.append("rect")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("height", global.svgHeight)
                                .attr("width", global.svgWidth)
                                .style("strok   e", global.svgBorderColor)
                                .style("fill", global.svgFill)
                                .style("stroke-width", global.outerBorderStrokeWidth);

            var outerborder = svg.append("polygon")
                        .attr("class", "outerborder")
                        .attr("points", outerHexVertices.join())
                        .attr("stroke", global.outerBorderStroke)
                        .attr("fill", global.outerBorderFill)
                        .attr("stroke-width", global.outerBorderStrokeWidth);

            var cells = svg.append("g")
                           .selectAll("g")
                           .data(global.cellPositions)
                           .enter()
                           .append("g")
                           .selectAll("circle")
                           .data(function (d, i, j) { return d; })
                           .enter()
                           .append("circle")
                           ;
            var cellsattr = cells.attr("r", function (d) {
                                    return d.r;
                                })
                                 .attr("cx", function (d) {
                                     return d.cx;
                                 })
                                 .attr("cy", function (d) {
                                     return d.cy;
                                 })
                                 .attr("class", "cell")
                                 .attr("stroke", global.cellBorderStroke)
                                 .attr("fill", global.cellBorderFill)
                                 .attr("stroke-width", global.cellBorderStrokeWidth);

            var posTextList = svg.selectAll("g")
                             .data(global.positionText)
                             .enter()
                             .append("g")
                             .selectAll("text")
                             .data(function (d, i) { return d; })
                             .enter()
                             .append("text")
                             ;
            var posText = posTextList.attr("x", function(d) {
                                return d.x;
                            })
                            .attr("y", function(d) {
                                return d.y;
                            })
                            .text(function(d) {
                                return d.value;
                            });
        }

        calculatOuterHex();
        calculateTranslationMatrix();
        calculateCircleCentres();
        calculateTextCentres();
        draw();
    }

    // Events
    AbaloneBoard.prototype.svgwidth_onkeypress = function () {
        if(global.isLockSvgAbalone == true)
            htmldoc.getElementById("svgheight").value = global.svgWidth;
    }

    AbaloneBoard.prototype.svgheight_onkeypress = function() {
        if(global.isLockSvgAbalone == true)
            htmldoc.getElementById("svgheight").value = global.svgHeight;
    }

    AbaloneBoard.prototype.svg_lockaspectdata = function() {
        if(global.isLockSvgAbalone == true) {
            renderAbalone();
        }
    }

    global.onLoadHtml = function() {

        var renderAbalone = new AbaloneBoard();

        // export Class1 as entire module
        if (typeof module != 'undefined')
            module.exports = renderAbalone;
        else
            global.renderAbalone = renderAbalone;

        renderAbalone.initialize();
        renderAbalone.render();
    }

    window.onload = onLoadHtml;

})(this, window, document);
