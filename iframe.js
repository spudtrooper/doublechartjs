function buildParams() {
  var hash = document.location.hash || '#';
  var parts = hash.substring(1).split('&');
  var res = {};
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i];
    var pairParts = pair.split('=');
    var left = pairParts[0];
    var right = null;
    if (pairParts.length == 2) {
      try {
	right = JSON.parse(unescape(pairParts[1]));
      } catch (e) {
	// Allow for regular strings.
	right = pairParts[1];
      }
    }
    res[left] = right;
  }
  return res;
}

function getParam(key, params, defaultValue) {
  return (key in params) ? params[key] : defaultValue;
}

function drawChart() {
  var params = buildParams();

  var title = getParam(Constants.Internal.TITLE, params, 'Title');
  var xAxisTitle = getParam(Constants.Internal.X_AXIS_TITLE, params, 'Time');
  var yAxisTitle = getParam(Constants.Internal.Y_AXIS_TITLE, params, 'Value');
  var backgroundColor = getParam(Constants.Graph.BACKGROUND_COLOR, params, 
				 '#ffffff');
  var rowType = getParam(Constants.Graph.ROW_TYPE, params, 'number');
  var colType = getParam(Constants.Graph.COL_TYPE, params, 'number');

  function coerceValue(value, type) {
    if (type == 'number') {
      return parseFloat(value);
    }
    return String(value);
  };

  var rows = getParam(Constants.Internal.ROWS, params,  [
    // Example data taken from:
    // https://developers.google.com/chart/interactive/docs/gallery/linechart
    [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
    [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
    [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
    [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
    [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
    [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
    [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
    [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
    [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
    [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
    [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
    [66, 70], [67, 72], [68, 75], [69, 80]
  ]).map(function(pair) {
    var left = coerceValue(pair[0], rowType);
    var right = coerceValue(pair[1], colType);
    return [left, right];
  });

  var data = new google.visualization.DataTable();
  data.addColumn(rowType, 'X');
  data.addColumn(colType, yAxisTitle);
  
  data.addRows(rows);
  
  var options = {
    hAxis: {
      title: xAxisTitle
    },
    vAxis: {
      title: yAxisTitle
    },
    backgroundColor: backgroundColor,
    title: title
  };
  
  var chart = new google.visualization.LineChart(
    document.getElementById('chart'));
  chart.draw(data, options);
}
