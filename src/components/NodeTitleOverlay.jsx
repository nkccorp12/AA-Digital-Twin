import React, { useEffect, useRef, useState } from 'react';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

/**
 * HTML Overlay for 2D node titles and values
 * Renders HTML elements positioned over the canvas to ensure they stay in front of link texts
 */
const NodeTitleOverlay = ({ nodes, fgRef, dimensions }) => {
  const overlayRef = useRef(null);
  const [nodeElements, setNodeElements] = useState([]);

  // Create node text elements
  useEffect(() => {
    if (!nodes.length) {
      setNodeElements([]);
      return;
    }

    const elements = nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      displayValue: getNodeDisplayValue(node),
      size: (node.size || GRAPH_CONSTANTS.NODE_SIZES.MIN) * 1.8 // Same as canvas rendering
    }));

    setNodeElements(elements);
  }, [nodes]);

  // Position update function
  const updateNodePositions = () => {
    if (!fgRef.current || !overlayRef.current) return;

    const graph = fgRef.current;
    
    nodeElements.forEach(element => {
      // Find the node with current position
      const node = nodes.find(n => n.id === element.id);
      if (!node || node.x === undefined || node.y === undefined) return;

      // Find DOM elements for label and value
      const labelElement = overlayRef.current.querySelector(`[data-node-label-id="${element.id}"]`);
      const valueElement = overlayRef.current.querySelector(`[data-node-value-id="${element.id}"]`);

      if (labelElement || valueElement) {
        // Use ForceGraph2D built-in coordinate conversion
        const screenCoords = graph.graph2ScreenCoords(node.x, node.y);

        // Position label above node
        if (labelElement) {
          labelElement.style.left = `${screenCoords.x}px`;
          labelElement.style.top = `${screenCoords.y - element.size - 20}px`; // More space above node
        }

        // Position value below node
        if (valueElement && element.displayValue) {
          valueElement.style.left = `${screenCoords.x}px`;
          valueElement.style.top = `${screenCoords.y + element.size + 15}px`; // More space below node
        }
      }
    });
  };

  // Continuous position updates
  useEffect(() => {
    if (!fgRef.current || nodeElements.length === 0) return;

    // Initial position update
    updateNodePositions();
    
    // Continuous updates for node animation and viewport changes
    const intervalId = setInterval(updateNodePositions, 16); // 60 FPS

    return () => {
      clearInterval(intervalId);
    };
  }, [nodeElements, nodes]);

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: dimensions.width2D,
        height: dimensions.height,
        pointerEvents: 'none', // Don't interfere with graph interactions
        zIndex: 200 // Above link texts (which have zIndex: 100)
      }}
    >
      {nodeElements.map(element => (
        <React.Fragment key={element.id}>
          {/* Node Label */}
          <div
            data-node-label-id={element.id}
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)', // Center text on position
              color: GRAPH_CONSTANTS.COLORS.TEXT_PRIMARY,
              fontSize: '16px', // Double size for better visibility
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)', // Strong shadow for visibility
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            {element.label}
          </div>
          
          {/* Node Value (if exists) */}
          {element.displayValue && (
            <div
              data-node-value-id={element.id}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)', // Center text on position
                color: GRAPH_CONSTANTS.COLORS.TEXT_VALUE,
                fontSize: '10px', // Bigger for better readability
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)', // Strong shadow for visibility
                // No background - clean look
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {element.displayValue}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NodeTitleOverlay;