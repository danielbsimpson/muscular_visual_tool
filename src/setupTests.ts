import '@testing-library/jest-dom/vitest';

// jsdom has no WebGL; stub getContext to return null so the WebGL-support check
// resolves cleanly to `false` (rendering the non-3D fallback) without noisy errors.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => null,
  configurable: true,
});
