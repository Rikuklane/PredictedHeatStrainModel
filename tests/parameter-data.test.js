/**
 * Parameter Data Object Tests
 */

const { createContext, loadModules, TestRunner, assert, assertEqual, assertClose } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Parameter Data Object Tests');

runner.test('Integer parameter creation', () => {
    const swarm = context.boj.par_data_object.new_par_swarm('test');
    const storage = {test_int: 0};
    const spec = [['test_int', 'int', function() { return storage.test_int; }, function(val) { storage.test_int = val; }, {def_val: 0}]];
    swarm.create_parameter(spec);
    const value = swarm.get_pid('test_int');
    assert(value !== undefined, 'Parameter should be created');
});

runner.test('Integer parameter value setting', () => {
    const swarm = context.boj.par_data_object.new_par_swarm('test');
    const storage = {test_int: 0};
    const spec = [['test_int', 'int', function() { return storage.test_int; }, function(val) { storage.test_int = val; }, {def_val: 0}]];
    swarm.create_parameter(spec);
    swarm.set_pid('test_int', 42);
    const value = swarm.get_pid('test_int');
    assertEqual(value, 42, 'Integer value should be set correctly');
});

runner.test('Float parameter value setting', () => {
    const swarm = context.boj.par_data_object.new_par_swarm('test');
    const storage = {test_float: 0.0};
    const spec = [['test_float', 'float', function() { return storage.test_float; }, function(val) { storage.test_float = val; }, {def_val: 0.0}]];
    swarm.create_parameter(spec);
    swarm.set_pid('test_float', 3.14159);
    const value = swarm.get_pid('test_float');
    assertClose(value, 3.14159, 0.00001, 'Float value should be set correctly');
});

runner.test('String parameter value setting', () => {
    const swarm = context.boj.par_data_object.new_par_swarm('test');
    const storage = {test_string: ''};
    const spec = [['test_string', 'string', function() { return storage.test_string; }, function(val) { storage.test_string = val; }, {def_val: ''}]];
    swarm.create_parameter(spec);
    swarm.set_pid('test_string', 'Hello World');
    const value = swarm.get_pid('test_string');
    assertEqual(value, 'Hello World', 'String value should be set correctly');
});

runner.test('Boolean parameter value setting', () => {
    const swarm = context.boj.par_data_object.new_par_swarm('test');
    const storage = {test_bool: false};
    const spec = [['test_bool', 'bool', function() { return storage.test_bool; }, function(val) { storage.test_bool = val; }, {def_val: false}]];
    swarm.create_parameter(spec);
    swarm.set_pid('test_bool', true);
    const value = swarm.get_pid('test_bool');
    assertEqual(value, true, 'Boolean value should be set correctly');
});

const results = runner.run();
runner.summary();

module.exports = results;
