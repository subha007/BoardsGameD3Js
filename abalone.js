(function(global, win, htmldoc){

  'use strict';

  // Constructor
  var AbaloneBoard = function(){
    // Composition
    this.svg_area = new global.SvgArea();

    // Private variables
    this.abaloneBoardThis = this;
    this.edgeCount = 6;
    this.circlesPerSide = 5;
    this.borderBeam = 10;
    this.radialLength = 210;
    this.cellGap = 0;
    this.isLockSvgSize = true;
    this.isLockSvgAbalone = true;
    this.cellRows = 0;
    this.cellCols = 0;
    this.xUnit = 0;
    this.yUnit = 0;

    this.outerBorderStroke = "#00c299";
    this.outerBorderFill = "#00c299";
    this.outerBorderStrokeWidth = "5";
    this.cellBorderStroke = "black";
    this.cellBorderFill = "#00c299";
    this.cellBorderStrokeWidth = "5";
    this.textBoardMarkerFont = "sans-serif";
    this.textBoardMarkerFontSize = "12";
    this.cellsIndexFont = "sans-serif";
    this.cellsIndexFontSize = "12";

    this.origin = this.svg_area.getCenter();
    this.extAnglerad = 0;
    this.innerRadialLength = 0;

    // temporary Private variables not to be exposed
    // Arrays
    this.outerHexVertices = [];
    this.translationMatrix = [];
    this.cellPositions = [];
    this.positionText = [];
    this.cellIndices = [];
    this.playerPositionMatrix = [];
    this.playerPositionIndices = [];

    return this;
  }

  /* Private Methods  */
  var reloadPropertiesFromControls = function() {
    this.circlesPerSide = parseInt(global.helper.getValueById("circlesPerSide", this.circlesPerSide), 10);
    this.borderBeam = global.helper.getValueById("borderbeam", this.borderBeam);
    this.radialLength = global.helper.getValueById("radialwidth", this.radialLength);
    this.cellGap = global.helper.getValueById("cellradiusgap", this.cellGap);
    this.isLockSvgSize = global.helper.getCheckedById("svgaspectratiocheck", this.isLockSvgSize);
    this.isLockSvgAbalone = global.helper.getCheckedById("svglockcalculatecheck", this.isLockSvgAbalone);
  };

  var reloadStyleFromControls = function() {
    this.outerBorderStroke = global.helper.getValueById("outerborderstroke", this.outerBorderStroke);
    this.outerBorderFill = global.helper.getValueById("outerborderfill", this.outerBorderFill);
    this.outerBorderStrokeWidth = global.helper.getValueById("outerborderstrokewidth", this.outerBorderStrokeWidth);
    this.cellBorderStroke = global.helper.getValueById("cellborderstroke", this.cellBorderStroke);
    this.cellBorderFill = global.helper.getValueById("cellborderfill", this.cellBorderFill);
    this.cellBorderStrokeWidth = global.helper.getValueById("cellborderstrokewidth", this.cellBorderStrokeWidth);
  };

  var calculatedFromVariables = function() {
    this.extAnglerad = Math.PI / this.edgeCount * 2;
    this.innerRadialLength = this.radialLength - this.borderBeam;
    this.xUnit = this.innerRadialLength / (2 * (this.circlesPerSide - 1) +
                    (1 / Math.sin(this.extAnglerad)));
    this.yUnit = this.xUnit * Math.tan(this.extAnglerad);
    this.cellRows = 2 * this.circlesPerSide - 1;
    this.cellCols = this.cellRows;
  };

  /* Public methods */
  AbaloneBoard.prototype.initialize = function() {
      this.svg_area.initialize();

      if(this.isLockSvgSize === true)
        this.svg_area.normalize();

      this.origin = this.svg_area.getCenter();

      // Initialize AbaloneBoard
      reloadPropertiesFromControls.bind(this)();
      reloadStyleFromControls.bind(this)();
      calculatedFromVariables.bind(this)();
  }

  AbaloneBoard.prototype.render = function() {
      // If lock then set the width and height
      if(this.isLockSvgAbalone === true) {
          if(this.svg_area.getRadialWidth() <= this.radialLength) {
              this.radialLength = this.svg_area.getRadialWidth() - this.borderBeam;
              global.helper.setValueById("radialwidth", this.radialLength);
          }
      }

      function calculatOuterHex() {
          for (var i = 0; i <= this.edgeCount; ++i) {
              this.outerHexVertices.push(this.origin.x
                          + this.radialLength * Math.cos((i) * this.extAnglerad));
              this.outerHexVertices.push(this.origin.y
                          + this.radialLength * Math.sin((i) * this.extAnglerad));
          }
      }

      function calculateTranslationMatrix() {
          for (var y = (-1) * (this.circlesPerSide - 1), indx1 = 0;
                  y <= (this.circlesPerSide - 1) ; ++y, indx1++) {

              var noOfCols = this.cellRows - Math.abs(y);
              var rowData = [];

              for (var x = (-1) * (noOfCols - 1), indx2 = 0;
                      x <= (noOfCols - 1) ; x += 2, indx2++) {
                  rowData.push({ x: x, y: y });
              }

              this.translationMatrix.push(rowData);
          }
      }

      function calculateCircleCentres() {
        var indexCell = 0;
        for (var x = 0; x < this.translationMatrix.length; x++) {

            var rowData = [];
            for (var y = 0; y < this.translationMatrix[x].length; y++) {

                rowData.push({
                    cx: this.origin.x + this.translationMatrix[x][y].x * this.xUnit,
                    cy: this.origin.y + this.translationMatrix[x][y].y * this.yUnit,
                    r: this.xUnit - this.cellGap,
                    cellIndex: indexCell++
                });
            }

            this.cellPositions.push(rowData);
        }
      }

      function calculateTextCentres() {

          // Get Row Numbers (Alphabets A to I) for top to bottom and left
          // X Axis is on the next/previous circle stop with the border into consideration
          // Y axis 'this.xUnit / 4' is to place the text at the center position when the y of translationMatrix is +ve
          // Else it seems to be out of place. hence it is placed slightly off the center by quarter of the xUnit
          for (var x = 0; x < this.cellRows; x++) {
              this.positionText.push({
                  x: this.origin.x + this.translationMatrix[x][0].x * this.xUnit - 2 * this.xUnit,
                  y: this.origin.y + this.translationMatrix[x][0].y * this.yUnit ,
                  value: String.fromCharCode('A'.charCodeAt() + x)
              });
          }

          // Calculate Column Ids
          // Top left start (Only Top portion)
          for(var y = 0; y < this.translationMatrix[0].length; ++y) {
            this.positionText.push({
              x: this.origin.x + this.translationMatrix[0][y].x * this.xUnit,
              y: this.origin.y + this.translationMatrix[0][y].y * this.yUnit - 2 * this.xUnit,
              value: y
            });
          }

          // Top left start (Only Right portion)
          for(var x = 0; x < this.circlesPerSide; ++x) {
            this.positionText.push({
              x: this.origin.x + this.translationMatrix[x][this.translationMatrix[x].length - 1].x * this.xUnit + 2 * this.xUnit,
              y: this.origin.y + this.translationMatrix[x][this.translationMatrix[x].length - 1].y * this.yUnit ,
              value: x + parseInt(this.circlesPerSide, 10)
            });
          }
      }

      function calculate2PlayerInitialMatrix() {

        // Player 1
        var x = 0;
        for(; x < this.circlesPerSide - 3; ++x) {
          for(var y = 0; y < this.translationMatrix[x].length; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 1});
          }
        }
        //last row
        if(this.circlesPerSide - 3 > 0) {
          for(var y = this.circlesPerSide - 3; y < this.circlesPerSide; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 1});
          }
        }

        // PLayer 2
        x = this.cellRows - 1;
        for(; x >= this.cellRows - (this.circlesPerSide - 3); --x) {
          for(var y = 0; y < this.translationMatrix[x].length; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
        }

        // Last row
        if(this.circlesPerSide - 3 > 0) {
          for(var y = this.circlesPerSide - 3; y < this.circlesPerSide; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
        }
      }

      function calculate3PlayerInitialMatrix() {

        var yextent = (((this.circlesPerSide % 2 !== 0)? this.circlesPerSide + 1 : this.circlesPerSide) - 4) / 2 + 1;

        // Player 1 (top left)
        for(var x = 0; x < this.circlesPerSide; ++x) {
          for(var y = 0; y < yextent; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 1});
          }
        }

        //Residue
        var county = yextent - 1;
        for(var x = this.circlesPerSide, count = 0; count < yextent; ++x, count++) {
          for(var y = 0; y < county; ++y) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 1});
          }
          county--;
        }

        // Player 2 (top right)
        for(var x = 0; x < this.circlesPerSide; ++x) {
          for(var y = this.translationMatrix[x].length - 1, count = 0; count < yextent; --y, count++) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
        }

        //Residue
        var county = yextent - 1;
        for(var x = this.circlesPerSide, count = 0; count < yextent; ++x, count++) {
          for(var y = this.translationMatrix[x].length - 1, indxy = 0; indxy < county; --y, indxy++) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
          county--;
        }

        // Player 3 (top right)
        for(var x = this.cellRows - 1, countx = 0; countx < yextent; --x, countx++) {
          for(var y = 0; y < this.translationMatrix[x].length; y++) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
        }

        //Residue
        var county = yextent - 1;
        for(var x = this.cellRows - 1, count = 0; count < yextent; --x, count++) {
          for(var y = this.translationMatrix[x].length - 1, indxy = 0; indxy < county; --y, indxy++) {
            this.playerPositionIndices.push({x: x, y: y, playerId: 2});
          }
          county--;
        }
      }

      function calculatePlayerInitialPositions() {
        for(var i = 0; i < this.playerPositionIndices.length; ++i) {
          this.playerPositionMatrix.push({
            cx: this.origin.x + this.translationMatrix[this.playerPositionIndices[i].x][this.playerPositionIndices[i].y].x * this.xUnit,
            cy: this.origin.y + this.translationMatrix[this.playerPositionIndices[i].x][this.playerPositionIndices[i].y].y * this.yUnit,
            r: this.xUnit - this.cellGap - 6,
            playerId: this.playerPositionIndices[i].player
          })
        }
      }

      function draw() {
          d3.select(".abalone").select("svg").remove();

          var svg = d3.select(".abalone").append("svg")
                      .attr("class", "svgview")
                      .attr("width", this.svg_area.getWidth())
                      .attr("height", this.svg_area.getHeight());

          var svgborder = svg.append("rect")
                              .attr("x", 0)
                              .attr("y", 0)
                              .attr("height", this.svg_area.getHeight())
                              .attr("width", this.svg_area.getWidth())
                              .style("stroke", this.svg_area.getBorderColor())
                              .style("fill", this.svg_area.getFill())
                              .style("stroke-width", this.svg_area.getBorderWidth());

          var outerborder = svg.append("polygon")
                      .attr("class", "outerborder")
                      .attr("points", this.outerHexVertices.join())
                      .attr("stroke", this.outerBorderStroke)
                      .attr("fill", this.outerBorderFill)
                      .attr("stroke-width", this.outerBorderStrokeWidth);

          var cells = svg.append("g")
                         .selectAll("g")
                         .data(this.cellPositions)
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
                               .attr("stroke", this.cellBorderStroke)
                               .attr("fill", this.cellBorderFill)
                               .attr("stroke-width", this.cellBorderStrokeWidth);

           var playerPieces = svg.append("g")
                                 .selectAll("g")
                                 .data(this.playerPositionMatrix)
                                 .enter()
                                 .append("circle")
                                 ;
           var playerPiecesAttr = playerPieces.attr("r", function (d) {
                                   return d.r;
                               })
                                .attr("cx", function (d) {
                                    return d.cx;
                                })
                                .attr("cy", function (d) {
                                    return d.cy;
                                })
                                .attr("class", "cell")
                                .attr("stroke", this.cellBorderStroke)
                                .attr("fill", "#00ffee")
                                .attr("stroke-width", this.cellBorderStrokeWidth);

           var cellsIndices = svg.append("g")
                          .selectAll("g")
                          .data(this.cellPositions)
                          .enter()
                          .append("g")
                          .selectAll("text")
                          .data(function (d, i, j) { return d; })
                          .enter()
                          .append("text")
                          ;
           var cellsIndicesAttr = cellsIndices.attr("x", function(d) {
                                     return d.cx;
                                 })
                                 .attr("y", function(d) {
                                     return d.cy;
                                 })
                                 .text(function(d) {
                                     return d.cellIndex;
                                 })
                                 .attr("font-family", this.cellsIndexFont)
                                 .attr("font-size", this.cellsIndexFontSize)
                                 .attr("text-anchor", "middle")
                                 .attr("alignment-baseline", "central")
                                 ;

          var posTextList = svg.append("g").selectAll("text")
                           .data(this.positionText)
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
                          })
                          .attr("font-family", this.textBoardMarkerFont)
                          .attr("font-size", this.textBoardMarkerFontSize)
                          .attr("text-anchor", "middle")
                          .attr("alignment-baseline", "central")
                          ;


      }

      calculatOuterHex.bind(this)();
      calculateTranslationMatrix.bind(this)();
      calculateCircleCentres.bind(this)();
      calculateTextCentres.bind(this)();
      calculate3PlayerInitialMatrix.bind(this)();
      calculatePlayerInitialPositions.bind(this)();
      draw.bind(this)();
  }

  // Events
  AbaloneBoard.prototype.svgwidth_onkeypress = function () {
      if(this.isLockSvgAbalone == true)
        global.helper.setValueById("svgheight", this.svgWidth);
  }

  AbaloneBoard.prototype.svgheight_onkeypress = function() {
      if(this.isLockSvgAbalone == true)
        global.helper.setValueById("svgwidth", this.svgHeight);
  }

  AbaloneBoard.prototype.svg_lockaspectdata = function() {
      if(this.isLockSvgAbalone == true) {
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
