/**
 * @param {!Object} config An object whose keys are from 
 * {@link DoubleGraphs.ConfigKeys}.
 */
DoubleChart = function(config) {
  /** @private @final {string} */
  this.rowPaneId_ = assertSet(config, DoubleChart.ConfigKeys.ROW_PANE_ID);
  /** @private @final {string} */
  this.colPaneId_ = assertSet(config, DoubleChart.ConfigKeys.COL_PANE_ID);
  /** @private @final {string} */
  this.tableId_ = assertSet(config, DoubleChart.ConfigKeys.TABLE_ID);
  /** @private @final {boolean} */
  this.autoLoad_ = getOption(config, DoubleChart.ConfigKeys.AUTO_LOAD, false);
  /** @private @final {string} */
  this.rowsTitle_ = getOption(config, DoubleChart.ConfigKeys.ROWS_TITLE, 'Row');
  /** @private @final {string} */
  this.colsTitle_ = getOption(
    config, DoubleChart.ConfigKeys.COLS_TITLE, 'Column');
  /** @private @final {string} */
  this.selectedRowClassName_ = getOption(
    config, DoubleChart.ConfigKeys.SELECTED_ROW_CLASS_NAME, 
    'doublechart-row-selected');
  /** @private @final {string} */
  this.selectedColClassName_ = getOption(
    config, DoubleChart.ConfigKeys.SELECTED_COL_CLASS_NAME, 
    'doublechart-col-selected');
  /** @private @final {string} */
  this.chartWidth_ = getOption(
    config, DoubleChart.ConfigKeys.CHART_WIDTH, '400px');
  /** @private @final {string} */
  this.chartHeight_ = getOption(
    config, DoubleChart.ConfigKeys.CHART_WIDTH, '320px');
};

/**
 * @enum {string} Keys used in the config object passed in the constructor.
 */
DoubleChart.ConfigKeys = {
  'ROW_PANE_ID': 'rowPaneId',
  'COL_PANE_ID': 'colPaneId',
  'TABLE_ID': 'tableId',
  'AUTO_LOAD': 'autoLoad',
  'ROWS_TITLE': 'rowsTitle',
  'COLS_TITLE': 'colsTitle',
  'SELECTED_ROW_CLASS_NAME': 'selectedRowClassName',
  'SELECTED_COL_CLASS_NAME': 'selectedColClassName',
  'CHART_WIDTH': 'chartWidth',
  'CHART_HEIGHT': 'chartHeight'
};

/**
 * Constants used by the iframe.
 */
Constants = {
  /**
   * Constants between the user and the iframe.
   */
  Graph: {
    BACKGROUND_COLOR: 'bgcolor',
  },
  /**
   * Constants between DoubleChart and the iframe.
   */
  Internal: {
    ROWS: 'rows',
    Y_AXIS_TITLE: 'yaxis',
    X_AXIS_TITLE: 'xaxis',
    TITLE: 'title'
  }
};

/**
 * Adds links to show the charts.
 */
DoubleChart.prototype.load = function() {
  var tableEl = document.getElementById(this.tableId_);
  var table = new Table_().init(tableEl);
  var numRows = table.getNumRows();
  var numCols = table.getNumCols();
  var rowEls = table.getRowKeyElements();
  var colEls = table.getColKeyElements();
  var rowKeyStrings = colEls.map(text);
  var colKeyStrings = rowEls.map(text);
  
  // Add links for showing charts for the rows.
  for (var i = 0; i < rowEls.length; i++) {
    this.addChartLink_(this.autoLoad_ && i == 0,
		       rowEls[i], 
		       rowKeyStrings, 
		       table.getRowElementsByIndex(i),
		       document.getElementById(this.rowPaneId_),
		       this.colsTitle_,
		       this.rowsTitle_, 
		       this.rowsTitle_ + ' = ' + text(rowEls[i]),
		       this.selectedRowClassName_);
  }

  // Add links for showing charts for the columns.
  for (var i = 0; i < colEls.length; i++) {
    this.addChartLink_(this.autoLoad_ && i == 0,
		       colEls[i], 
		       colKeyStrings, 
		       table.getColElementsByIndex(i),
		       document.getElementById(this.colPaneId_), 
		       this.rowsTitle_,
		       this.colsTitle_,
		       this.colsTitle_ + ' = ' + text(colEls[i]),
		       this.selectedColClassName_);
  }
};

/**
 * @param {boolean} autoLoad
 * @param {!Element} el
 * @param {!Array.<string>} keyValues
 * @param {!Element} valueEls
 * @param {!Element} targetEl The element that will hold the new graph.
 * @param {string} xAxisTitle
 * @param {string} yAxisTitle
 * @param {string} title
 * @param {string} selectedClassName
 * @private
 */
DoubleChart.prototype.addChartLink_ = function(autoLoad, el, keyValues, 
					       valueEls, targetEl, xAxisTitle,
					       yAxisTitle, title,
					       selectedClassName) {
  var a = document.createElement('a');
  a.href = '#' + keyValues.join('_') + valueEls.map(text).join('_');
  a.innerHTML = String(el.innerHTML);
  removeChildren(el);
  el.appendChild(a);
  var thiz = this;
  var thunk = function(e) {
    thiz.drawChart_(el, keyValues, valueEls, targetEl, xAxisTitle, yAxisTitle, 
		    title, selectedClassName);
  };
  a.addEventListener('click', thunk);
  if (autoLoad) {
    thunk();
  }
};

/**
 * @param {!Element} el
 * @param {!Array.<string>} keyValues
 * @param {!Array.<!Element>} valueEls
 * @param {!Element} targetEl The element that will hold the new graph.
 * @param {string} xAxisTitle
 * @param {string} yAxisTitle
 * @param {string} title
 * @param {string} selectedClassName
 * @private
 */
DoubleChart.prototype.drawChart_ = function(el, keyValues, valueEls, targetEl, 
					     xAxisTitle, yAxisTitle, title,
					     selectedClassName) {
  removeChildren(targetEl);
  var iframe = document.createElement('iframe');

  var values = valueEls.map(text);

  assert(keyValues.length == values.length,
	 keyValues + ' length != ' + values + ' length');

  var rows = [];
  for (var i = 0, N = keyValues.length; i < N; i++ ) {
    rows.push([keyValues[i], values[i]]);
  }
  var params = [
    createParam(Constants.Internal.ROWS, rows),
    createParam(Constants.Internal.X_AXIS_TITLE, xAxisTitle),
    createParam(Constants.Internal.Y_AXIS_TITLE, yAxisTitle),
    createParam(Constants.Internal.TITLE, title),
  ];

  var src = 'iframe.html#' + params.join('&');
  iframe.src = src;
  iframe.style.width = this.chartWidth_;
  iframe.style.height = this.chartHeight_;
  iframe.style.border = '0';
  targetEl.style.display = null;
  targetEl.appendChild(iframe);

  // Remove the previous selection.
  removeAllClass(selectedClassName);

  // Add the new selection.
  addClass(el, selectedClassName);
  for (var i = 0; i < valueEls.length; i++) {
    addClass(valueEls[i], selectedClassName);
  }
};


/**
 * A table with row keys, column keys, and a 2d array of values taken from
 * an HTML table.
 */
Table_ = function() {
  /** @private @final {!Array.<!Array.<!Element>>} */
  this.rowsOfElementRows_ = [];
  /** @private @final {!Array.<!Element>} */
  this.colKeyElementRows_ = [];
  /** @private @final {!Array.<!Element>} */
  this.rowKeyElementRows_ = [];
};

/**
 * @return {!Table} This instance.
 */
Table_.prototype.init = function(tableEl) {
  // Find the column keys.
  var trs = tableEl.getElementsByTagName('tr');
  var tr = trs[0];
  var tds = tr.getElementsByTagName('td');
  if (!tds || !tds.length) {
    tds = tr.getElementsByTagName('th');
  }
  for (var i = 1; i < tds.length; i++) {
    this.colKeyElementRows_.push(tds[i]);
  }

  // Find the row keys.
  for (var i = 1; i < trs.length; i++) {
    var tr = trs[i];
    var tds = tr.getElementsByTagName('td');
    this.rowKeyElementRows_.push(tds[0]);
  }

  // Find the values.
  for (var i = 1; i < trs.length; i++) {
    var tr = trs[i];
    var tds = tr.getElementsByTagName('td');
    var row = [];
    for (var j = 1; j < tds.length; j++) {
      row.push(tds[j]);
    }
    this.rowsOfElementRows_.push(row);
  }

  return this;
};


/**
 * @param {string} row
 * @param {String} col
 * @return {!Element}
 */
Table_.prototype.getElement = function(row, col) {
  var colIndex = this.colKeyElementRows_.indexOf(col);
  var rowIndex = this.rowKeyElementRows_.indexOf(row);
  return this.getElementByIndex(rowIndex, colIndex);
};

/**
 * @param {string} rowIndex
 * @param {String} colIndex
 * @return {!Element}
 */
Table_.prototype.getElementByIndex = function(rowIndex, colIndex) {
  return this.rowsOfElementRows_[rowIndex][colIndex];
};

/** @return {number} */
Table_.prototype.getNumRows = function() {
  return this.rowsOfElementRows_.length;
};

/** @return {number} */
Table_.prototype.getNumCols = function() {
  return !this.rowsOfElementRows_.length 
    ? 0 
    : this.rowsOfElementRows_[0].length
};

/**
 * @param {number} rowIndex
 * @return {!Element}
 */
Table_.prototype.getRowKeyElementByIndex = function(rowIndex) {
  return this.rowKeyElementRows_[rowIndex];
};

/**
 * @param {number} colIndex
 * @return {!Element}
 */
Table_.prototype.getColKeyElementByIndex = function(colIndex) {
  return this.colKeyElementRows_[colIndex];
};

/**
 * @param {number} rowIndex
 * @return {!Array.<!Element>}
 */
Table_.prototype.getRowElementsByIndex = function(rowIndex) {
  return this.rowsOfElementRows_[rowIndex];
};

/**
 * @param {number} colIndex
 * @return {!Array.<!Element>}
 */
Table_.prototype.getColElementsByIndex = function(colIndex) {
  var res = [];
  var numRows = this.getNumRows();
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    var row = this.rowsOfElementRows_[rowIndex];
    res.push(row[colIndex]);
  }
  return res;
};

/**
 * @return {!Array.<!Element>}
 */
Table_.prototype.getRowKeyElements = function(rowIndex) {
  return this.rowKeyElementRows_;
};

/**
 * @return {!Array.<!Element>}
 */
Table_.prototype.getColKeyElements = function(colIndex) {
  return this.colKeyElementRows_;
};

function assertSet(config, key) {
  assert(key in config, key + ' must be set in ' + config);
  return config[key];
};

function getOption(config, key, defaultValue) {
  return (key in config) ? config[key] : defaultValue;
}

function removeChildren(el) {
  while (el.childNodes.length) {
    el.removeChild(el.childNodes[0]);
  }
}

function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}

function createParam(key, value) {
  return key + '=' + escape(JSON.stringify(value));
}

function text(el) {
  return el.innerHTML;
}

function removeAllClass(className) {
  function removeAll(tag) {
    var els = document.getElementsByTagName(tag);
    for (var i = 0; i < els.length; i++) {
      removeClass(els[i], className);
    }
  }
  removeAll('td');
  removeAll('th');
}

function removeClass(el, className) {
  var classParts = (el.className || '').split(' ');
  var newClassParts = [];
  for (var i = 0; i < classParts.length; i++) {
    if (classParts[i] != className) {
      newClassParts.push(classParts[i]);
    }
  }
  el.className = newClassParts.join(' ').trim();
}

function addClass(el, className) {
  var classParts = (el.className || '').split(' ');
  if (classParts.indexOf(className) < 0) {
    classParts.push(className);
    el.className = classParts.join(' ');
  }
}
