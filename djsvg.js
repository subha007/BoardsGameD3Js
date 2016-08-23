(function(global, win, htmldoc) {

  'use strict';
  
  /* SVG Constructor */
  var SvgArea = function() {
      this.svgWidth = 500;
      this.svgHeight = 500;
      this.svgBorderColor = "#ffac39";
      this.svgFill = "none";
      this.svgBorderWidth = "3";
  }

  /* Private Methods  */
  var reloadPropertiesFromControls = function() {
    this.svgWidth = global.helper.getValueById("svgwidth", this.svgWidth);
    this.svgHeight = global.helper.getValueById("svgheight", this.svgHeight);
  };

  var reloadStyleFromControls = function() {
    this.svgBorderColor = global.helper.getValueById("svgbordercolor", this.svgBorderColor);
    this.svgFill = global.helper.getValueById("svgfill", this.svgFill);
    this.svgBorderWidth = global.helper.getValueById("svgborderwidth", this.svgBorderWidth);
  };

  var normalizeSvgArea = function() {
    this.svgWidth = this.svgHeight = Math.min(this.svgWidth, this.svgHeight);
  }

  /* Public methods */
  SvgArea.prototype.initialize = function() {
    reloadPropertiesFromControls.bind(this)();
    reloadStyleFromControls.bind(this)();
  };

  SvgArea.prototype.normalize = function () {
    normalizeSvgArea.bind(this)();
  };

  /* Setter */
  SvgArea.prototype.setWidth = function(width) {
    this.svgWidth = width;
  };

  SvgArea.prototype.setHeight = function(height) {
    this.svgHeight = height;
  };

  SvgArea.prototype.setBorderColor = function(borderColor) {
    this.svgBorderColor = borderColor;
  };

  SvgArea.prototype.setFill = function(fill) {
    this.svgFill = fill;
  };

  SvgArea.prototype.setBorderWidth = function(borderWidth) {
    this.svgBorderWidth = borderWidth;
  };

  /* Getter */
  SvgArea.prototype.getWidth = function() {
    return this.svgWidth;
  };

  SvgArea.prototype.getHeight = function() {
    return this.svgHeight;
  };

  SvgArea.prototype.getRadialWidth = function() {
    return this.svgWidth / 2;
  };

  SvgArea.prototype.getRadialHeight = function() {
    return this.svgHeight / 2;
  };

  SvgArea.prototype.getBorderColor = function() {
    return this.svgBorderColor;
  };

  SvgArea.prototype.getFill = function() {
    return this.svgFill;
  };

  SvgArea.prototype.getBorderWidth = function() {
    return this.svgBorderWidth;
  };

  SvgArea.prototype.getCenter = function() {
    return {x: this.getRadialWidth(), y: this.getRadialHeight()};
  }

  /* Set globally */
  global.SvgArea = SvgArea;

})(this, window, document);
