(function (root) {
  'use strict';
  const ETA = 0.1;
  function parameters(n, k, eta = ETA) {
    if (!Number.isInteger(n) || n < 1 || !Number.isInteger(k) || k < 1 || k > n || !(eta > 0 && eta < 0.5)) throw new RangeError('Invalid n, k or eta');
    const s = 1 - 2 * eta;
    const r = (k - 1) / n;
    return Object.freeze({n, k, eta, s, r, baselineStop: 2 * eta, maximalStop: 2 * eta + s * r,
      baselineCost: s, maximalCost: s * k * (n - k + 1) / n, ratio: k * (n - k + 1) / n,
      lower: Math.floor((n + 1) ** 2 / 4) / n, upper: (n + 1) ** 2 / (4 * n),
      knownTwoCoordinate: n === 2});
  }
  function branch(n, k, u, eta = ETA) {
    if (!(u >= 0 && u < 1)) throw new RangeError('Draw must lie in [0,1)');
    const p = parameters(n, k, eta);
    return Object.freeze({output: u < eta ? 2 : 1, baselineQueries: u < p.baselineStop ? 0 : 1,
      maximalQueries: u < p.maximalStop ? 0 : k});
  }
  function law(theta, k, eta = ETA) {
    if (!Array.isArray(theta) || !theta.length || theta.some(x => !Number.isFinite(x) || x < 0 || x > 1)) throw new RangeError('Coordinates must lie in [0,1]');
    const p = parameters(theta.length, k, eta);
    return eta + p.s * Math.max(p.r, 1 - theta.reduce((a,b) => a + b, 0) / theta.length);
  }
  const api = Object.freeze({ETA, parameters, branch, law});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SamplingMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
