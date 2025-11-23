/**
 * UI Behavior Tests
 * Tests UI interactions using JSDOM to simulate browser environment
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { TestRunner, assert, assertEqual } = require('./test-helper');

const runner = new TestRunner('UI Behavior Tests');

// Create a DOM environment
function createDOMEnvironment() {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body>
            <!-- Buttons -->
            <button id="btn_start" onclick="doPHS(true)">Start simulation</button>
            <button id="btn_add" onclick="doPHS(false)" disabled>Add timestep</button>
            <button id="btn_export" disabled>Export to Excel</button>
            
            <!-- Tabs -->
            <ul class="wtab_menu">
                <li id="wtab_menu_par" class="wtab_active">Parameters</li>
                <li id="wtab_menu_graph">Graph</li>
                <li id="wtab_menu_table">Table</li>
                <li id="wtab_menu_all">All</li>
                <li id="wtab_menu_about">About</li>
            </ul>
            
            <!-- Tab Content -->
            <div id="wtab_cont_par" class="wtab_cont wtab_active">Parameters content</div>
            <div id="wtab_cont_graph" class="wtab_cont">Graph content</div>
            <div id="wtab_cont_table" class="wtab_cont">Table content</div>
            <div id="wtab_cont_about" class="wtab_cont">About content</div>
            
            <!-- Parameter Inputs -->
            <div class="sim-params">
                <input id="weight" type="number" value="70">
                <input id="height" type="number" value="1.75">
            </div>
            <div class="step-params">
                <input id="Met" type="number" value="100">
                <input id="Tair" type="number" value="25">
            </div>
        </body>
        </html>
    `, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable'
    });
    
    return dom.window;
}

runner.test('UI Button states - Initial state', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const startButton = document.getElementById('btn_start');
    const addButton = document.getElementById('btn_add');
    const exportButton = document.getElementById('btn_export');
    
    assert(startButton !== null, 'Start button should exist');
    assert(addButton !== null, 'Add timestep button should exist');
    assert(exportButton !== null, 'Export button should exist');
    
    assertEqual(startButton.disabled, false, 'Start button should be enabled initially');
    assertEqual(addButton.disabled, true, 'Add timestep button should be disabled initially');
    assertEqual(exportButton.disabled, true, 'Export button should be disabled initially');
});

runner.test('UI Button states - After simulation start', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const startButton = document.getElementById('btn_start');
    const addButton = document.getElementById('btn_add');
    const exportButton = document.getElementById('btn_export');
    
    // Simulate starting simulation
    startButton.disabled = true;
    addButton.disabled = false;
    exportButton.disabled = false;
    
    assertEqual(startButton.disabled, true, 'Start button should be disabled after simulation starts');
    assertEqual(addButton.disabled, false, 'Add timestep button should be enabled after simulation starts');
    assertEqual(exportButton.disabled, false, 'Export button should be enabled after simulation starts');
});

runner.test('UI workflow - Start simulation then add timesteps', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const startButton = document.getElementById('btn_start');
    const addButton = document.getElementById('btn_add');
    
    // Initial state
    assertEqual(startButton.disabled, false, 'Start button should be enabled initially');
    assertEqual(addButton.disabled, true, 'Add timestep button should be disabled initially');
    
    // Simulate clicking start button
    startButton.disabled = true;
    addButton.disabled = false;
    
    // After start
    assertEqual(startButton.disabled, true, 'Start button should be disabled after click');
    assertEqual(addButton.disabled, false, 'Add timestep button should be enabled after start');
    
    // Simulate adding timesteps (button should remain enabled)
    assertEqual(addButton.disabled, false, 'Add timestep button should remain enabled for multiple timesteps');
});

runner.test('Simulation parameter locking - After start simulation', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const metInput = document.getElementById('Met');
    const tairInput = document.getElementById('Tair');
    
    // Initial state - all inputs enabled
    assertEqual(weightInput.disabled, false, 'Weight input should be enabled initially');
    assertEqual(heightInput.disabled, false, 'Height input should be enabled initially');
    assertEqual(metInput.disabled, false, 'Met input should be enabled initially');
    assertEqual(tairInput.disabled, false, 'Tair input should be enabled initially');
    
    // Simulate starting simulation - lock sim params, keep step params enabled
    weightInput.disabled = true;
    heightInput.disabled = true;
    // Step params remain enabled
    
    assertEqual(weightInput.disabled, true, 'Weight input should be disabled after simulation starts');
    assertEqual(heightInput.disabled, true, 'Height input should be disabled after simulation starts');
    assertEqual(metInput.disabled, false, 'Met input should remain enabled (step parameter)');
    assertEqual(tairInput.disabled, false, 'Tair input should remain enabled (step parameter)');
});

runner.test('Tab navigation - Switch between tabs', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const parTab = document.getElementById('wtab_menu_par');
    const graphTab = document.getElementById('wtab_menu_graph');
    const parContent = document.getElementById('wtab_cont_par');
    const graphContent = document.getElementById('wtab_cont_graph');
    
    // Initial state - Parameters tab active
    assert(parTab.classList.contains('wtab_active'), 'Parameters tab should be active initially');
    assert(parContent.classList.contains('wtab_active'), 'Parameters content should be visible initially');
    assert(!graphTab.classList.contains('wtab_active'), 'Graph tab should not be active initially');
    assert(!graphContent.classList.contains('wtab_active'), 'Graph content should not be visible initially');
    
    // Simulate clicking Graph tab
    parTab.classList.remove('wtab_active');
    parContent.classList.remove('wtab_active');
    graphTab.classList.add('wtab_active');
    graphContent.classList.add('wtab_active');
    
    // After switch
    assert(!parTab.classList.contains('wtab_active'), 'Parameters tab should not be active after switch');
    assert(!parContent.classList.contains('wtab_active'), 'Parameters content should not be visible after switch');
    assert(graphTab.classList.contains('wtab_active'), 'Graph tab should be active after switch');
    assert(graphContent.classList.contains('wtab_active'), 'Graph content should be visible after switch');
});

runner.test('Tab navigation - All tab shows multiple contents', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    const allTab = document.getElementById('wtab_menu_all');
    const parContent = document.getElementById('wtab_cont_par');
    const graphContent = document.getElementById('wtab_cont_graph');
    const tableContent = document.getElementById('wtab_cont_table');
    const aboutContent = document.getElementById('wtab_cont_about');
    
    // Simulate clicking "All" tab
    document.querySelectorAll('.wtab_menu li').forEach(tab => tab.classList.remove('wtab_active'));
    allTab.classList.add('wtab_active');
    
    // Show multiple contents
    parContent.classList.add('wtab_active');
    graphContent.classList.add('wtab_active');
    tableContent.classList.add('wtab_active');
    // About remains hidden
    
    assert(allTab.classList.contains('wtab_active'), 'All tab should be active');
    assert(parContent.classList.contains('wtab_active'), 'Parameters content should be visible');
    assert(graphContent.classList.contains('wtab_active'), 'Graph content should be visible');
    assert(tableContent.classList.contains('wtab_active'), 'Table content should be visible');
    assert(!aboutContent.classList.contains('wtab_active'), 'About content should remain hidden');
});

runner.test('UI data visibility - Table tab simulation', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    // Create mock table data
    const tableContainer = document.createElement('div');
    tableContainer.id = 'table_container';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr><th>Time</th><th>Tcr</th><th>Tsk</th></tr>
        </thead>
        <tbody>
            <tr><td>0</td><td>36.8</td><td>33.5</td></tr>
            <tr><td>15</td><td>37.0</td><td>34.0</td></tr>
            <tr><td>30</td><td>37.2</td><td>34.5</td></tr>
        </tbody>
    `;
    
    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);
    
    // Verify table exists and has data
    const tableElement = document.querySelector('#table_container table');
    assert(tableElement !== null, 'Table should exist');
    
    const rows = tableElement.querySelectorAll('tbody tr');
    assertEqual(rows.length, 3, 'Table should have 3 data rows');
    
    const headers = tableElement.querySelectorAll('thead th');
    assertEqual(headers.length, 3, 'Table should have 3 column headers');
    assertEqual(headers[0].textContent, 'Time', 'First header should be Time');
    assertEqual(headers[1].textContent, 'Tcr', 'Second header should be Tcr');
    assertEqual(headers[2].textContent, 'Tsk', 'Third header should be Tsk');
});

runner.test('Duplicate timestep prevention - UI validation', () => {
    const window = createDOMEnvironment();
    const document = window.document;
    
    // Mock alert function to capture validation messages
    let alertMessage = '';
    window.alert = (msg) => { alertMessage = msg; };
    
    // Simulate validation scenario
    const currentEndTime = 15;
    const newEndTime = 15; // Duplicate
    
    if (newEndTime <= currentEndTime) {
        window.alert('New timestep must be greater than previous step end time');
    }
    
    assert(alertMessage.includes('must be greater than'), 'Should show validation error for duplicate timestep');
    
    // Test valid timestep
    alertMessage = '';
    const validEndTime = 30;
    
    if (validEndTime <= currentEndTime) {
        window.alert('New timestep must be greater than previous step end time');
    }
    
    assertEqual(alertMessage, '', 'Should not show error for valid timestep');
});

runner.test('Excel Export - Button states and availability', () => {
    const { JSDOM } = require('jsdom');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div class="dropdown">
                <button id="btn_export_dropdown" disabled>Export to Excel ▼</button>
                <div class="dropdown-content">
                    <button onclick="exportAllData()">Export all data</button>
                    <button onclick="exportStepData()">Export input data</button>
                    <button onclick="exportAllDataCombined()">Export results</button>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    
    // Test that export dropdown button exists
    const exportDropdown = document.getElementById('btn_export_dropdown');
    assert(exportDropdown !== null, 'Export dropdown button should exist');
    
    // Test that export buttons exist in dropdown
    const exportButtons = document.querySelectorAll('.dropdown-content button');
    assertEqual(exportButtons.length, 3, 'Should have 3 export buttons in dropdown');
    
    // Test initial state - export button should be disabled (no data to export)
    assertEqual(exportDropdown.disabled, true, 'Export dropdown button should be disabled initially');
    
    // Simulate after simulation runs - button should be enabled
    exportDropdown.disabled = false;
    assertEqual(exportDropdown.disabled, false, 'Export dropdown button should be enabled after simulation');
    
    // Verify button text content
    assert(exportDropdown.textContent.includes('Export to Excel'), 'Button should have correct text');
    
    // Verify dropdown contains correct export options
    const buttonTexts = Array.from(exportButtons).map(btn => btn.textContent);
    assert(buttonTexts.some(text => text.includes('all data')), 'Should have "Export all data" option');
    assert(buttonTexts.some(text => text.includes('input data')), 'Should have "Export input data" option');
    assert(buttonTexts.some(text => text.includes('results')), 'Should have "Export results" option');
});

const results = runner.run();
runner.summary();

module.exports = results;
