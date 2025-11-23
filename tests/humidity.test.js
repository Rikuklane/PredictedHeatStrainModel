/**
 * Humidity Object Tests
 */

const { createContext, loadModules, TestRunner, assert, assertClose, assertInRange } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Humidity Object Tests');

runner.test('Saturation pressure calculation', () => {
    const pws = context.boj.humidity_obj.util.Pws_from_Tdb(25);
    assertInRange(pws, 3000, 3500, 'Saturation pressure at 25°C should be reasonable');
});

runner.test('Humidity ratio calculation', () => {
    const pw = 2000; // Pa
    const patm = 101325; // Pa
    const w = context.boj.humidity_obj.util.W_from_Pw_Patm(pw, patm);
    assertInRange(w, 0, 1, 'Humidity ratio should be between 0 and 1');
});

runner.test('Relative humidity calculation', () => {
    const pw = 2000; // Pa
    const pwsat = 3000; // Pa
    const rh = context.boj.humidity_obj.util.rh_from_Pw_Pws(pw, pwsat);
    const rhPercent = rh * 100;
    assertClose(rhPercent, 66.67, 0.1, 'Relative humidity should be ~66.67%');
});

runner.test('Bisection method for root finding', () => {
    const func = (x) => x - 5;
    const root = context.boj.humidity_obj.util.bisect(func, 0, 10, 0.001, 100);
    assertClose(root, 5, 0.01, 'Should find root at x=5');
});

const results = runner.run();
runner.summary();

module.exports = results;
