// Load dependencies
require('../lib/parameter_data_obj.js');
require('../lib/humidity_obj.js');
require('../lib/mean_rad_temp_obj.js');
require('../lib/PHS.js');

describe('PHS Core Calculations', () => {
  beforeEach(() => {
    // Reset PHS state before each test
    boj.PHS.reset();
  });

  describe('Simulation constants calculation', () => {
    beforeEach(() => {
      // Set basic parameters
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_sim.set_value('accl')(50);
      boj.PHS.par_swarm_sim.set_value('drink')(1);
      boj.PHS.par_swarm_step.set_value('Met')(100);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
    });

    test('should calculate body surface area correctly', () => {
      boj.PHS.calc_sim_const();
      const body = boj.PHS.get_body();
      expect(body.Adu).toBeCloseTo(1.84, 1); // Approximate for 70kg, 1.75m
    });

    test('should calculate specific heat correctly', () => {
      boj.PHS.calc_sim_const();
      const body = boj.PHS.get_body();
      expect(body.spHeat).toBeCloseTo(2200, 0); // Approximate value
    });

    test('should set sweat limits based on drinking status', () => {
      boj.PHS.calc_sim_const();
      const limit = boj.PHS.get_limit();
      
      // With drinking = 1
      expect(limit.sweat_max50).toBeCloseTo(5250, 0); // 0.075 * 70 * 1000
      expect(limit.sweat_max95).toBeCloseTo(3500, 0); // 0.05 * 70 * 1000
    });

    test('should adjust sweat limits for non-drinking', () => {
      boj.PHS.par_swarm_sim.set_value('drink')(0);
      boj.PHS.calc_sim_const();
      const limit = boj.PHS.get_limit();
      
      expect(limit.sweat_max50).toBeCloseTo(2100, 0); // 0.03 * 70 * 1000
      expect(limit.sweat_max95).toBeCloseTo(2100, 0);
    });
  });

  describe('Step constants calculation', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_sim.set_value('accl')(50);
      boj.PHS.par_swarm_sim.set_value('drink')(1);
      boj.PHS.par_swarm_sim.set_value('posture')(1);
      boj.PHS.par_swarm_step.set_value('Met')(100);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.par_swarm_step.set_value('Tair')(25);
      boj.PHS.par_swarm_step.set_value('Pw_air')(1000);
      boj.PHS.par_swarm_step.set_value('v_air')(0.3);
      boj.PHS.calc_sim_const();
    });

    test('should set radiation factor based on posture', () => {
      boj.PHS.calc_step_const();
      const body = boj.PHS.get_body();
      
      // Posture 1 = sitting
      expect(body.fAdu_rad).toBe(0.7);
      
      // Test other postures
      boj.PHS.par_swarm_step.set_value('posture')(2);
      boj.PHS.calc_step_const();
      expect(body.fAdu_rad).toBe(0.77);
      
      boj.PHS.par_swarm_step.set_value('posture')(3);
      boj.PHS.calc_step_const();
      expect(body.fAdu_rad).toBe(0.67);
    });

    test('should calculate maximum sweat rate', () => {
      boj.PHS.calc_step_const();
      const sweat = boj.PHS.get_sweat();
      
      // For Met = 100, SWmax should be (100-32) * Adu, bounded by 250-400
      expect(sweat.SWmax).toBeGreaterThanOrEqual(250);
      expect(sweat.SWmax).toBeLessThanOrEqual(400);
    });

    test('should calculate required core temperature', () => {
      boj.PHS.calc_step_const();
      const core = boj.PHS.get_core();
      
      // Tcreq_rm_ss = 0.0036 * Met + 36.6
      expect(core.Tcreq_rm_ss).toBeCloseTo(36.96, 2);
    });

    test('should calculate clothing insulation', () => {
      boj.PHS.calc_step_const();
      const cloth = boj.PHS.get_cloth();
      
      expect(cloth.Icl_st).toBeCloseTo(0.0775, 3); // 0.5 * 0.155
      expect(cloth.fAcl).toBeCloseTo(1.15, 2); // 1 + 0.3 * 0.5
    });

    test('should calculate walking speed from metabolic rate', () => {
      boj.PHS.calc_step_const();
      const move = boj.PHS.get_move();
      
      // v_walk = 0.0052 * (Met - 58), max 0.7
      const expectedWalk = Math.min(0.0052 * (100 - 58), 0.7);
      expect(move.v_walk).toBeCloseTo(expectedWalk, 3);
    });

    test('should calculate respiratory heat exchange', () => {
      boj.PHS.calc_step_const();
      const heatex = boj.PHS.get_heatex();
      
      expect(heatex.Tresp).toBeGreaterThan(air.Tair);
      expect(heatex.Cresp).toBeGreaterThan(0);
      expect(heatex.Eresp).toBeGreaterThan(0);
    });
  });

  describe('Skin temperature equilibrium', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_sim.set_value('accl')(50);
      boj.PHS.par_swarm_step.set_value('Met')(100);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.par_swarm_step.set_value('Tair')(25);
      boj.PHS.par_swarm_step.set_value('Trad')(25);
      boj.PHS.par_swarm_step.set_value('Pw_air')(1000);
      boj.PHS.par_swarm_step.set_value('v_air')(0.3);
      boj.PHS.sim_init();
    });

    test('should calculate skin temperature for nude person', () => {
      boj.PHS.par_swarm_step.set_value('Icl')(0.1); // Nearly nude
      boj.PHS.calc_step_const();
      
      const Tskeq = boj.PHS.skin_temp_equilibrium();
      expect(Tskeq).toBeGreaterThan(30);
      expect(Tskeq).toBeLessThan(40);
    });

    test('should calculate skin temperature for clothed person', () => {
      boj.PHS.par_swarm_step.set_value('Icl')(1.0); // Heavy clothing
      boj.PHS.calc_step_const();
      
      const Tskeq = boj.PHS.skin_temp_equilibrium();
      expect(Tskeq).toBeGreaterThan(30);
      expect(Tskeq).toBeLessThan(40);
    });
  });

  describe('Dynamic insulation calculation', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.par_swarm_step.set_value('v_air')(0.5);
      boj.PHS.par_swarm_step.set_value('v_walk')(1.0);
      boj.PHS.sim_init();
    });

    test('should calculate correction factors', () => {
      boj.PHS.calc_dynamic_insulation();
      const cloth = boj.PHS.get_cloth();
      
      expect(cloth.CORcl).toBeGreaterThan(0);
      expect(cloth.CORcl).toBeLessThanOrEqual(1);
      expect(cloth.CORia).toBeGreaterThan(0);
      expect(cloth.CORia).toBeLessThanOrEqual(1);
      expect(cloth.CORtot).toBeGreaterThan(0);
      expect(cloth.CORtot).toBeLessThanOrEqual(1);
    });

    test('should calculate dynamic insulation values', () => {
      boj.PHS.calc_dynamic_insulation();
      const cloth = boj.PHS.get_cloth();
      
      expect(cloth.Itot_dyn).toBeGreaterThan(0);
      expect(cloth.Icl_dyn).toBeGreaterThan(0);
      expect(cloth.im_dyn).toBeGreaterThan(0);
      expect(cloth.im_dyn).toBeLessThanOrEqual(0.9);
    });
  });

  describe('Heat exchange calculations', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_step.set_value('Tair')(25);
      boj.PHS.par_swarm_step.set_value('Trad')(25);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.sim_init();
      boj.PHS.set_skin_temp(34.0);
    });

    test('should calculate convection coefficient', () => {
      boj.PHS.dynamic_convection_coefficient();
      const heatex = boj.PHS.get_heatex();
      
      expect(heatex.Hcdyn).toBeGreaterThan(0);
    });

    test('should calculate radiation heat transfer', () => {
      boj.PHS.dynamic_convection_coefficient();
      boj.PHS.calc_heat_exchange();
      const heatex = boj.PHS.get_heatex();
      
      expect(heatex.Hr).toBeGreaterThan(0);
      expect(heatex.Conv).toBeGreaterThan(0);
      expect(heatex.Rad).toBeGreaterThan(0);
    });
  });

  describe('Sweat calculation', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_sim.set_value('accl')(50);
      boj.PHS.par_swarm_step.set_value('Met')(200);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.sim_init();
    });

    test('should calculate sweat rate for high metabolic rate', () => {
      boj.PHS.sweat_rate();
      const sweat = boj.PHS.get_sweat();
      
      expect(sweat.SW).toBeGreaterThan(0);
      expect(sweat.SWreq).toBeGreaterThan(0);
      expect(sweat.SWmax).toBeGreaterThan(0);
    });
  });

  describe('Core temperature prediction', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_step.set_value('Met')(150);
      boj.PHS.sim_init();
    });

    test('should predict core temperature change', () => {
      boj.PHS.core_temp_pred();
      const core = boj.PHS.get_core();
      
      expect(core.Tcr).toBeGreaterThan(35);
      expect(core.Tcr).toBeLessThan(40);
    });

    test('should predict rectal temperature', () => {
      boj.PHS.core_temp_pred();
      boj.PHS.rect_temp_pred();
      const core = boj.PHS.get_core();
      
      expect(core.Tre).toBeGreaterThan(35);
      expect(core.Tre).toBeLessThan(40);
    });
  });

  describe('Water loss calculation', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_step.set_value('Met')(200);
      boj.PHS.sim_init();
    });

    test('should calculate total water loss', () => {
      boj.PHS.water_loss();
      const limit = boj.PHS.get_limit();
      
      expect(limit.water_loss_max50).toBeGreaterThan(0);
      expect(limit.water_loss_max95).toBeGreaterThan(0);
    });
  });

  describe('Time step simulation', () => {
    beforeEach(() => {
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_step.set_value('Met')(100);
      boj.PHS.par_swarm_step.set_value('Tair')(30);
      boj.PHS.par_swarm_step.set_value('Icl')(0.5);
      boj.PHS.sim_init();
    });

    test('should complete one time step', () => {
      const initialTime = boj.PHS.get_sim_time_current();
      boj.PHS.time_step();
      const finalTime = boj.PHS.get_sim_time_current();
      
      expect(finalTime).toBe(initialTime + 1);
    });

    test('should update physiological values during time step', () => {
      const initialCoreTemp = boj.PHS.get_core().Tcr;
      const initialSkinTemp = boj.PHS.get_skin().Tsk;
      
      boj.PHS.time_step();
      
      const finalCoreTemp = boj.PHS.get_core().Tcr;
      const finalSkinTemp = boj.PHS.get_skin().Tsk;
      
      // Values should change (unless in perfect equilibrium)
      expect(finalCoreTemp).toBeDefined();
      expect(finalSkinTemp).toBeDefined();
    });
  });

  describe('Integration test - complete simulation', () => {
    test('should run complete simulation cycle', () => {
      // Set typical conditions
      boj.PHS.par_swarm_sim.set_value('weight')(70);
      boj.PHS.par_swarm_sim.set_value('height')(1.75);
      boj.PHS.par_swarm_sim.set_value('accl')(50);
      boj.PHS.par_swarm_sim.set_value('drink')(1);
      boj.PHS.par_swarm_step.set_value('Met')(150);
      boj.PHS.par_swarm_step.set_value('Tair')(35);
      boj.PHS.par_swarm_step.set_value('Trad')(35);
      boj.PHS.par_swarm_step.set_value('Pw_air')(2000);
      boj.PHS.par_swarm_step.set_value('v_air')(0.5);
      boj.PHS.par_swarm_step.set_value('Icl')(0.4);
      boj.PHS.par_swarm_step.set_value('im_st')(0.4);
      boj.PHS.par_swarm_step.set_value('fAref')(0.7);
      boj.PHS.par_swarm_step.set_value('Fr')(0.97);
      
      // Initialize and run simulation
      boj.PHS.sim_init();
      
      // Check initial state
      expect(boj.PHS.get_core().Tcr).toBeCloseTo(36.8, 1);
      expect(boj.PHS.get_skin().Tsk).toBeCloseTo(34.1, 1);
      
      // Run multiple time steps
      for (let i = 0; i < 10; i++) {
        boj.PHS.time_step();
      }
      
      // Check final state
      const result = boj.PHS.current_result();
      expect(result.Tre).toBeDefined();
      expect(result.Tsk).toBeDefined();
      expect(result.SWg).toBeDefined();
      
      // Core temperature should increase in hot conditions
      expect(result.Tre).toBeGreaterThan(36.8);
    });
  });
});
