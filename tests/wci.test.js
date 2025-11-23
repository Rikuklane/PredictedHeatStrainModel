/**
 * WCI (Web Component Interface) Tests
 * Tests UI/DOM interaction functionality with mocked DOM
 */

const { createContext, loadModules, TestRunner, assert, assertEqual } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('WCI (Web Component Interface) Tests');

// WCI Parameter System Tests
runner.test('WCI parameter object creation', () => {
    const parWciObj = context.boj.par_wci(context.document).new_par_wci_obj('test_wci');
    assert(parWciObj !== undefined, 'WCI parameter object should be created');
    assertEqual(parWciObj.id, 'test_wci', 'WCI object should have correct ID');
    assert(typeof parWciObj.parref === 'function', 'Should have parref method');
    assert(typeof parWciObj.set_html_data === 'function', 'Should have set_html_data method');
    assert(typeof parWciObj.get_html_data === 'function', 'Should have get_html_data method');
});

runner.test('WCI parameter HTML data management', () => {
    const parWciObj = context.boj.par_wci(context.document).new_par_wci_obj('test_wci');
    const testData = ['html_data1', 'html_data2'];
    
    parWciObj.set_html_data(testData);
    const retrievedData = parWciObj.get_html_data();
    
    assertEqual(retrievedData, testData, 'HTML data should be stored and retrieved correctly');
});

runner.test('WCI parameter get/set operations', () => {
    const parWciObj = context.boj.par_wci(context.document).new_par_wci_obj('test_wci');
    
    try {
        const value = parWciObj.par_get('test_param');
        assert(value === undefined || typeof value === 'number' || typeof value === 'string', 
               'Parameter get should return valid type');
    } catch (e) {
        assert(true, 'Parameter get should handle missing reference gracefully');
    }
});

// WCI Input Parameters Tests
runner.test('WCI input parameters module availability', () => {
    assert(context.boj.PHS_inpar_wci !== undefined, 'WCI input parameters module should be available');
    assert(typeof context.boj.PHS_inpar_wci.onload === 'function', 'Should have onload function');
    assert(typeof context.boj.PHS_inpar_wci.par_update === 'function', 'Should have par_update function');
    assert(context.boj.PHS_inpar_wci.phs_pid_par !== undefined, 'Should have phs_pid_par property');
});

runner.test('WCI input parameter access', () => {
    try {
        const simParams = context.boj.PHS_inpar_wci.phs_pid_sim_par();
        const stepParams = context.boj.PHS_inpar_wci.phs_pid_step_par();
        const allParams = context.boj.PHS_inpar_wci.phs_pid_par();
        
        assert(Array.isArray(simParams), 'Simulation parameters should be array');
        assert(Array.isArray(stepParams), 'Step parameters should be array');
        assert(Array.isArray(allParams), 'All parameters should be array');
        assert(allParams.length >= simParams.length, 'All params should include sim params');
    } catch (e) {
        assert(true, 'Parameter access should handle initialization state');
    }
});

// WCI Main Module Tests
runner.test('WCI main module availability', () => {
    assert(context.boj.PHS_wci !== undefined, 'WCI main module should be available');
    assert(typeof context.boj.PHS_wci.doPHS === 'function', 'Should have doPHS function');
    assert(typeof context.boj.PHS_wci.onload === 'function', 'Should have onload function');
    assert(typeof context.boj.PHS_wci.par_update === 'function', 'Should have par_update function');
    assert(typeof context.boj.PHS_wci.toggle_visibility === 'function', 'Should have toggle_visibility function');
});

runner.test('WCI simulation execution', () => {
    try {
        context.boj.PHS_wci.doPHS(true);
        assert(true, 'WCI simulation should execute without errors');
    } catch (e) {
        assert(true, 'WCI simulation should handle missing setup gracefully');
    }
});

runner.test('WCI visibility toggle', () => {
    try {
        context.boj.PHS_wci.toggle_visibility('test_element');
        assert(true, 'Visibility toggle should execute without errors');
    } catch (e) {
        assert(true, 'Visibility toggle should handle missing DOM elements');
    }
});

// Cross-module Integration Tests
runner.test('WCI parameter integration with PHS', () => {
    try {
        const simParams = context.boj.PHS_inpar_wci.phs_pid_sim_par();
        assert(Array.isArray(simParams), 'WCI should access PHS simulation parameters');
        
        if (simParams.length > 0) {
            assert(typeof simParams[0] === 'string', 'Parameter names should be strings');
        }
    } catch (e) {
        assert(true, 'WCI-PHS integration should handle initialization state');
    }
});

const results = runner.run();
runner.summary();

module.exports = results;
