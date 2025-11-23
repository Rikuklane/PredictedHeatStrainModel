/**
 * Excel Export Tests
 * Tests Excel export functionality with XLSX library
 */

const XLSX = require('xlsx');
const { createContext, loadModules, TestRunner, assert, assertEqual, assertGreaterThan } = require('./test-helper');

const context = createContext();
loadModules(context);

// Make XLSX available in context
context.XLSX = XLSX;

const runner = new TestRunner('Excel Export Tests');

runner.test('Excel Export - Function availability', () => {
    assert(context.boj.PHS_wci !== undefined, 'WCI module should be available');
    assert(typeof context.boj.PHS_wci.exportAllData === 'function', 'exportAllData function should exist');
    assert(typeof context.boj.PHS_wci.exportStepData === 'function', 'exportStepData function should exist');
    assert(typeof context.boj.PHS_wci.exportAllDataCombined === 'function', 'exportAllDataCombined function should exist');
    assert(typeof context.boj.PHS_wci.parseCSVToArray === 'function', 'parseCSVToArray function should exist');
    
    assert(typeof XLSX !== 'undefined', 'XLSX library should be available');
    assert(typeof XLSX.utils.book_new === 'function', 'XLSX workbook functions should be available');
});

runner.test('Excel Export - Data generation validation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.run_simulation('initial', true);
    
    const simInputCSV = runSim.sim_inp_tab_to_csv();
    const stepInputCSV = runSim.step_inp_tab_to_csv();
    const stepLogCSV = runSim.step_log_tab_to_csv();
    const resultsCSV = runSim.sim_res_to_csv();
    
    assertGreaterThan(simInputCSV.length, 0, 'Simulation input CSV should not be empty');
    assertGreaterThan(stepInputCSV.length, 0, 'Step input CSV should not be empty');
    assertGreaterThan(stepLogCSV.length, 0, 'Step log CSV should not be empty');
    assertGreaterThan(resultsCSV.length, 0, 'Results CSV should not be empty');
    
    const simInputArray = context.boj.PHS_wci.parseCSVToArray(simInputCSV);
    const stepInputArray = context.boj.PHS_wci.parseCSVToArray(stepInputCSV);
    const stepLogArray = context.boj.PHS_wci.parseCSVToArray(stepLogCSV);
    const resultsArray = context.boj.PHS_wci.parseCSVToArray(resultsCSV);
    
    assert(Array.isArray(simInputArray), 'Simulation input should convert to array');
    assert(Array.isArray(stepInputArray), 'Step input should convert to array');
    assert(Array.isArray(stepLogArray), 'Step log should convert to array');
    assert(Array.isArray(resultsArray), 'Results should convert to array');
    
    assertGreaterThan(simInputArray.length, 0, 'Simulation input array should have rows');
    assertGreaterThan(stepInputArray.length, 0, 'Step input array should have rows');
    assertGreaterThan(stepLogArray.length, 0, 'Step log array should have rows');
    assertGreaterThan(resultsArray.length, 0, 'Results array should have rows');
});

runner.test('Excel Export - Multi-timestep data validation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    runSim.run_simulation('initial', true);
    
    context.boj.PHS.par_swarm_step.set_pid('Met', 180);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 30);
    runSim.run_simulation('step2', false);
    
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 35);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    runSim.run_simulation('step3', false);
    
    const stepInputCSV = runSim.step_inp_tab_to_csv();
    const stepLogCSV = runSim.step_log_tab_to_csv();
    
    assert(stepInputCSV.includes('150'), 'Step input CSV should contain first Met value');
    assert(stepInputCSV.includes('180'), 'Step input CSV should contain second Met value');
    assert(stepInputCSV.includes('200'), 'Step input CSV should contain third Met value');
    
    const stepLogLines = stepLogCSV.split('\n').filter(line => line.trim());
    assertGreaterThan(stepLogLines.length, 3, 'Step log should have multiple data rows for multi-timestep');
});

runner.test('Excel Export - Excel format validation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.run_simulation('test', true);
    
    const simInputCSV = runSim.sim_inp_tab_to_csv();
    const stepInputCSV = runSim.step_inp_tab_to_csv();
    const stepLogCSV = runSim.step_log_tab_to_csv();
    const resultsCSV = runSim.sim_res_to_csv();
    
    const simInputArray = context.boj.PHS_wci.parseCSVToArray(simInputCSV);
    const stepInputArray = context.boj.PHS_wci.parseCSVToArray(stepInputCSV);
    const stepLogArray = context.boj.PHS_wci.parseCSVToArray(stepLogCSV);
    const resultsArray = context.boj.PHS_wci.parseCSVToArray(resultsCSV);
    
    assert(simInputArray.every(row => Array.isArray(row)), 'All simulation input rows should be arrays');
    assert(stepInputArray.every(row => Array.isArray(row)), 'All step input rows should be arrays');
    assert(stepLogArray.every(row => Array.isArray(row)), 'All step log rows should be arrays');
    assert(resultsArray.every(row => Array.isArray(row)), 'All results rows should be arrays');
    
    assertGreaterThan(simInputArray[0].length, 1, 'Simulation input should have multiple columns');
    assertGreaterThan(stepInputArray[0].length, 1, 'Step input should have multiple columns');
    assertGreaterThan(stepLogArray[0].length, 1, 'Step log should have multiple columns');
    assertGreaterThan(resultsArray[0].length, 1, 'Results should have multiple columns');
    
    assert(stepInputCSV.includes('time') || stepInputCSV.includes('step_end_time'), 'Step input CSV should contain time column');
    assert(stepLogCSV.includes('Tcreq'), 'Step log CSV should contain physiological data');
    assert(resultsCSV.includes('Tre'), 'Results CSV should contain results');
});

const results = runner.run();
runner.summary();

module.exports = results;
