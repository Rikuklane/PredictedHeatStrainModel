/**
 * Data Table Object Module
 * 
 * This module provides a comprehensive data table system for displaying and managing
 * tabular data in web applications. It's designed to handle simulation results,
 * input parameters, and time series data from the PHS (Predicted Heat Strain) model.
 * 
 * Key Features:
 * - Dynamic table creation and management
 * - HTML table generation with styling
 * - CSV export functionality
 * - Data validation and formatting
 * - Column configuration and customization
 * - Row and column data operations
 * 
 * Used for:
 * - Displaying simulation input parameters
 * - Showing time series physiological data
 * - Presenting final simulation results
 * - Exporting data for external analysis
 * - Creating data tables for user interfaces
 * 
 * Tables can handle various data types including:
 * - Numeric values with decimal precision
 * - Text parameters
 * - Time series data
 * - Simulation results and statistics
 * 
 * Copyright 2014 Bo Johansson. All rights reserved
 * Mail: bo(stop)johansson(at)lsn(stop)se
 */

"use strict;";

var boj = boj || {};

boj.data_table_obj = (function () {

  const html_frag = boj.html_fragment;

  // ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * DOM selector utility - finds first matching element
 * @param {string} selector - CSS selector string
 * @param {HTMLElement} el - Optional element to search within (defaults to document)
 * @returns {HTMLElement} First matching DOM element
 */
function $(selector, el) {
  if (!el) {
    el = document;
  }
  return el.querySelector(selector);
}

/**
 * DOM selector utility - finds all matching elements
 * @param {string} selector - CSS selector string
 * @param {HTMLElement} el - Optional element to search within (defaults to document)
 * @returns {Array} Array of matching DOM elements
 */
function $$(selector, el) {
  if (!el) {
    el = document;
  }
  return Array.prototype.slice.call(el.querySelectorAll(selector));
}

/**
 * JavaScript inheritance utility - sets up prototype inheritance
 * @param {Function} Child - Child constructor function
 * @param {Function} Parent - Parent constructor function
 */
function extend(Child, Parent) {
  Child.prototype = inherit(Parent.prototype);
  Child.prototype.constructor = Child;
  Child.o_par = Parent.prototype;
}

/**
 * Creates inheritance chain between objects
 * @param {Object} proto - Prototype object to inherit from
 * @returns {Object} New object inheriting from proto
 */
function inherit(proto) {
  function F() {
  }

  F.prototype = proto;
  return new F;
}

// ============================================================================
// DATA COLUMN MANAGEMENT
// ============================================================================

/**
 * Data Column Constructor
 * Represents a single column in a data table with its properties and formatting
 * @param {Object} pthis - Parent data table object
 * @param {string} name - Column name/heading
 * @param {number} col_ix - Column index (0-based)
 * @param {string} did - Data identifier for the column
 * @param {number} fix - Number of decimal places for numeric formatting
 */
function Data_column(pthis, name, col_ix, did, fix) {
  this.parent = pthis;
  this.name = name;
  this.col_ix = col_ix;
  this.data_id = did;
  this.fix = fix;
}

  function column_get_data(row_ix) {
    let data;
    if (this.parent.rowdata) {
      if (this.data_id) {
        data = this.parent.data[row_ix][this.data_id];
      } else {
        data = this.parent.data[row_ix][this.col_ix];
      }
    } else {
      data = this.parent.data[this.col_ix][row_ix];
    }
    return data;
  }

  //http://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/
  //http://www.adequatelygood.com/Object-to-Primitive-Conversions-in-JavaScript.html
  //http://samuli.hakoniemi.net/10-small-things-you-may-not-know-about-javascript/
  //http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/

  Data_column.prototype.to_string = function (row_ix) {
    let data = column_get_data.call(this, row_ix); // !! data is string
    if (typeof data === 'undefined') {
      data = '';
    } else if (typeof data === 'number' && isNaN(data)) {
      data = '';
    } else if (typeof data === 'string') {
    } else if (this.fix !== undefined) {
      if (typeof data === 'number' && typeof this.fix === 'number') {
        data = data.toFixed(this.fix);
      }
    } else {
      console.log('to_string', JSON.stringify(data));
    }
    return data;
  };

  Data_column.prototype.to_html_name = function (frag) {
    frag.add_tag('th');
    frag.add_txt(this.name);
  };

  Data_column.prototype.to_html_data = function (frag, row_ix) {
    frag.add_tag('td');
    const data = this.to_string(row_ix);
    frag.add_txt(data);
  };

  Data_column.prototype.to_csv_name = function () {
    return (this.name);
  };

  Data_column.prototype.to_csv_data = function (row_ix) {
    return this.to_string(row_ix);
  };

  // data column handling NaN =============================================

  function Data_column_nan(pthis, name, did, fix) { // constructor
    Data_column_nan.o_par.constructor.apply(this, arguments);
  }

  extend(Data_column_nan, Data_column);

  Data_column_nan.prototype.to_string = function (row_ix) {
    let data = column_get_data.call(this, row_ix);
    if (typeof data === 'undefined') {
      data = '';
    } else if (isNaN(data)) {
      data = 'NaN';
    } else if (typeof data === 'number' && isNaN(data)) {
      data = '';
    } else if (this.fix !== undefined) {
      if (typeof data === 'number' && typeof this.fix === 'number') {
        data = data.toFixed(this.fix);
      }
    } else {
      console.log('to_string', JSON.stringify(data));
    }
    return data;
  };

  // data table ===================================================

  function new_data_table() {
    return new Data_table();
  }

  function Data_table() { // constructor
    this.column = [];
    this.data = undefined;
    this.html_node = undefined;
  }

  Data_table.prototype.add_column = function (name, did, fix) {
    const col_ix = this.column.length;
    this.column.push(new Data_column(this, name, col_ix, did, fix));
    return this;
  };

  Data_table.prototype.add_column_nan = function (name, did, fix) {
    const col_ix = this.column.length;
    this.column.push(new Data_column(this, name, col_ix, did, fix));
    return this;
  };

  Data_table.prototype.data_in_row = function (data_arr_arr) {
    this.data = data_arr_arr;
    this.rowdata = true;
    this.row_nof = this.data.length;
  };

  Data_table.prototype.data_in_col = function (data_arr_arr) {
    this.data = data_arr_arr;
    this.rowdata = false;
    this.row_nof = this.data[0].length;
  };

  Data_table.prototype.html_taget_node = function (node) {
    this.html_node = node;
  };

  Data_table.prototype.html_target_selector = function (sel) {
    this.html_node = $(sel);
  };

  Data_table.prototype.html_target_id = function (id) {
    this.html_node = $('#' + id);
  };

  // generate html ---------------------------------------------

  function to_html_name_row(node) {
    //var node = this.html_tab;
    const node_tr = node.insertRow();
    node_tr.className = 'cname';
    const col = this.column;
    const frag = this.frag;
    for (let ix = 0; ix < col.length; ix++) {
      frag.current_node(node_tr);
      col[ix].to_html_name(frag);
    }
  }

  function to_html_data_row(row_ix, node) {
    //var node = this.html_tab;
    const node_tr = node.insertRow();
    if (!((row_ix + 1) % 5)) {
      node_tr.className += 'rim5';
    }
    if (!((row_ix + 1) % 10)) {
      node_tr.className += ' rim10';
    }
    const col = this.column;
    const frag = this.frag;
    for (let ix = 0; ix < col.length; ix++) {
      frag.current_node(node_tr);
      col[ix].to_html_data(frag, row_ix);
    }
  }

  Data_table.prototype.to_html_node = function (node, append) {
    const target = node || this.html_node;
    if (!target) {
      return;
    }
    this.frag = html_frag.new_html_fragment();
    const html_tab = this.frag.add_top_tag('table');
    to_html_name_row.call(this, html_tab);
    const nofdatarow = this.row_nof;
    for (let ix = 0; ix < nofdatarow; ++ix) {
      if (!((ix + 1) % 25)) {
        to_html_name_row.call(this, html_tab);
      }
      to_html_data_row.call(this, ix, html_tab);
    }
    this.frag.add_to_target(target, append);
  };

  // generate CSV, comma separated values

  // If a string has leading or trailing space,
  // contains a comma double quote or a newline
  // it needs to be quoted in CSV output
  const rx_need_quoting = /^\s|\s$|,|"|\n/;

  function string_as_csv(str) {
    str = str.replace(/"/g, '""');
    if (rx_need_quoting.test(str)) {
      str = '"' + str + '"';
    } else if (str === '') {
      //str = '""';
    }
    return str;
  }

  function to_csv_name_row(dst) {
    const res = [];
    this.column.map(function (col) {
      const txt = col.to_csv_name();
      res.push(string_as_csv(txt));
    });
    dst.push(res.join(','));
  }

  function to_csv_data_row(row_ix, dst) {
    const res = [];
    this.column.map(function (col) {
      const txt = col.to_csv_data(row_ix);
      if (txt === null) {
        res.push('');
      } else {
        res.push(string_as_csv(txt));
      }
    });
    dst.push(res.join(','));
  }

  Data_table.prototype.to_csv = function () {
    const res = [];
    to_csv_name_row.call(this, res);
    const nofdatarow = this.row_nof;
    for (let ix = 0; ix < nofdatarow; ++ix) {
      to_csv_data_row.call(this, ix, res);
    }
    return res.join('\n');
  };

  const self = {
    new_data_table: new_data_table
  };

  return self;
})();
