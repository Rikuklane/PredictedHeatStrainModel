/**
 * Canvas Utility Tests
 */

const { createContext, loadModules, TestRunner, assertEqual, assertClose } = require('./test-helper');

const context = createContext();
loadModules(context);

const runner = new TestRunner('Canvas Utility Tests');

runner.test('Matrix identity creation', () => {
    const mat = context.boj.canvas_util.new_mat_hom();
    assertEqual(mat.as_array().length, 6, 'Matrix should have 6 elements');
    assertEqual(mat.as_array()[0], 1, 'First element should be 1');
    assertEqual(mat.as_array()[3], 1, 'Fourth element should be 1');
});

runner.test('Matrix translation', () => {
    const mat = context.boj.canvas_util.new_mat_hom();
    mat.translate(10, 20);
    const result = mat.as_array();
    assertEqual(result[4], 10, 'X translation should be 10');
    assertEqual(result[5], 20, 'Y translation should be 20');
});

runner.test('Matrix scaling', () => {
    const mat = context.boj.canvas_util.new_mat_hom();
    mat.scale(2, 3);
    const result = mat.as_array();
    assertEqual(result[0], 2, 'X scale should be 2');
    assertEqual(result[3], 3, 'Y scale should be 3');
});

runner.test('Matrix rotation', () => {
    const mat = context.boj.canvas_util.new_mat_hom();
    mat.rotate_deg(90);
    const result = mat.as_array();
    assertClose(result[0], 0, 0.001, 'Cos 90° should be ~0');
    assertClose(result[1], 1, 0.001, 'Sin 90° should be ~1');
    assertClose(result[2], -1, 0.001, 'Negative sin 90° should be ~-1');
    assertClose(result[3], 0, 0.001, 'Cos 90° should be ~0');
});

const results = runner.run();
runner.summary();

module.exports = results;
