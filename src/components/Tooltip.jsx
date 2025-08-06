import React, { useState, useEffect } from 'react';

export default function Tooltip({ children, content, position = { x: 0, y: 0 }, visible = false }) {
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    if (visible && position.x !== undefined && position.y !== undefined) {
      setTooltipStyle({
        position: 'fixed',
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
        zIndex: 1000,
        pointerEvents: 'none'
      });
    }
  }, [position, visible]);

  return (
    <>
      {children}
      {visible && content && (
        <div 
          style={tooltipStyle}
          className="bg-black text-white p-3 rounded-lg shadow-lg border border-gray-500 max-w-xs"
        >
          {content}
        </div>
      )}
    </>
  );
}

// Tooltip content components
export function NodeTooltip({ node }) {
  if (!node) return null;
  
  return (
    <div className="space-y-1">
      <div className="font-semibold text-sm">{node.label}</div>
      <div className="text-xs text-gray-300">
        <div>Type: {node.type}</div>
        {node.metadata && (
          <>
            <div>Confidence: {(node.metadata.confidence * 100).toFixed(0)}%</div>
            <div>Sources: {node.metadata.sourceCount}</div>
            <div>Updated: {new Date(node.metadata.lastUpdated).toLocaleDateString()}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function LinkTooltip({ link }) {
  if (!link) return null;
  
  return (
    <div className="space-y-1">
      <div className="font-semibold text-sm">{link.source.id || link.source} → {link.target.id || link.target}</div>
      <div className="text-xs text-gray-300">
        <div>Weight: {link.weight.toFixed(2)}</div>
        <div>Type: {link.influenceType}</div>
        {link.metadata && (
          <>
            <div>Sentiment: {link.metadata.sentiment > 0 ? '+' : ''}{link.metadata.sentiment.toFixed(2)}</div>
            <div>Occurrences: {link.metadata.occurrences}</div>
          </>
        )}
      </div>
    </div>
  );
}