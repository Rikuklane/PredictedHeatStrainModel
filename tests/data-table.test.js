/**
 * Data Table Tests
 */

const { createContext, loadModules, TestRunner, assert, assertEqual, assertClose } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Data Table Tests');

runner.test('Data table creation and manipulation', () => {
    const tab = context.boj.data_table_obj.new_data_table();
    tab.add_column('time', null, 0);
    tab.add_column('value', null, 2);
    
    tab.data_in_row([[0, 1.234], [1, 2.345], [2, 3.456]]);
    
    assertEqual(tab.data.length, 3, 'Should have 3 data rows');
    assertEqual(tab.data[0][0], 0, 'First row time should be 0');
    assertClose(tab.data[0][1], 1.234, 0.001, 'First row value should be 1.234');
});

runner.test('Data table CSV export', () => {
    const tab = context.boj.data_table_obj.new_data_table();
    tab.add_column('Time', null, 0);
    tab.add_column('Value', null, 2);
    
    tab.data_in_row([[0, 1.23], [1, 2.34]]);
    const csv = tab.to_csv();
    
    assert(csv.includes('Time'), 'CSV should include Time column');
    assert(csv.includes('Value'), 'CSV should include Value column');
    assert(csv.includes('1.23'), 'CSV should include data');
});

runner.test('Data table integration with simulation', () => {
    const table = context.boj.data_table_obj.new_data_table();
    table.add_column('Time', null, 0);
    table.add_column('Core_Temp', null, 2);
    table.add_column('Skin_Temp', null, 2);
    
    const simData = [
        [0, 37.0, 33.5],
        [30, 37.2, 34.1],
        [60, 37.4, 34.3]
    ];
    
    table.data_in_row(simData);
    const csv = table.to_csv();
    
    assert(csv.includes('Time'), 'CSV should include time column');
    assert(csv.includes('37.0'), 'CSV should include temperature data');
    assert(csv.includes('34.1'), 'CSV should include skin temperature data');
});

runner.test('Data table column management', () => {
    const table = context.boj.data_table_obj.new_data_table();
    assert(table !== undefined, 'Data table should be created');
    assert(Array.isArray(table.column), 'Table should have column array');
    assertEqual(table.column.length, 0, 'Table should start with no columns');
    
    table.add_column('test_col1', null, 2);
    table.add_column('test_col2', null, 3);
    assertEqual(table.column.length, 2, 'Table should have 2 columns');
    assertEqual(table.column[0].name, 'test_col1', 'First column name should be correct');
    assertEqual(table.column[1].name, 'test_col2', 'Second column name should be correct');
});

runner.test('Data table row data input', () => {
    const table = context.boj.data_table_obj.new_data_table();
    table.add_column('col1', null, 2);
    table.add_column('col2', null, 3);
    
    const testData = [
        [1.234, 2.567],
        [3.891, 4.234],
        [5.123, 6.789]
    ];
    
    table.data_in_row(testData);
    assertEqual(table.data, testData, 'Data should be stored correctly');
    assertEqual(table.rowdata, true, 'Row data flag should be set');
    assertEqual(table.row_nof, 3, 'Row count should be correct');
});

runner.test('Data table column data input', () => {
    const table = context.boj.data_table_obj.new_data_table();
    table.add_column('col1', null, 2);
    table.add_column('col2', null, 3);
    
    const testData = [
        [1.234, 3.891, 5.123],
        [2.567, 4.234, 6.789]
    ];
    
    table.data_in_col(testData);
    assertEqual(table.data, testData, 'Column data should be stored correctly');
    assertEqual(table.rowdata, false, 'Row data flag should be false for column data');
    assertEqual(table.row_nof, 3, 'Row count should be correct');
});

const results = runner.run();
runner.summary();

module.exports = results;
