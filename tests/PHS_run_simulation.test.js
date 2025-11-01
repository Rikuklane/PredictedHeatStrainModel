// Load dependencies
require('../lib/parameter_data_obj.js');
require('../lib/humidity_obj.js');
require('../lib/mean_rad_temp_obj.js');
require('../lib/data_table_obj.js');
require('../lib/diagram_util.js');
require('../lib/PHS.js');
require('../lib/PHS_run_simulation.js');

describe('PHS Run Simulation', () => {
  let runSim;

  beforeEach(() => {
    runSim = new boj.PHS_run_sim.run_sim();
    
    // Set up basic parameters
    boj.PHS.par_swarm_sim.set_value('weight')(70);
    boj.PHS.par_swarm_sim.set_value('height')(1.75);
    boj.PHS.par_swarm_sim.set_value('accl')(50);
    boj.PHS.par_swarm_sim.set_value('drink')(1);
    boj.PHS.par_swarm_step.set_value('Met')(100);
    boj.PHS.par_swarm_step.set_value('Tair')(25);
    boj.PHS.par_swarm_step.set_value('Trad')(25);
    boj.PHS.par_swarm_step.set_value('Pw_air')(1000);
    boj.PHS.par_swarm_step.set_value('v_air')(0.3);
    boj.PHS.par_swarm_step.set_value('Icl')(0.5);
    boj.PHS.par_swarm_step.set_value('im_st')(0.4);
    boj.PHS.par_swarm_step.set_value('fAref')(0.7);
    boj.PHS.par_swarm_step.set_value('Fr')(0.97);
  });

  describe('Simulation configuration', () => {
    test('should create run simulation object', () => {
      expect(runSim).toBeDefined();
      expect(typeof runSim.run_simulation).toBe('function');
    });

    test('should set result time points', () => {
      const timePoints = [30, 60, 120, 240];
      runSim.result_time(timePoints);
      expect(runSim.result_time_arr).toEqual(timePoints);
    });

    test('should expand diagram x-axis', () => {
      runSim.diagram_x_expand(true);
      expect(runSim.diagram_x_expand_flag).toBe(true);
    });
  });

  describe('Data table operations', () => {
    test('should create simulation input data table', () => {
      const dtab = runSim.sim_inp_dtab_obj();
      expect(dtab).toBeDefined();
      expect(dtab.column.length).toBeGreaterThan(0);
    });

    test('should create step input data table', () => {
      const dtab = runSim.step_inp_dtab_obj();
      expect(dtab).toBeDefined();
      expect(dtab.column.length).toBeGreaterThan(0);
    });

    test('should create step log data table', () => {
      const dtab = runSim.step_log_dtab_obj();
      expect(dtab).toBeDefined();
      expect(dtab.column.length).toBeGreaterThan(0);
    });

    test('should create simulation result data table', () => {
      const dtab = runSim.sim_res_dtab_obj();
      expect(dtab).toBeDefined();
      expect(dtab.column.length).toBeGreaterThan(0);
    });

    test('should create simulation end result data table', () => {
      const dtab = runSim.sim_end_res_dtab_obj();
      expect(dtab).toBeDefined();
      expect(dtab.column.length).toBeGreaterThan(0);
    });
  });

  describe('CSV export functionality', () => {
    test('should export simulation input to CSV', () => {
      runSim.run_log_phs_inp(); // Load input data
      const csv = runSim.sim_inp_tab_to_csv();
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    test('should export step input to CSV', () => {
      runSim.run_log_phs_inp(); // Load input data
      const csv = runSim.step_inp_tab_to_csv();
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    test('should export step log to CSV', () => {
      // Run a short simulation first
      runSim.result_time([5, 10]);
      runSim.run_simulation('test', true);
      const csv = runSim.step_log_tab_to_csv();
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    test('should export simulation results to CSV', () => {
      // Run a short simulation first
      runSim.result_time([5, 10]);
      runSim.run_simulation('test', true);
      const csv = runSim.sim_res_to_csv();
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });
  });

  describe('JSON export functionality', () => {
    test('should export run log to JSON', () => {
      runSim.run_log_phs_inp(); // Load input data
      const json = runSim.run_log_to_json();
      expect(typeof json).toBe('string');
      
      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('Simulation execution', () => {
    test('should run basic simulation', () => {
      runSim.result_time([5, 10]);
      runSim.run_simulation('test', true);
      
      // Check that simulation completed
      const runLog = runSim.run_log;
      expect(runLog).toBeDefined();
      expect(runLog.length).toBeGreaterThan(0);
    });

    test('should run simulation from start', () => {
      runSim.result_time([5]);
      const result = runSim.run_simulation('test', true);
      
      expect(result).toBeDefined();
      
      // Check final results
      const endResults = runSim.sim_end_res_dtab_obj();
      expect(endResults).toBeDefined();
    });

    test('should continue simulation from current state', () => {
      // Run initial simulation
      runSim.result_time([5]);
      runSim.run_simulation('test', true);
      
      // Continue simulation
      runSim.result_time([10]);
      const result = runSim.run_simulation('test', false);
      
      expect(result).toBeDefined();
    });

    test('should handle multiple result time points', () => {
      runSim.result_time([5, 10, 15, 20]);
      runSim.run_simulation('test', true);
      
      const results = runSim.sim_res_dtab_obj();
      expect(results).toBeDefined();
      
      // Should have data for all time points
      const timeColumn = results.column[0]; // First column is time
      expect(timeColumn.data.length).toBe(4); // 4 time points
    });
  });

  describe('Standard examples', () => {
    test('should load standard example data', () => {
      runSim.run_log_std_example_in_data();
      
      const runLog = runSim.run_log;
      expect(runLog).toBeDefined();
      expect(runLog.length).toBeGreaterThan(0);
      
      // Check that data was loaded
      const inputData = runLog[1]; // Input data
      expect(inputData).toBeDefined();
      expect(inputData.length).toBeGreaterThan(0);
    });

    test('should run standard example simulation', () => {
      runSim.run_log_std_example_in_data();
      runSim.run_log_std_example_target();
      runSim.result_time([30, 60]);
      
      const result = runSim.run_simulation('std_example', true);
      expect(result).toBeDefined();
    });
  });

  describe('Diagram functionality', () => {
    test('should create diagram data arrays', () => {
      // Run simulation first
      runSim.result_time([5, 10]);
      runSim.run_simulation('test', true);
      
      const chartData = runSim.chart_data_arrxy('Tre');
      expect(chartData).toBeDefined();
      expect(Array.isArray(chartData)).toBe(true);
    });

    test('should create x and y array data', () => {
      // Run simulation first
      runSim.result_time([5, 10]);
      runSim.run_simulation('test', true);
      
      const xyData = runSim.chart_data_xarr_yarr('Tre');
      expect(xyData).toBeDefined();
      expect(Array.isArray(xyData.xarr)).toBe(true);
      expect(Array.isArray(xyData.yarr)).toBe(true);
      expect(xyData.xarr.length).toBe(xyData.yarr.length);
    });
  });

  describe('Error handling', () => {
    test('should handle missing parameters gracefully', () => {
      // Reset parameters to undefined
      boj.PHS.reset();
      
      // Should not throw error, but handle gracefully
      expect(() => {
        runSim.run_simulation('test', true);
      }).not.toThrow();
    });

    test('should handle invalid time points', () => {
      runSim.result_time([]); // Empty time array
      
      expect(() => {
        runSim.run_simulation('test', true);
      }).not.toThrow();
    });

    test('should handle simulation with zero steps', () => {
      runSim.result_time([0]); // Zero time
      
      expect(() => {
        runSim.run_simulation('test', true);
      }).not.toThrow();
    });
  });

  describe('Integration test - complete workflow', () => {
    test('should complete full simulation workflow', () => {
      // 1. Set result times
      runSim.result_time([30, 60, 120]);
      
      // 2. Run simulation
      const result = runSim.run_simulation('integration_test', true);
      expect(result).toBeDefined();
      
      // 3. Check results are available
      const simResults = runSim.sim_res_dtab_obj();
      expect(simResults).toBeDefined();
      expect(simResults.column.length).toBeGreaterThan(0);
      
      const stepLog = runSim.step_log_dtab_obj();
      expect(stepLog).toBeDefined();
      expect(stepLog.column.length).toBeGreaterThan(0);
      
      // 4. Export data
      const simCsv = runSim.sim_res_to_csv();
      expect(typeof simCsv).toBe('string');
      expect(simCsv.length).toBeGreaterThan(0);
      
      const stepCsv = runSim.step_log_tab_to_csv();
      expect(typeof stepCsv).toBe('string');
      expect(stepCsv.length).toBeGreaterThan(0);
      
      const json = runSim.run_log_to_json();
      expect(typeof json).toBe('string');
      
      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });

    test('should handle hot conditions simulation', () => {
      // Set hot conditions
      boj.PHS.par_swarm_step.set_value('Met')(200);
      boj.PHS.par_swarm_step.set_value('Tair')(40);
      boj.PHS.par_swarm_step.set_value('Trad')(40);
      boj.PHS.par_swarm_step.set_value('Pw_air')(3000);
      boj.PHS.par_swarm_step.set_value('Icl')(0.3);
      
      runSim.result_time([30, 60]);
      runSim.run_simulation('hot_test', true);
      
      const results = runSim.sim_res_dtab_obj();
      expect(results).toBeDefined();
      
      // Core temperature should rise in hot conditions
      const tempData = results.column.find(col => col.name === 'Tre');
      if (tempData && tempData.data.length > 0) {
        expect(tempData.data[0]).toBeGreaterThan(36.8);
      }
    });

    test('should handle cold conditions simulation', () => {
      // Set cold conditions
      boj.PHS.par_swarm_step.set_value('Met')(80);
      boj.PHS.par_swarm_step.set_value('Tair')(10);
      boj.PHS.par_swarm_step.set_value('Trad')(10);
      boj.PHS.par_swarm_step.set_value('Pw_air')(500);
      boj.PHS.par_swarm_step.set_value('Icl')(1.0);
      
      runSim.result_time([30, 60]);
      runSim.run_simulation('cold_test', true);
      
      const results = runSim.sim_res_dtab_obj();
      expect(results).toBeDefined();
    });
  });
});
