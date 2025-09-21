import React from 'react';

interface ZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  minZoom?: number;
  maxZoom?: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom = 0.5,
  maxZoom = 3
}) => {
  const zoomPercentage = Math.round(currentZoom * 100);
  const canZoomIn = currentZoom < maxZoom;
  const canZoomOut = currentZoom > minZoom;

  // Handle mouse wheel for zoom
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    if (event.deltaY < 0 && canZoomIn) {
      onZoomIn();
    } else if (event.deltaY > 0 && canZoomOut) {
      onZoomOut();
    }
  };

  return (
    <div
      className="zoom-controls"
      onWheel={handleWheel}
      style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      backgroundColor: 'rgba(42, 42, 42, 0.9)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #555',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    }}>
      {/* Zoom In Button */}
      <button
        className="zoom-button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title="Zoom In (+)"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: canZoomIn ? '#4a5568' : '#2d3748',
          color: canZoomIn ? '#fff' : '#718096',
          border: '1px solid #555',
          borderRadius: '4px',
          cursor: canZoomIn ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.backgroundColor = '#5a6578';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = canZoomIn ? '#4a5568' : '#2d3748';
        }}
      >
        +
      </button>

      {/* Zoom Level Display */}
      <div style={{
        backgroundColor: '#1a202c',
        color: '#e2e8f0',
        padding: '6px 8px',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '1px solid #555',
        minWidth: '50px'
      }}>
        {zoomPercentage}%
      </div>

      {/* Zoom Out Button */}
      <button
        className="zoom-button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title="Zoom Out (-)"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: canZoomOut ? '#4a5568' : '#2d3748',
          color: canZoomOut ? '#fff' : '#718096',
          border: '1px solid #555',
          borderRadius: '4px',
          cursor: canZoomOut ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.backgroundColor = '#5a6578';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = canZoomOut ? '#4a5568' : '#2d3748';
        }}
      >
        −
      </button>

      {/* Reset Zoom Button */}
      <button
        className="zoom-button reset-zoom"
        onClick={onResetZoom}
        title="Reset Zoom (R)"
        style={{
          width: '40px',
          height: '20px',
          backgroundColor: '#4a5568',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          marginTop: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5a6578';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4a5568';
        }}
      >
        R
      </button>

      {/* Help Text */}
      <div style={{
        fontSize: '10px',
        color: '#a0aec0',
        textAlign: 'center',
        marginTop: '4px',
        lineHeight: '1.2'
      }}>
        Keys: +/- or<br />
        mouse wheel
      </div>
    </div>
  );
};

export default ZoomControls;