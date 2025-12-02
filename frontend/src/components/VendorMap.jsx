import { useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import './VendorMap.css';

const geoUrl =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

export function VendorMap({ cases = [] }) {
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState('top');
  const viewportRef = useRef(null);
  const wrapperRef = useRef(null);

  const markers = (cases || []).reduce((acc, caseItem) => {
    if (!caseItem || !caseItem.location) return acc;
    const lon = Number(caseItem.location.lon);
    const lat = Number(caseItem.location.lat);
    if (
      !Number.isFinite(lon) ||
      !Number.isFinite(lat) ||
      lon > -50 ||
      lon < -170 ||
      lat < 15 ||
      lat > 75
    ) {
      return acc;
    }
    acc.push({ ...caseItem, coordinates: [lon, lat] });
    return acc;
  }, []);

  const handleMarkerMouseEnter = (caseItem, event) => {
    setHoveredMarker(caseItem);
    updateTooltipPosition(event);
  };

  const handleMarkerMouseMove = (event) => {
    if (hoveredMarker) {
      updateTooltipPosition(event);
    }
  };

  const updateTooltipPosition = (event) => {
    if (wrapperRef.current && viewportRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const x = event.clientX - wrapperRect.left;
      const y = event.clientY - wrapperRect.top;
      
      // Smart positioning: place tooltip above cursor, but adjust if near edges
      const tooltipWidth = 300; // max-width from CSS
      const tooltipHeight = 150; // estimated height
      const padding = 10;
      
      let placement = 'top';
      let adjustedX = x;
      let adjustedY = y;
      
      // Check if tooltip would overflow right
      if (x + tooltipWidth / 2 > wrapperRect.width - padding) {
        adjustedX = wrapperRect.width - tooltipWidth / 2 - padding;
      }
      // Check if tooltip would overflow left
      if (x - tooltipWidth / 2 < padding) {
        adjustedX = tooltipWidth / 2 + padding;
      }
      
      // Check if tooltip would overflow top (place below instead)
      if (y - tooltipHeight < padding) {
        placement = 'bottom';
        adjustedY = y + 20; // offset below cursor
      } else {
        adjustedY = y - 10; // offset above cursor
      }
      
      setTooltipPlacement(placement);
      setTooltipPosition({ 
        x: adjustedX, 
        y: adjustedY 
      });
    }
  };

  const handleMarkerMouseLeave = () => {
    setHoveredMarker(null);
  };

  return (
    <div className="vendor-map glass-card">
      <div className="vendor-map__header">
        <div>
          <h3>Vendor & ATP heatmap</h3>
          <p>Incoming orders and ATP posture by vendor location</p>
        </div>
        <div className="legend">
          <span><span className="dot dot--ok" /> Ready</span>
          <span><span className="dot dot--pending" /> Pending</span>
          <span><span className="dot dot--risk" /> At risk</span>
        </div>
      </div>
      <div className="vendor-map__wrapper" ref={wrapperRef}>
        <div className="vendor-map__viewport" ref={viewportRef} onMouseMove={handleMarkerMouseMove}>
          <ComposableMap projection="geoAlbersUsa" width={720} height={420}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} fill="#f4f0fb" stroke="#ffffff" strokeWidth={0.5} />
                ))
              }
            </Geographies>
            {markers.map((caseItem, index) => {
              if (!caseItem) return null;
              const coords = Array.isArray(caseItem.coordinates) ? caseItem.coordinates : null;
              if (!coords) return null;
              
              const isHovered = hoveredMarker?.id === caseItem.id;
              
              return (
                <Marker key={caseItem.id || Math.random()} coordinates={coords}>
                  <g
                    onMouseEnter={(e) => handleMarkerMouseEnter(caseItem, e)}
                    onMouseMove={(e) => handleMarkerMouseMove(e)}
                    onMouseLeave={handleMarkerMouseLeave}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle r={7} fill={badgeColor(caseItem.status)} stroke="#fff" strokeWidth={2} />
                    <circle r={12} fill="transparent" stroke="transparent" />
                    {isHovered && (
                      <text 
                        textAnchor="middle" 
                        y={-12} 
                        className="marker-label marker-label--hovered"
                      >
                        {caseItem.vendor || 'Unknown'}
                      </text>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
        {hoveredMarker && (
          <div
            className={`map-tooltip map-tooltip--${tooltipPlacement}`}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            <div className="tooltip-content">
              <div className="tooltip-title">{hoveredMarker.vendor || 'Unknown Vendor'}</div>
              <div className="tooltip-status">Status: {hoveredMarker.status || 'Unknown'}</div>
              <div className="tooltip-type">Type: {hoveredMarker.type || 'N/A'}</div>
              <div className="tooltip-notes">{hoveredMarker.atpNotes || 'No additional notes.'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const badgeColor = (status) => {
  if (status?.toLowerCase().includes('pending')) return '#ffbf69';
  if (status?.toLowerCase().includes('hold') || status?.toLowerCase().includes('review')) return '#ff6b6b';
  return '#5dd39e';
};

