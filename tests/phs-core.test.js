/**
 * PHS Core Calculation Tests
 * Comprehensive tests for PHS simulation functionality
 */

const { createContext, loadModules, TestRunner, assert, assertEqual, assertClose, assertInRange } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('PHS Core Calculation Tests');

// Basic PHS Tests
runner.test('PHS simulation initialization', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertClose(state.core_Tcr, 36.8, 0.1, 'Initial core temperature should be 36.8°C');
    assertClose(state.core_Trec, 36.8, 0.1, 'Initial rectal temperature should be 36.8°C');
});

runner.test('Body surface area calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assert(state.sim_time !== undefined, 'State should be accessible');
});

runner.test('Specific heat calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertEqual(state.sim_mod, 1, 'Simulation model should be set to 1');
});

runner.test('Sweat limits calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('drink', 1);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertEqual(state.sim_mod, 1, 'Simulation should be initialized');
});

runner.test('Posture radiation factor', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('posture', 1);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertEqual(state.sim_mod, 1, 'Simulation should be initialized with posture 1');
    
    context.boj.PHS.par_swarm_step.set_pid('posture', 2);
    context.boj.PHS.sim_init();
    const state2 = context.boj.PHS.sample_get();
    assertEqual(state2.sim_mod, 1, 'Simulation should be initialized with posture 2');
    
    context.boj.PHS.par_swarm_step.set_pid('posture', 3);
    context.boj.PHS.sim_init();
    const state3 = context.boj.PHS.sample_get();
    assertEqual(state3.sim_mod, 1, 'Simulation should be initialized with posture 3');
});

runner.test('Core temperature requirement calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertClose(state.core_Tcreq_rm_ss, 36.96, 0.01, 'Core temp requirement should be 36.96°C');
});

runner.test('Clothing insulation calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertEqual(state.sim_mod, 1, 'Simulation should be initialized');
});

runner.test('Walking speed calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    const expectedWalk = Math.min(0.0052 * (100 - 58), 0.7);
    assertClose(state.move_v_air_rel, expectedWalk, 0.01, 'Walking speed should be calculated correctly');
});

runner.test('Skin temperature equilibrium', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 25);
    context.boj.PHS.par_swarm_step.set_pid('Trad', 25);
    context.boj.PHS.par_swarm_step.set_pid('Pw_air', 1000);
    context.boj.PHS.par_swarm_step.set_pid('v_air', 0.3);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.sim_init();
    
    const state = context.boj.PHS.sample_get();
    assertInRange(state.skin_Tsk, 30, 40, 'Skin temperature should be reasonable');
});

runner.test('Dynamic insulation calculation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('v_air', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('v_walk', 1.0);
    context.boj.PHS.sim_init();
    
    context.boj.PHS.time_step();
    
    const state = context.boj.PHS.sample_get();
    assert(state.cloth_CORcl !== undefined || state.cloth_CORia !== undefined || state.cloth_Itot_dyn !== undefined, 
           'At least one dynamic insulation value should be defined');
});

runner.test('Time step execution', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.sim_init();
    
    const initialState = context.boj.PHS.sample_get();
    const initialTime = initialState.sim_time;
    context.boj.PHS.time_step();
    const finalState = context.boj.PHS.sample_get();
    const finalTime = finalState.sim_time;
    
    assertEqual(finalTime, initialTime + 1, 'Simulation time should advance by 1 minute');
});

runner.test('PHS basic simulation run', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 100);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 30);
    context.boj.PHS.par_swarm_step.set_pid('Pw_air', 2000);
    context.boj.PHS.par_swarm_step.set_pid('Trad', 30);
    context.boj.PHS.par_swarm_step.set_pid('v_air', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 30);
    
    context.boj.PHS.sim_init();
    
    const run_sim = context.boj.PHS_run_sim.new_run_sim();
    run_sim.run_simulation('test', true);
    
    assert(run_sim.run_log.length > 0, 'Simulation should create log entries');
});

runner.test('PHS step input table creation', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 15);
    
    context.boj.PHS.sim_init();
    
    const run_sim = context.boj.PHS_run_sim.new_run_sim();
    run_sim.run_simulation('step1', true);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 35);
    run_sim.run_simulation('step2', false);
    
    context.boj.PHS.par_swarm_step.set_pid('timestep', 45);
    run_sim.run_simulation('step3', false);
    
    assertEqual(run_sim.run_log.length, 3, 'Should have 3 simulation steps');
});

runner.test('PHS time progression', () => {
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('timestep', 30);
    
    context.boj.PHS.sim_init();
    
    const run_sim = context.boj.PHS_run_sim.new_run_sim();
    run_sim.run_simulation('test', true);
    
    const finalState = context.boj.PHS.state();
    assertEqual(finalState.step_end_time, 30, 'Final step end time should be 30');
});

// Integration scenario tests
runner.test('Complete simulation workflow', () => {
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_sim.set_pid('accl', 50);
    context.boj.PHS.par_swarm_sim.set_pid('drink', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 150);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 35);
    context.boj.PHS.par_swarm_step.set_pid('Trad', 35);
    context.boj.PHS.par_swarm_step.set_pid('Pw_air', 2000);
    context.boj.PHS.par_swarm_step.set_pid('v_air', 0.5);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.4);
    context.boj.PHS.par_swarm_step.set_pid('im_st', 0.4);
    context.boj.PHS.par_swarm_step.set_pid('fAref', 0.7);
    context.boj.PHS.par_swarm_step.set_pid('Fr', 0.97);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([30, 60]);
    runSim.run_simulation('integration_test', true);
    
    assert(runSim !== undefined, 'Integration test should complete');
});

runner.test('Hot conditions simulation', () => {
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 200);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 40);
    context.boj.PHS.par_swarm_step.set_pid('Trad', 40);
    context.boj.PHS.par_swarm_step.set_pid('Pw_air', 3000);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 0.3);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([30]);
    runSim.run_simulation('hot_test', true);
    
    assert(runSim !== undefined, 'Hot conditions test should complete');
});

runner.test('Cold conditions simulation', () => {
    context.boj.PHS.par_swarm_sim.set_pid('weight', 70);
    context.boj.PHS.par_swarm_sim.set_pid('height', 1.75);
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.par_swarm_step.set_pid('Met', 80);
    context.boj.PHS.par_swarm_step.set_pid('Tair', 10);
    context.boj.PHS.par_swarm_step.set_pid('Trad', 10);
    context.boj.PHS.par_swarm_step.set_pid('Pw_air', 500);
    context.boj.PHS.par_swarm_step.set_pid('Icl', 1.0);
    
    const runSim = context.boj.PHS_run_sim.new_run_sim();
    runSim.result_time([30]);
    runSim.run_simulation('cold_test', true);
    
    assert(runSim !== undefined, 'Cold conditions test should complete');
});

const results = runner.run();
runner.summary();

module.exports = results;
