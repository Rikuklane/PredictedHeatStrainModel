/**
 * PHS Test Scenarios Runner - Node.js Version
 * Run with: node test_scenarios.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load the PHS modules
const vm = require('vm');

// Create a global context for the modules
const context = {
    console: console,
    boj: {},
    document: {
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({})
    },
    window: {},
    setTimeout: setTimeout,
    setInterval: setInterval
};

// Load all required modules in order
const modules = [
    'lib/parameter_data_obj.js',
    'lib/canvas_util.js',
    'lib/humidity_obj.js',
    'lib/mean_rad_temp_obj.js',
    'lib/data_table_obj.js',
    'lib/diagram_util.js',
    'lib/html_fragment_obj.js',
    'lib/window_tab_util.js',
    'lib/parameter_wci.js',
    'lib/PHS.js',
    'lib/PHS_run_simulation.js',
    'lib/PHS_inpar_wci.js'
];

console.log('Loading PHS modules...');
modules.forEach(modulePath => {
    try {
        const code = fs.readFileSync(modulePath, 'utf8');
        vm.runInNewContext(code, context);
        console.log(`✓ Loaded ${modulePath}`);
    } catch (error) {
        console.error(`✗ Failed to load ${modulePath}:`, error.message);
        process.exit(1);
    }
});

// Test configuration - decimal places for each column (from step_log_tab_spec)
const DECIMAL_PLACES = {
    time: 0,
    Tcreq: 2,
    Tsk: 2,
    SWg: 2,
    SWtotg: 0,
    Tcr: 2,
    Tre: 2,
    Tcl: 2,
    SW: 0,
    Epre: 0,
    SWreq: 0,
    SWmax: 0
};

// Tolerance of 0.5 accounts for rounding to nearest integer/decimal
// Values are rounded to match Excel precision before comparison
const TOLERANCE = 0.5;

const TEST_SCENARIOS = [
    { file: 'env1_scenario1.xlsx', name: 'Environment 1 - Scenario 1' },
    { file: 'env1_scenario2.xlsx', name: 'Environment 1 - Scenario 2' },
    { file: 'env2_scenario1.xlsx', name: 'Environment 2 - Scenario 1' },
    { file: 'env2_scenario2.xlsx', name: 'Environment 2 - Scenario 2' },
    { file: 'env3_scenario1.xlsx', name: 'Environment 3 - Scenario 1' },
    { file: 'env3_scenario2.xlsx', name: 'Environment 3 - Scenario 2' }
];

// Helper functions
function roundToDecimalPlaces(value, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
}

function assertClose(actual, expected, tolerance, fieldName) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(`${fieldName}: Expected ${expected} ± ${tolerance}, got ${actual} (diff: ${diff.toFixed(4)})`);
    }
}

function loadExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    return workbook;
}

function extractSheetData(workbook, sheetName) {
    if (!workbook.Sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found in workbook`);
    }
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
}

function processImportedTestData(inputData) {
    // Reset simulation
    context.boj.PHS.reset();
    const run_sim = context.boj.PHS_run_sim.new_run_sim();
    
    const headers = inputData[0];
    const simParamEndIndex = headers.indexOf('step_end_time');
    
    if (simParamEndIndex === -1) {
        throw new Error('Could not find step_end_time column');
    }
    
    const simHeaders = headers.slice(0, simParamEndIndex);
    const stepHeaders = headers.slice(simParamEndIndex);
    
    if (inputData.length < 2) {
        throw new Error('No data rows found');
    }
    
    const firstRow = inputData[1];
    
    // Set simulation parameters
    simHeaders.forEach((header, index) => {
        const value = firstRow[index];
        if (value !== undefined && value !== null && value !== '') {
            try {
                context.boj.PHS.par_swarm_sim.set_pid(header, parseFloat(value));
            } catch (error) {
                console.warn(`Could not set simulation parameter ${header}:`, error);
            }
        }
    });
    
    // Initialize simulation
    context.boj.PHS.sim_init();
    
    // Parameter mapping
    const paramMapping = {
        'step_end_time': 'timestep',
        'Pw': 'Pw_air',
        'v_wal': 'v_walk',
        'w_dir': 'walk_dir'
    };
    
    // Process each step
    for (let rowIndex = 1; rowIndex < inputData.length; rowIndex++) {
        const row = inputData[rowIndex];
        
        if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
            continue;
        }
        
        // Set step parameters
        stepHeaders.forEach((header, colOffset) => {
            const colIndex = simParamEndIndex + colOffset;
            const value = row[colIndex];
            
            if (value !== undefined && value !== null && value !== '') {
                try {
                    const paramName = paramMapping[header] || header;
                    context.boj.PHS.par_swarm_step.set_pid(paramName, parseFloat(value));
                } catch (error) {
                    console.warn(`Could not set step parameter ${header}:`, error);
                }
            }
        });
        
        // Run simulation
        const isFirstStep = rowIndex === 1;
        run_sim.run_simulation(`test_step_${rowIndex}`, isFirstStep);
    }
    
    return run_sim;
}

function compareResults(actualResults, expectedResults) {
    const errors = [];
    const headers = expectedResults[0];
    
    // Find column indices in expected output
    const timeIdx = headers.indexOf('time');
    const tcreqIdx = headers.indexOf('Tcreq');
    const tskIdx = headers.indexOf('Tsk');
    const swgIdx = headers.indexOf('SWg');
    const swtotgIdx = headers.indexOf('SWtotg');
    const tcrIdx = headers.indexOf('Tcr');
    const treIdx = headers.indexOf('Tre');
    const tclIdx = headers.indexOf('Tcl');
    const swIdx = headers.indexOf('SW');
    const epreIdx = headers.indexOf('Epre');
    const swreqIdx = headers.indexOf('SWreq');
    const swmaxIdx = headers.indexOf('SWmax');
    
    // Compare each row (skip header)
    for (let i = 1; i < expectedResults.length; i++) {
        const expectedRow = expectedResults[i];
        
        // Skip empty rows
        if (!expectedRow || expectedRow.every(cell => cell === undefined || cell === null || cell === '')) {
            continue;
        }
        
        // Get actual result for this timestep
        const actualRow = actualResults[i];
        if (!actualRow) {
            errors.push(`Missing result row ${i}`);
            continue;
        }
        
        try {
            // Compare each column if it exists, rounding actual values to match Excel's precision
            if (timeIdx >= 0 && expectedRow[timeIdx] !== undefined && expectedRow[timeIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[timeIdx], DECIMAL_PLACES.time);
                assertClose(rounded, expectedRow[timeIdx], TOLERANCE, `Row ${i} - time`);
            }
            if (tcreqIdx >= 0 && expectedRow[tcreqIdx] !== undefined && expectedRow[tcreqIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[tcreqIdx], DECIMAL_PLACES.Tcreq);
                assertClose(rounded, expectedRow[tcreqIdx], TOLERANCE, `Row ${i} - Tcreq`);
            }
            if (tskIdx >= 0 && expectedRow[tskIdx] !== undefined && expectedRow[tskIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[tskIdx], DECIMAL_PLACES.Tsk);
                assertClose(rounded, expectedRow[tskIdx], TOLERANCE, `Row ${i} - Tsk`);
            }
            if (swgIdx >= 0 && expectedRow[swgIdx] !== undefined && expectedRow[swgIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[swgIdx], DECIMAL_PLACES.SWg);
                assertClose(rounded, expectedRow[swgIdx], TOLERANCE, `Row ${i} - SWg`);
            }
            if (swtotgIdx >= 0 && expectedRow[swtotgIdx] !== undefined && expectedRow[swtotgIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[swtotgIdx], DECIMAL_PLACES.SWtotg);
                assertClose(rounded, expectedRow[swtotgIdx], TOLERANCE, `Row ${i} - SWtotg`);
            }
            if (tcrIdx >= 0 && expectedRow[tcrIdx] !== undefined && expectedRow[tcrIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[tcrIdx], DECIMAL_PLACES.Tcr);
                assertClose(rounded, expectedRow[tcrIdx], TOLERANCE, `Row ${i} - Tcr`);
            }
            if (treIdx >= 0 && expectedRow[treIdx] !== undefined && expectedRow[treIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[treIdx], DECIMAL_PLACES.Tre);
                assertClose(rounded, expectedRow[treIdx], TOLERANCE, `Row ${i} - Tre`);
            }
            if (tclIdx >= 0 && expectedRow[tclIdx] !== undefined && expectedRow[tclIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[tclIdx], DECIMAL_PLACES.Tcl);
                assertClose(rounded, expectedRow[tclIdx], TOLERANCE, `Row ${i} - Tcl`);
            }
            if (swIdx >= 0 && expectedRow[swIdx] !== undefined && expectedRow[swIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[swIdx], DECIMAL_PLACES.SW);
                assertClose(rounded, expectedRow[swIdx], TOLERANCE, `Row ${i} - SW`);
            }
            if (epreIdx >= 0 && expectedRow[epreIdx] !== undefined && expectedRow[epreIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[epreIdx], DECIMAL_PLACES.Epre);
                assertClose(rounded, expectedRow[epreIdx], TOLERANCE, `Row ${i} - Epre`);
            }
            if (swreqIdx >= 0 && expectedRow[swreqIdx] !== undefined && expectedRow[swreqIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[swreqIdx], DECIMAL_PLACES.SWreq);
                assertClose(rounded, expectedRow[swreqIdx], TOLERANCE, `Row ${i} - SWreq`);
            }
            if (swmaxIdx >= 0 && expectedRow[swmaxIdx] !== undefined && expectedRow[swmaxIdx] !== '') {
                const rounded = roundToDecimalPlaces(actualRow[swmaxIdx], DECIMAL_PLACES.SWmax);
                assertClose(rounded, expectedRow[swmaxIdx], TOLERANCE, `Row ${i} - SWmax`);
            }
        } catch (error) {
            errors.push(error.message);
        }
    }
    
    return errors;
}

function runTest(scenario) {
    const startTime = Date.now();
    const result = {
        name: scenario.name,
        file: scenario.file,
        passed: false,
        errors: [],
        duration: 0
    };
    
    try {
        // Load the Excel file
        const filePath = path.join(__dirname, 'resources', scenario.file);
        const workbook = loadExcelFile(filePath);
        
        // Extract Input and Output sheets
        const inputData = extractSheetData(workbook, 'Input');
        const outputData = extractSheetData(workbook, 'Output');
        
        if (!inputData || inputData.length === 0) {
            throw new Error('Input sheet is empty');
        }
        
        if (!outputData || outputData.length === 0) {
            throw new Error('Output sheet is empty');
        }
        
        // Run simulation with input data
        const run_sim = processImportedTestData(inputData);
        
        // Extract actual results from step_log
        const actualResults = [];
        const headers = ['time', 'Tcreq', 'Tsk', 'SWg', 'SWtotg', 'Tcr', 'Tre', 'Tcl', 'SW', 'Epre', 'SWreq', 'SWmax'];
        actualResults.push(headers);
        
        if (run_sim.step_log && run_sim.step_log.length > 0) {
            for (let i = 0; i < run_sim.step_log.length; i++) {
                actualResults.push(run_sim.step_log[i]);
            }
        }
        
        // Compare results
        const errors = compareResults(actualResults, outputData);
        
        if (errors.length > 0) {
            result.errors = errors;
        } else {
            result.passed = true;
        }
        
    } catch (error) {
        result.errors.push(error.message);
    }
    
    result.duration = Date.now() - startTime;
    return result;
}

// Main test runner (for standalone execution)
if (require.main === module) {
    console.log('\n========================================');
    console.log('PHS Integration Test Scenarios');
    console.log('========================================\n');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };
    
    for (const scenario of TEST_SCENARIOS) {
        results.total++;
        console.log(`Running: ${scenario.name}...`);
        const result = runTest(scenario);
        results.details.push(result);
        
        if (result.passed) {
            results.passed++;
            console.log(`✓ PASS: ${scenario.name} (${result.duration}ms)\n`);
        } else {
            results.failed++;
            console.log(`✗ FAIL: ${scenario.name} (${result.duration}ms)`);
            console.log(`  Errors (${result.errors.length}):`);
            result.errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
            if (result.errors.length > 5) {
                console.log(`    ... and ${result.errors.length - 5} more errors`);
            }
            console.log('');
        }
    }
    
    console.log('========================================');
    console.log('Test Results Summary');
    console.log('========================================');
    console.log(`Total:  ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log('========================================\n');
    
    process.exit(results.failed > 0 ? 1 : 0);
} else {
    // Export for use in test runner
    const { TestRunner } = require('./test-helper');
    const runner = new TestRunner('PHS Integration Test Scenarios');
    
    for (const scenario of TEST_SCENARIOS) {
        runner.test(scenario.name, () => {
            const result = runTest(scenario);
            if (!result.passed) {
                throw new Error(`${result.errors.length} validation errors (showing first 3):\n  ${result.errors.slice(0, 3).join('\n  ')}`);
            }
        });
    }
    
    const results = runner.run();
    runner.summary();
    module.exports = results;
}
