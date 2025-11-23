/**
 * Mean Radiant Temperature Tests
 */

const { createContext, loadModules, TestRunner, assertInRange } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Mean Radiant Temperature Tests');

runner.test('Mean radiant temperature calculation', () => {
    const Trad = context.boj.mrad_obj.util.mean_radiant_temp(30, 25, 0.95, 0.15, 0.5);
    assertInRange(Trad, 25, 40, 'Mean radiant temperature should be reasonable');
});

runner.test('Mean radiant temperature with natural convection', () => {
    const Trad = context.boj.mrad_obj.util.mean_radiant_temp_natural_conv(30, 25, 0.95, 0.15);
    assertInRange(Trad, 25, 40, 'Mean radiant temperature should be reasonable');
});

const results = runner.run();
runner.summary();

module.exports = results;
