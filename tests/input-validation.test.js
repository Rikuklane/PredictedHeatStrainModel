/**
 * Input Parameter Validation Tests
 * Verifies that parameters from Excel are set correctly in the simulation
 */

const { createContext, loadModules, TestRunner, assert, assertEqual } = require('./test-helper');
const XLSX = require('xlsx');
const path = require('path');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Input Parameter Validation Tests');

runner.test('Simulation parameters are set correctly from Excel', () => {
    // Load test scenario
    const filePath = path.join(__dirname, 'resources', 'env1_scenario1.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Input'];
    const inputData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = inputData[0];
    const firstRow = inputData[1];
    const simParamEndIndex = headers.indexOf('step_end_time');
    
    // Reset and set simulation parameters
    context.boj.PHS.reset();
    
    const simParams = ['accl', 'drink', 'height', 'mass', 'sim_mod'];
    simParams.forEach((param, index) => {
        const excelValue = firstRow[index];
        if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
            context.boj.PHS.par_swarm_sim.set_pid(param, parseFloat(excelValue));
            const actualValue = context.boj.PHS.par_swarm_sim.get_pid(param);
            assertEqual(actualValue, parseFloat(excelValue), 
                `Parameter ${param} should match Excel value ${excelValue}`);
        }
    });
});

runner.test('Step parameters are set correctly from Excel', () => {
    // Load test scenario
    const filePath = path.join(__dirname, 'resources', 'env1_scenario1.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Input'];
    const inputData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = inputData[0];
    const firstRow = inputData[1];
    const simParamEndIndex = headers.indexOf('step_end_time');
    
    // Reset and initialize
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.sim_init();
    
    // Parameter mapping
    const paramMapping = {
        'step_end_time': 'timestep',
        'Pw': 'Pw_air',
        'v_wal': 'v_walk',
        'w_dir': 'walk_dir'
    };
    
    // Set and verify step parameters
    const stepHeaders = headers.slice(simParamEndIndex);
    stepHeaders.forEach((header, colOffset) => {
        const colIndex = simParamEndIndex + colOffset;
        const excelValue = firstRow[colIndex];
        
        if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
            const paramName = paramMapping[header] || header;
            context.boj.PHS.par_swarm_step.set_pid(paramName, parseFloat(excelValue));
            const actualValue = context.boj.PHS.par_swarm_step.get_pid(paramName);
            
            // Allow small floating point differences
            const diff = Math.abs(actualValue - parseFloat(excelValue));
            assert(diff < 0.0001, 
                `Parameter ${header} (${paramName}) should match Excel value ${excelValue}, got ${actualValue}`);
        }
    });
});

runner.test('Parameter mapping is correct', () => {
    // Add alert mock to context to prevent errors
    context.alert = () => {};
    
    context.boj.PHS.reset();
    context.boj.PHS.par_swarm_sim.set_pid('sim_mod', 1);
    context.boj.PHS.sim_init();
    
    // Test that mapped parameters work correctly
    const mappings = [
        ['Pw_air', 1.5],
        ['v_walk', 1.2],
        ['timestep', 30]
    ];
    
    mappings.forEach(([param, value]) => {
        context.boj.PHS.par_swarm_step.set_pid(param, value);
        const actual = context.boj.PHS.par_swarm_step.get_pid(param);
        assertEqual(actual, value, `Mapped parameter ${param} should be set correctly`);
    });
});

runner.test('All Excel input columns are recognized', () => {
    const filePath = path.join(__dirname, 'resources', 'env1_scenario1.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Input'];
    const inputData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = inputData[0];
    const expectedHeaders = [
        'accl', 'drink', 'height', 'mass', 'sim_mod',
        'step_end_time', 'post', 'Tair', 'Pw', 'Trad', 'v_air', 
        'Met', 'Icl', 'im_st', 'fAref', 'Fr', 'w_dir', 'v_wal', 'work'
    ];
    
    expectedHeaders.forEach(expected => {
        assert(headers.includes(expected), 
            `Excel should contain column ${expected}`);
    });
});

const results = runner.run();
runner.summary();

module.exports = results;
