/**
 * Test Helper - Shared utilities for all tests
 */

const fs = require('fs');
const vm = require('vm');

// Create a global context for the modules
function createContext() {
    return {
        console: console,
        boj: {},
        document: {
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({}),
            addEventListener: () => {},
            getElementById: () => null,
            body: {}
        },
        window: {},
        setTimeout: setTimeout,
        setInterval: setInterval
    };
}

// Load all required PHS modules
function loadModules(context) {
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
        'lib/PHS_inpar_wci.js',
        'lib/PHS_wci.js'
    ];

    modules.forEach(modulePath => {
        const code = fs.readFileSync(modulePath, 'utf8');
        vm.runInNewContext(code, context);
    });

    return context;
}

// Simple test framework
class TestRunner {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    test(name, testFunc) {
        this.tests.push({ name, testFunc });
    }

    run() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${this.suiteName}`);
        console.log('='.repeat(60));

        for (const test of this.tests) {
            this.results.total++;
            try {
                test.testFunc();
                this.results.passed++;
                console.log(`✓ PASS: ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.log(`✗ FAIL: ${test.name}`);
                console.log(`  Error: ${error.message}`);
            }
        }

        return this.results;
    }

    summary() {
        console.log(`\nResults: ${this.results.passed}/${this.results.total} passed`);
        if (this.results.failed > 0) {
            console.log(`Failed: ${this.results.failed}`);
        }
    }
}

// Assertion helpers
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertClose(actual, expected, tolerance = 0.01, message) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(message || `Expected ${expected} ± ${tolerance}, got ${actual}`);
    }
}

function assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
        throw new Error(message || `Expected ${actual} > ${expected}`);
    }
}

function assertLessThan(actual, expected, message) {
    if (actual >= expected) {
        throw new Error(message || `Expected ${actual} < ${expected}`);
    }
}

function assertInRange(actual, min, max, message) {
    if (actual < min || actual > max) {
        throw new Error(message || `Expected ${actual} to be between ${min} and ${max}`);
    }
}

module.exports = {
    createContext,
    loadModules,
    TestRunner,
    assert,
    assertEqual,
    assertClose,
    assertGreaterThan,
    assertLessThan,
    assertInRange
};
