import { useState, useEffect, useCallback } from 'react';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface CameraControls {
  camera: CameraState;
  panCamera: (deltaX: number, deltaY: number) => void;
  zoomCamera: (zoomDelta: number) => void;
  resetCamera: () => void;
}

const INITIAL_CAMERA: CameraState = {
  x: 0,
  y: 0,
  zoom: 1
};

const PAN_SPEED = 50;
const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export const useCamera = (): CameraControls => {
  const [camera, setCamera] = useState<CameraState>(INITIAL_CAMERA);

  const panCamera = useCallback((deltaX: number, deltaY: number) => {
    setCamera(prev => ({
      ...prev,
      x: prev.x + deltaX * PAN_SPEED / prev.zoom,
      y: prev.y + deltaY * PAN_SPEED / prev.zoom
    }));
  }, []);

  const zoomCamera = useCallback((zoomDelta: number) => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + zoomDelta * ZOOM_SPEED))
    }));
  }, []);

  const resetCamera = useCallback(() => {
    setCamera(INITIAL_CAMERA);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        event.preventDefault();
        panCamera(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        event.preventDefault();
        panCamera(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        panCamera(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        panCamera(1, 0);
        break;
      case '+':
      case '=':
        event.preventDefault();
        zoomCamera(1);
        break;
      case '-':
        event.preventDefault();
        zoomCamera(-1);
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        resetCamera();
        break;
    }
  }, [panCamera, zoomCamera, resetCamera]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    camera,
    panCamera,
    zoomCamera,
    resetCamera
  };
};