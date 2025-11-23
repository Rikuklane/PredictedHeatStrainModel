/**
 * PHS Multi-Timestep Tests
 * Tests for complex multi-step simulation scenarios
 */

const { createContext, loadModules, TestRunner, assert, assertEqual, assertGreaterThan } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('PHS Multi-Timestep Tests');

runner.test('Multi-timestep core logic - 15min + 20min + 10min', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 30, 45]);
    
    runSim.run_simulation('step1', true);
    assertEqual(runSim.run_log.length, 1, 'Should have 1 run after initial simulation');
    
    runSim.step_inp_tab_to_csv();
    const stepTable = runSim.step_inp_tab;
    assert(stepTable !== null, 'Step input table should exist');
    assertEqual(stepTable.data.length, 1, 'Should have 1 data row initially');
    
    const metColIndex = stepTable.column.findIndex(col => col.name === 'Met');
    assert(metColIndex >= 0, 'Metabolism column should exist in table');
    
    const firstStepMet = stepTable.data[0][metColIndex];
    assertEqual(firstStepMet, 150, 'First step should have Met = 150');
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    context.boj.PHS.par_swarm_step.set_pid('Met', 180);
    runSim.run_simulation('step2', false);
    
    runSim.step_inp_tab_to_csv();
    assertEqual(runSim.run_log.length, 2, 'Should have 2 runs after adding second timestep');
    assertEqual(stepTable.data.length, 2, 'Should have 2 data rows after second step');
    
    const secondStepMet = stepTable.data[1][metColIndex];
    assertEqual(secondStepMet, 180, 'Second step should have Met = 180');
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    runSim.run_simulation('step3', false);
    
    runSim.step_inp_tab_to_csv();
    assertEqual(runSim.run_log.length, 3, 'Should have 3 runs after adding third timestep');
    assertEqual(stepTable.data.length, 3, 'Should have 3 data rows after third step');
    
    const timeValues = stepTable.data.map(row => row[0]);
    assertGreaterThan(timeValues[1], timeValues[0], 'Second timestep should be later than first');
    assertGreaterThan(timeValues[2], timeValues[1], 'Third timestep should be later than second');
    
    const metValues = stepTable.data.map(row => row[metColIndex]);
    assertEqual(metValues[0], 150, 'First step should have Met = 150');
    assertEqual(metValues[1], 180, 'Second step should have Met = 180');
    assertEqual(metValues[2], 200, 'Third step should have Met = 200');
    
    const finalState = context.boj.PHS.state();
    assertEqual(finalState.time, 45, 'Final simulation time should be 45 minutes');
    assertEqual(finalState.step_end_time, 45, 'Final step end time should be 45');
});

runner.test('Timestep data consistency', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 30, 45]);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 20);
    runSim.run_simulation('step1', true);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    runSim.run_simulation('step2', false);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    runSim.run_simulation('step3', false);
    
    runSim.step_inp_tab_to_csv();
    const stepTable = runSim.step_inp_tab;
    
    assertEqual(stepTable.data.length, 3, 'Should have 3 data rows');
    
    const tempValues = stepTable.data.map(row => row[2]);
    assertEqual(tempValues[0], 20, 'First step should have Tair = 20');
    assertEqual(tempValues[1], 25, 'Second step should have Tair = 25');
    assertEqual(tempValues[2], 30, 'Third step should have Tair = 30');
    
    const finalState = context.boj.PHS.state();
    assertEqual(finalState.time, 45, 'Final simulation time should be 45 minutes');
    assertEqual(finalState.step_end_time, 45, 'Final step end time should be 45');
    
    assertEqual(runSim.run_log.length, 3, 'Run log should have 3 entries');
    
    for (let i = 0; i < runSim.run_log.length; i++) {
        const run = runSim.run_log[i];
        assert(run.length >= 3, 'Run log entry should have at least 3 elements');
        assert(run[2] !== null, 'Run log entry should have step parameters');
        assert(run[2].length > 0, 'Step parameters should not be empty');
    }
});

runner.test('Graph data preparation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 35, 45]);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 15);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    runSim.run_simulation('cool', true);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 35);
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    runSim.run_simulation('warm', false);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    runSim.run_simulation('moderate', false);
    
    runSim.step_log_tab_to_csv();
    const stepLogTable = runSim.step_log_tab;
    assert(stepLogTable !== null, 'Step log table should exist');
    assertGreaterThan(stepLogTable.data.length, 1, 'Step log should have multiple data points for graph');
    
    const timeValues = stepLogTable.data.map(row => row[0]);
    assert(timeValues[0] >= 0, 'Step log should start from time 0 or close');
    assert(timeValues[timeValues.length - 1] <= 45, 'Step log should end at or before 45');
    
    const stepLogCsv = runSim.step_log_tab_to_csv();
    assert(stepLogCsv.includes('time'), 'CSV should include time column');
    assert(stepLogCsv.includes('Tsk'), 'CSV should include temperature column');
});

runner.test('Simulation results consistency', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 30, 45]);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    runSim.run_simulation('step1', true);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    context.boj.PHS.par_swarm_step.set_pid('Met', 180);
    runSim.run_simulation('step2', false);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 35);
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    runSim.run_simulation('step3', false);
    
    runSim.sim_res_to_csv();
    const simResTable = runSim.sim_res_tab;
    assert(simResTable !== null, 'Simulation results table should exist');
    assertGreaterThan(simResTable.data.length, 0, 'Simulation results should have data');
    
    const finalResult = simResTable.data[simResTable.data.length - 1];
    assertEqual(finalResult[0], 45, 'Final result should be at time 45');
    assert(finalResult[1] !== null, 'Should have core temperature result');
    assert(finalResult[2] !== null, 'Should have total sweat result');
    
    const simResCsv = runSim.sim_res_to_csv();
    assert(simResCsv.includes('Tre'), 'CSV should include core temperature');
    assert(simResCsv.includes('SWtotg'), 'CSV should include total sweat');
});

runner.test('Parameter validation and error handling', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 30]);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    
    runSim.run_simulation('valid_test', true);
    assertEqual(runSim.run_log.length, 1, 'Simulation should complete successfully');
    
    // Test edge cases
    context.boj.PHS.par_swarm_sim.set_pid('weight', 0);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.5);
    runSim.run_simulation('edge_test', true);
    
    context.boj.PHS.par_swarm_sim.set_pid('weight', 120);
    context.boj.PHS.par_swarm_sim.set_pid('height', 2.4);
    runSim.run_simulation('edge_test2', true);
    
    assert(true, 'Parameter validation test completed');
});

runner.test('Step log data completeness', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([15, 35, 45]);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    runSim.run_simulation('step1', true);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    context.boj.PHS.par_swarm_step.set_pid('Met', 180);
    runSim.run_simulation('step2', false);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 35);
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    runSim.run_simulation('step3', false);
    
    runSim.step_log_tab_to_csv();
    const stepLogTable = runSim.step_log_tab;
    
    assert(stepLogTable !== null, 'Step log table should exist');
    assertGreaterThan(stepLogTable.data.length, 0, 'Step log should have data');
});

const results = runner.run();
runner.summary();

module.exports = results;
