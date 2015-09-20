# Double Chart JS

This is a little library to show rows and columns of an HTML table as
Google Charts. When applied to a table, each row and column header
will be transformed into a link, that when clicked will show a line
graph of the contents of that row or column in a google chart.

## Usage

Include <code>doublechart.js</code> in your page and put `iframe.js`
and `iframe.html` as sibling files. After loading your page call
`load`. See the example in `doublechart.html`.

## Example

http://jeffpalm.com/doublechartjs/doublechart.html

## Options

** `DoubleChart.ConfigKeys.AUTO_LOAD`: Automatically select the first
   row and column after calling `load`. Defaults to `false`.
** `DoubleChart.ConfigKeys.SELECTED_ROW_CLASS_NAME`: The class name to use
   for selected rows. Defaults to `doublechart-row-selected`.
** `DoubleChart.ConfigKeys.SELECTED_COL_CLASS_NAME`: The class name to use
   for selected column. Defaults to `doublechart-col-selected`.

For more, see `doublechart.js`.
