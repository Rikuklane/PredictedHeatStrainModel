// Load dependencies
require('../lib/parameter_data_obj.js');
require('../lib/mean_rad_temp_obj.js');

describe('Mean Radiant Temperature Object', () => {
  describe('Mean radiant temperature calculations', () => {
    test('should calculate mean radiant temperature with forced convection', () => {
      const Tg = 30; // Globe temperature °C
      const Tair = 25; // Air temperature °C
      const emi = 0.95; // Emissivity
      const diam = 0.15; // Globe diameter m
      const v_air = 0.5; // Air velocity m/s
      
      const Trad = boj.mrad_obj.mean_radiant_temp(Tg, Tair, emi, diam, v_air);
      
      expect(Trad).toBeGreaterThan(Tair);
      expect(Trad).toBeLessThan(Tg + 10); // Reasonable bounds
    });

    test('should calculate mean radiant temperature with natural convection', () => {
      const Tg = 30;
      const Tair = 25;
      const emi = 0.95;
      const diam = 0.15;
      
      const Trad = boj.mrad_obj.mean_radiant_temp_natural_conv(Tg, Tair, emi, diam);
      
      expect(Trad).toBeGreaterThan(Tair);
      expect(Trad).toBeLessThan(Tg + 10);
    });

    test('should handle best try calculation method', () => {
      const Tg = 30;
      const Tair = 25;
      const emi = 0.95;
      const diam = 0.15;
      const v_air = 0.1; // Low velocity
      
      const Trad = boj.mrad_obj.mean_radiant_temp_best_try(Tg, Tair, emi, diam, v_air);
      
      expect(Trad).toBeGreaterThan(Tair);
      expect(Trad).toBeLessThan(Tg + 10);
    });
  });

  describe('Mean radiant temperature object interface', () => {
    let mradObj;

    beforeEach(() => {
      mradObj = new boj.mrad_obj.mean_rad_obj();
    });

    test('should create mean radiant temperature object', () => {
      expect(mradObj).toBeDefined();
      expect(typeof mradObj.get).toBe('function');
      expect(typeof mradObj.set).toBe('function');
    });

    test('should set and get globe temperature', () => {
      mradObj.set_tg(30);
      expect(mradObj.get('tg')).toBe(30);
    });

    test('should set and get air temperature', () => {
      mradObj.set_tair(25);
      expect(mradObj.get('tair')).toBe(25);
    });

    test('should set and get emissivity', () => {
      mradObj.set_emi(0.95);
      expect(mradObj.get('emi')).toBe(0.95);
    });

    test('should set and get diameter', () => {
      mradObj.set_diam(0.15);
      expect(mradObj.get('diam')).toBe(0.15);
    });

    test('should set and get air velocity', () => {
      mradObj.set_v_air(0.5);
      expect(mradObj.get('v_air')).toBe(0.5);
    });

    test('should calculate mean radiant temperature automatically', () => {
      mradObj.set_tg(30);
      mradObj.set_tair(25);
      mradObj.set_emi(0.95);
      mradObj.set_diam(0.15);
      mradObj.set_v_air(0.5);
      
      const Trad = mradObj.get('Trad');
      expect(Trad).toBeGreaterThan(25);
      expect(Trad).toBeLessThan(40);
    });
  });

  describe('Edge cases and validation', () => {
    test('should handle equal globe and air temperatures', () => {
      const Tg = 25;
      const Tair = 25;
      const emi = 0.95;
      const diam = 0.15;
      const v_air = 0.5;
      
      const Trad = boj.mrad_obj.mean_radiant_temp(Tg, Tair, emi, diam, v_air);
      
      expect(Trad).toBeCloseTo(Tair, 1);
    });

    test('should handle very high globe temperature', () => {
      const Tg = 60;
      const Tair = 25;
      const emi = 0.95;
      const diam = 0.15;
      const v_air = 0.5;
      
      const Trad = boj.mrad_obj.mean_radiant_temp(Tg, Tair, emi, diam, v_air);
      
      expect(Trad).toBeGreaterThan(Tair);
      expect(Trad).toBeLessThan(Tg + 5);
    });

    test('should handle very low air velocity', () => {
      const Tg = 30;
      const Tair = 25;
      const emi = 0.95;
      const diam = 0.15;
      const v_air = 0.01;
      
      const Trad = boj.mrad_obj.mean_radiant_temp_best_try(Tg, Tair, emi, diam, v_air);
      
      expect(Trad).toBeGreaterThan(Tair);
      expect(Trad).toBeLessThan(Tg + 10);
    });

    test('should handle different globe sizes', () => {
      const Tg = 30;
      const Tair = 25;
      const emi = 0.95;
      const v_air = 0.5;
      
      const TradSmall = boj.mrad_obj.mean_radiant_temp(Tg, Tair, emi, 0.10, v_air);
      const TradLarge = boj.mrad_obj.mean_radiant_temp(Tg, Tair, emi, 0.20, v_air);
      
      expect(TradSmall).toBeDefined();
      expect(TradLarge).toBeDefined();
      // Different sizes should give different results
      expect(Math.abs(TradSmall - TradLarge)).toBeGreaterThan(0);
    });

    test('should handle different emissivity values', () => {
      const Tg = 30;
      const Tair = 25;
      const diam = 0.15;
      const v_air = 0.5;
      
      const TradLowEmi = boj.mrad_obj.mean_radiant_temp(Tg, Tair, 0.5, diam, v_air);
      const TradHighEmi = boj.mrad_obj.mean_radiant_temp(Tg, Tair, 0.95, diam, v_air);
      
      expect(TradLowEmi).toBeDefined();
      expect(TradHighEmi).toBeDefined();
      // Different emissivity should give different results
      expect(Math.abs(TradLowEmi - TradHighEmi)).toBeGreaterThan(0);
    });
  });

  describe('Integration with PHS model', () => {
    test('should work with typical PHS input ranges', () => {
      // Typical indoor conditions
      const Trad = boj.mrad_obj.mean_radiant_temp(25, 22, 0.95, 0.15, 0.1);
      expect(Trad).toBeBetween(20, 30);
      
      // Typical outdoor conditions
      const TradOutdoor = boj.mrad_obj.mean_radiant_temp(45, 35, 0.95, 0.15, 1.0);
      expect(TradOutdoor).toBeBetween(30, 50);
      
      // Industrial conditions
      const TradIndustrial = boj.mrad_obj.mean_radiant_temp(60, 25, 0.95, 0.15, 0.3);
      expect(TradIndustrial).toBeBetween(25, 70);
    });
  });
});
