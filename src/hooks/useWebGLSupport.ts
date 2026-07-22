import { useEffect, useState } from 'react';

/**
 * Detects whether the browser can create a WebGL context. Returns `false` until
 * the check runs on mount, so server/test environments render the non-3D fallback.
 */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
