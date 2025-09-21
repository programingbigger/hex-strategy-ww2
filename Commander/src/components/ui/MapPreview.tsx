import React, { useEffect, useState } from 'react';
import { GameMap } from '../../types';

interface MapPreviewProps {
  selectedMap: GameMap | null;
}

const MapPreview: React.FC<MapPreviewProps> = ({ selectedMap }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset states when selected map changes
  useEffect(() => {
    if (selectedMap) {
      setImageLoaded(false);
      setImageError(false);
      setLoading(true);
    }
  }, [selectedMap]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setLoading(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    setLoading(false);
  };

  const renderMapPreview = () => {
    if (!selectedMap) {
      return null;
    }

    const imagePath = `/assets/images/maps/${selectedMap.id}.png`;

    if (loading) {
      return (
        <div className="map-preview-loading">
          <div className="loading-spinner">⟳</div>
          <div>Loading map preview...</div>
        </div>
      );
    }

    if (imageError || !imageLoaded) {
      return (
        <div className="map-preview-placeholder">
          <div className="placeholder-icon">🗺️</div>
          <div className="placeholder-text">Map preview not available</div>
          <div className="placeholder-subtext">
            No preview image found for {selectedMap.name}
          </div>
        </div>
      );
    }

    return (
      <div className="map-preview-image-container">
        <img
          src={imagePath}
          alt={`Preview of ${selectedMap.name}`}
          className="map-preview-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            objectFit: 'contain',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9'
          }}
        />
      </div>
    );
  };

  if (!selectedMap) {
    return (
      <div className="map-preview-container">
        <div className="map-preview-empty">
          <div className="empty-icon">📍</div>
          <div className="empty-text">Select a map to view preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-preview-container">
      <div className="map-preview-header">
        <h3 className="map-preview-title">{selectedMap.name}</h3>
      </div>

      <div className="map-preview-content">
        {renderMapPreview()}
        {/* Hidden img element to test if image exists */}
        {selectedMap && (
          <img
            src={`/assets/images/maps/${selectedMap.id}.png`}
            alt=""
            style={{ display: 'none' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      <div className="map-preview-description">
        <p>{selectedMap.description}</p>
      </div>

      {imageLoaded && !imageError && (
        <div className="map-info">
          <div className="info-title">Map Information</div>
          <div className="info-text">
            Preview image available for detailed battlefield overview
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;