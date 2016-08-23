(function(global, win, htmldoc) {

  'use strict';

  /* Empty Constructor */
  var Helper = function() {
    return this;
  }

  /* Helper get methods */
  Helper.prototype.getValueById = function(id, defaultval, hdoc) {
    hdoc = hdoc || htmldoc;
    var ctrl = hdoc.getElementById(id);

    // Equivalent to if ( foo === null || foo === undefined )
    return (ctrl == null) ? defaultval : ctrl.value;
  }

  Helper.prototype.getCheckedById = function(id, defaultval, hdoc) {
    hdoc = hdoc || htmldoc;
    var ctrl = hdoc.getElementById(id);

    return (ctrl == null) ? defaultval : ctrl.checked;
  }

  /* Helper set methods */
  Helper.prototype.setValueById = function(id, val, hdoc) {
    hdoc = hdoc || htmldoc;
    var ctrl = hdoc.getElementById(id);

    if(!(ctrl == null))
      ctrl.value = val;
  }

  Helper.prototype.setCheckedById = function(id, val, hdoc) {
    hdoc = hdoc || htmldoc;
    var ctrl = hdoc.getElementById(id);

    if(!(ctrl == null))
      ctrl.checked = val;
  }

  global.helper = new Helper();

})(this, window, document);
