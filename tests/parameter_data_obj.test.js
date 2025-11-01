// Load dependencies
require('../lib/parameter_data_obj.js');

describe('Parameter Data Object', () => {
  describe('Integer parameter', () => {
    let intParam;

    beforeEach(() => {
      intParam = new boj.par_data_object.Par_int('test_int');
    });

    test('should create integer parameter', () => {
      expect(intParam.pid).toBe('test_int');
    });

    test('should set and get integer values', () => {
      intParam.set(42);
      expect(intParam.get()).toBe(42);
    });

    test('should validate integer input', () => {
      intParam.set(3.7); // Should be converted to integer
      expect(intParam.get()).toBe(3);
      
      intParam.set('123'); // Should convert string to integer
      expect(intParam.get()).toBe(123);
    });

    test('should handle invalid input', () => {
      intParam.set('invalid');
      expect(isNaN(intParam.get())).toBe(true);
    });

    test('should format as string', () => {
      intParam.set(42);
      expect(intParam.as_string()).toBe('42');
    });

    test('should format as CSV', () => {
      intParam.set(42);
      expect(intParam.as_csv()).toBe('42');
    });
  });

  describe('Float parameter', () => {
    let floatParam;

    beforeEach(() => {
      floatParam = new boj.par_data_object.Par_float('test_float');
    });

    test('should create float parameter', () => {
      expect(floatParam.pid).toBe('test_float');
    });

    test('should set and get float values', () => {
      floatParam.set(3.14159);
      expect(floatParam.get()).toBeCloseTo(3.14159, 5);
    });

    test('should convert string to float', () => {
      floatParam.set('2.71828');
      expect(floatParam.get()).toBeCloseTo(2.71828, 5);
    });

    test('should handle decimal places in formatting', () => {
      floatParam.set(3.14159);
      floatParam.dec_nof = 2;
      expect(floatParam.as_string()).toBe('3.14');
    });

    test('should format as CSV with correct decimals', () => {
      floatParam.set(3.14159);
      floatParam.dec_nof = 3;
      expect(floatParam.as_csv()).toBe('3.142');
    });
  });

  describe('String parameter', () => {
    let stringParam;

    beforeEach(() => {
      stringParam = new boj.par_data_object.Par_string('test_string');
    });

    test('should create string parameter', () => {
      expect(stringParam.pid).toBe('test_string');
    });

    test('should set and get string values', () => {
      stringParam.set('Hello World');
      expect(stringParam.get()).toBe('Hello World');
    });

    test('should convert numbers to strings', () => {
      stringParam.set(123);
      expect(stringParam.get()).toBe('123');
    });

    test('should format as string', () => {
      stringParam.set('test');
      expect(stringParam.as_string()).toBe('test');
    });
  });

  describe('Boolean parameter', () => {
    let boolParam;

    beforeEach(() => {
      boolParam = new boj.par_data_object.Par_bool('test_bool');
    });

    test('should create boolean parameter', () => {
      expect(boolParam.pid).toBe('test_bool');
    });

    test('should set and get boolean values', () => {
      boolParam.set(true);
      expect(boolParam.get()).toBe(true);
      
      boolParam.set(false);
      expect(boolParam.get()).toBe(false);
    });

    test('should convert various inputs to boolean', () => {
      boolParam.set(1);
      expect(boolParam.get()).toBe(true);
      
      boolParam.set(0);
      expect(boolParam.get()).toBe(false);
      
      boolParam.set('true');
      expect(boolParam.get()).toBe(true);
    });
  });

  describe('Parameter group', () => {
    let paramGroup;

    beforeEach(() => {
      paramGroup = new boj.par_data_object.Par_anygrp('test_group');
    });

    test('should create parameter group', () => {
      expect(paramGroup.id).toBe('test_group');
    });

    test('should check if PID is in group', () => {
      paramGroup.pid_arr = ['param1', 'param2', 'param3'];
      expect(paramGroup.is_pid('param1')).toBe(true);
      expect(paramGroup.is_pid('param4')).toBe(false);
    });

    test('should get all PIDs', () => {
      paramGroup.pid_arr = ['param1', 'param2'];
      expect(paramGroup.pid_all()).toEqual(['param1', 'param2']);
    });
  });

  describe('Parameter swarm', () => {
    let paramSwarm;

    beforeEach(() => {
      paramSwarm = new boj.par_data_object.Par_swarm('test_swarm');
    });

    test('should create parameter swarm', () => {
      expect(paramSwarm.id).toBe('test_swarm');
    });

    test('should create parameters from specification', () => {
      const spec = [
        ['int_param', 'int', function() { return 42; }, function(val) { return val; }],
        ['float_param', 'float', function() { return 3.14; }, function(val) { return val; }]
      ];
      
      paramSwarm.create_parameter(spec);
      expect(paramSwarm.is_pid('int_param')).toBe(true);
      expect(paramSwarm.is_pid('float_param')).toBe(true);
    });
  });
});
