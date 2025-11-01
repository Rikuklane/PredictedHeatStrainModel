// Load dependencies
require('../lib/parameter_data_obj.js');
require('../lib/canvas_util.js');

describe('Canvas Utility Functions', () => {
  describe('Matrix Homogeneous Transformations', () => {
    let mat;

    beforeEach(() => {
      mat = new boj.canvas_util.mat_hom();
    });

    test('should create identity matrix by default', () => {
      expect(mat.as_array()).toEqual([1, 0, 0, 1, 0, 0]);
    });

    test('should reset to identity matrix', () => {
      mat.mat = [2, 1, 3, 4, 5, 6];
      mat.reset();
      expect(mat.as_array()).toEqual([1, 0, 0, 1, 0, 0]);
    });

    test('should set matrix correctly', () => {
      const newMat = [2, 1, 3, 4, 5, 6];
      mat.set_mat(newMat);
      expect(mat.as_array()).toEqual(newMat);
    });

    test('should reject invalid matrix and reset to identity', () => {
      mat.set_mat([1, 2, 3]); // Invalid length
      expect(mat.as_array()).toEqual([1, 0, 0, 1, 0, 0]);
    });

    test('should translate correctly', () => {
      mat.translate(10, 20);
      expect(mat.as_array()).toEqual([1, 0, 0, 1, 10, 20]);
    });

    test('should scale correctly', () => {
      mat.scale(2, 3);
      expect(mat.as_array()).toEqual([2, 0, 0, 3, 0, 0]);
    });

    test('should rotate degrees correctly', () => {
      mat.rotate_deg(90);
      const result = mat.as_array();
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(1, 5);
      expect(result[2]).toBeCloseTo(-1, 5);
      expect(result[3]).toBeCloseTo(0, 5);
    });

    test('should rotate radians correctly', () => {
      mat.rotate_rad(Math.PI / 2);
      const result = mat.as_array();
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(1, 5);
      expect(result[2]).toBeCloseTo(-1, 5);
      expect(result[3]).toBeCloseTo(0, 5);
    });

    test('should multiply matrices correctly', () => {
      const mat2 = new boj.canvas_util.mat_hom([2, 0, 0, 2, 10, 20]);
      mat.multiply(mat2);
      expect(mat.as_array()).toEqual([2, 0, 0, 2, 10, 20]);
    });

    test('should copy matrix correctly', () => {
      mat.translate(5, 10);
      const copied = mat.copy();
      expect(copied.as_array()).toEqual(mat.as_array());
      expect(copied).not.toBe(mat); // Different objects
    });

    test('should transform points correctly', () => {
      mat.translate(10, 20);
      mat.scale(2, 3);
      const point = mat.convert_point(5, 5);
      expect(point.x).toBeCloseTo(20, 5);
      expect(point.y).toBeCloseTo(35, 5);
    });
  });
});
