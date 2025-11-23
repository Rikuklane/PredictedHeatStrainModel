/**
 * Main Unit Test Runner
 * Runs all unit tests from the tests/ directory
 * Run with: node test.unit.js
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('PHS Unit Test Suite');
console.log('========================================\n');

// Find all test files in current directory
const testsDir = __dirname;
const testFiles = fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.test.js'))
    .sort();

console.log(`Found ${testFiles.length} test files:\n`);
testFiles.forEach(file => console.log(`  - ${file}`));
console.log('');

// Run all tests and collect results
const allResults = {
    passed: 0,
    failed: 0,
    total: 0,
    suites: []
};

for (const testFile of testFiles) {
    const testPath = path.join(testsDir, testFile);
    try {
        const results = require(testPath);
        allResults.passed += results.passed;
        allResults.failed += results.failed;
        allResults.total += results.total;
        allResults.suites.push({
            name: testFile,
            results: results
        });
    } catch (error) {
        console.error(`\n✗ Error running ${testFile}:`);
        console.error(`  ${error.message}`);
        allResults.failed++;
        allResults.total++;
    }
}

// Print final summary
console.log('\n' + '='.repeat(60));
console.log('FINAL SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${allResults.total}`);
console.log(`Passed: ${allResults.passed} (${((allResults.passed/allResults.total)*100).toFixed(1)}%)`);
console.log(`Failed: ${allResults.failed}`);
console.log('='.repeat(60));

// Print per-suite breakdown
console.log('\nPer-Suite Results:');
allResults.suites.forEach(suite => {
    const passRate = ((suite.results.passed / suite.results.total) * 100).toFixed(1);
    const status = suite.results.failed === 0 ? '✓' : '✗';
    console.log(`  ${status} ${suite.name}: ${suite.results.passed}/${suite.results.total} (${passRate}%)`);
});

console.log('');

// Exit with appropriate code
process.exit(allResults.failed > 0 ? 1 : 0);
