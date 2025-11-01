// Load dependencies
require('../lib/parameter_data_obj.js');
require('../lib/humidity_obj.js');

describe('Humidity Object Functions', () => {
  let humidityObj;

  beforeEach(() => {
    humidityObj = new boj.humidity_obj.humidity_obj();
    humidityObj.set_patm(101325); // Standard atmospheric pressure
  });

  describe('Basic humidity calculations', () => {
    test('should calculate saturation pressure from temperature', () => {
      const pws = boj.humidity_obj.Pws_from_Tdb(25);
      expect(pws).toBeCloseTo(3167, 0); // Approximate value at 25°C
    });

    test('should calculate humidity ratio from pressure', () => {
      const pw = 2000; // Pa
      const patm = 101325; // Pa
      const w = boj.humidity_obj.W_from_Pw_Patm(pw, patm);
      expect(w).toBeGreaterThan(0);
      expect(w).toBeLessThan(1);
    });

    test('should calculate relative humidity from pressures', () => {
      const pw = 2000; // Pa
      const pwsat = 3000; // Pa
      const rh = boj.humidity_obj.rh_from_Pw_Pws(pw, pwsat);
      expect(rh).toBeCloseTo(66.67, 1);
    });

    test('should calculate water vapor pressure from humidity ratio', () => {
      const w = 0.01; // kg water/kg dry air
      const patm = 101325; // Pa
      const pw = boj.humidity_obj.Pw_from_W_Patm(w, patm);
      expect(pw).toBeCloseTo(1600, 0);
    });
  });

  describe('Humidity object interface', () => {
    test('should set and get dry bulb temperature', () => {
      humidityObj.set_tdb(25);
      expect(humidityObj.get('tdb')).toBe(25);
    });

    test('should set and get relative humidity', () => {
      humidityObj.set_rh(50);
      expect(humidityObj.get('rh')).toBe(50);
    });

    test('should set and get water vapor pressure', () => {
      humidityObj.set_pw(2000);
      expect(humidityObj.get('pw')).toBe(2000);
    });

    test('should calculate derived properties when setting inputs', () => {
      humidityObj.set_tdb(25);
      humidityObj.set_rh(50);
      
      // Should calculate pw, w, etc.
      expect(humidityObj.get('pw')).toBeGreaterThan(0);
      expect(humidityObj.get('w')).toBeGreaterThan(0);
    });
  });

  describe('Bisection method', () => {
    test('should find root of simple function', () => {
      // Find root of f(x) = x - 5
      const func = (x) => x - 5;
      const root = boj.humidity_obj.bisect(func, 0, 10, 0.001, 100);
      expect(root).toBeCloseTo(5, 2);
    });

    test('should handle quadratic function', () => {
      // Find root of f(x) = x^2 - 4
      const func = (x) => x * x - 4;
      const root = boj.humidity_obj.bisect(func, 0, 3, 0.001, 100);
      expect(root).toBeCloseTo(2, 2);
    });
  });

  describe('Range validation', () => {
    test('should clamp relative humidity to valid range', () => {
      const rhLow = boj.humidity_obj.rh_range(-10, 'clamp');
      expect(rhLow).toBe(0);
      
      const rhHigh = boj.humidity_obj.rh_range(150, 'clamp');
      expect(rhHigh).toBe(100);
    });

    test('should clamp humidity ratio to valid range', () => {
      const wLow = boj.humidity_obj.W_range(-0.001, 'clamp');
      expect(wLow).toBe(0);
      
      const wHigh = boj.humidity_obj.W_range(1, 'clamp');
      expect(wHigh).toBeLessThan(1);
    });
  });
});
