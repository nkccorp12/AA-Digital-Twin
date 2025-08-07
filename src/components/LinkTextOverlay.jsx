import React, { useEffect, useRef, useState } from 'react';

/**
 * HTML Overlay for 2D link texts - analog to 3D linkThreeObject + linkPositionUpdate
 * Renders HTML elements positioned over the canvas like 3D SpriteText
 */
const LinkTextOverlay = ({ nodes, links, fgRef, dimensions }) => {
  const overlayRef = useRef(null);
  const [linkElements, setLinkElements] = useState([]);

  // Create link text elements (analog to linkThreeObject)
  useEffect(() => {
    if (!nodes.length || !links.length) {
      setLinkElements([]);
      return;
    }

    const elements = links.map((link, index) => {
      // Handle both string IDs and object references (like 3D)
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // Create link text (exact same format as 3D)
      const influenceText = link.influenceType || 'Connection';
      const weightText = link.weight ? `(${link.weight.toFixed(2)})` : '';
      const linkText = `${influenceText} ${weightText}`;

      return {
        id: `${sourceId}-${targetId}`,
        sourceId,
        targetId,
        text: linkText,
        index
      };
    });

    setLinkElements(elements);
  }, [nodes, links]);

  // Get bounding box for text element
  const getTextBounds = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: parseFloat(element.style.left) - rect.width / 2,
      y: parseFloat(element.style.top) - rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  };

  // Check if two rectangles overlap
  const rectsOverlap = (rect1, rect2) => {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
  };

  // Position update function with collision avoidance (analog to 3D linkPositionUpdate)
  const updateLinkPositions = () => {
    if (!fgRef.current || !overlayRef.current) return;

    // Use ForceGraph2D built-in coordinate conversion API (like 3D automatic positioning)
    const graph = fgRef.current;
    const positionedElements = [];
    
    linkElements.forEach((element, index) => {
      // Find source and target nodes
      const source = nodes.find(n => n.id === element.sourceId);
      const target = nodes.find(n => n.id === element.targetId);

      if (!source || !target || source.x === undefined || source.y === undefined) return;

      // Calculate middle point (same logic as 3D linkPositionUpdate)
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      // Find DOM element and position it (like sprite.position in 3D)
      const domElement = overlayRef.current.querySelector(`[data-link-id="${element.id}"]`);
      if (domElement) {
        // Use ForceGraph2D built-in coordinate conversion (analog to 3D sprite.position)
        const screenCoords = graph.graph2ScreenCoords(midX, midY);

        // Add small offset to spread out overlapping texts
        const offsetAngle = index * (Math.PI / 8); // Different angle for each link
        const offsetDistance = 15; // Small offset distance
        const offsetX = Math.cos(offsetAngle) * offsetDistance;
        const offsetY = Math.sin(offsetAngle) * offsetDistance;

        let finalX = screenCoords.x + offsetX;
        let finalY = screenCoords.y + offsetY;

        // Simple collision avoidance with previously positioned elements
        const testRect = {
          x: finalX - 22, // Approximate text width/2 (smaller for 8px text)
          y: finalY - 6,  // Approximate text height/2 (smaller for 8px text)
          width: 44,      // Smaller width for 8px text
          height: 10      // Smaller height for 8px text
        };

        // Check collision with already positioned elements
        let collisionFound = false;
        let attempts = 0;
        while (attempts < 8 && collisionFound === false) {
          collisionFound = false;
          for (const positioned of positionedElements) {
            if (rectsOverlap(testRect, positioned)) {
              collisionFound = true;
              // Try different offset
              attempts++;
              const newAngle = offsetAngle + (attempts * Math.PI / 6);
              const newDistance = offsetDistance + (attempts * 5);
              finalX = screenCoords.x + Math.cos(newAngle) * newDistance;
              finalY = screenCoords.y + Math.sin(newAngle) * newDistance;
              testRect.x = finalX - 22;
              testRect.y = finalY - 6;
              break;
            }
          }
          if (!collisionFound) break;
        }

        domElement.style.left = `${finalX}px`;
        domElement.style.top = `${finalY}px`;

        // Remember this position for collision checking
        positionedElements.push({
          x: finalX - 22,
          y: finalY - 6,
          width: 44,
          height: 12
        });
      }
    });
  };

  // Continuous position updates using ForceGraph2D API (analog to 3D linkPositionUpdate)
  useEffect(() => {
    if (!fgRef.current || linkElements.length === 0) return;

    // Initial position update
    updateLinkPositions();
    
    // Continuous updates for node animation and viewport changes
    // ForceGraph2D handles zoom/pan internally, we just need to keep calling graph2ScreenCoords
    const intervalId = setInterval(updateLinkPositions, 16); // 60 FPS for smooth movement

    return () => {
      clearInterval(intervalId);
    };
  }, [linkElements, nodes]);

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
        zIndex: 50 // Below node titles (which have zIndex: 200)
      }}
    >
      {linkElements.map(element => (
        <div
          key={element.id}
          data-link-id={element.id}
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)', // Center text on position
            color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
            fontSize: '10px', // Slightly bigger text for better readability
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'normal', // Normal weight, not bold
            textAlign: 'center',
            // backgroundColor removed to eliminate black box
            padding: '1px 2px', // Tighter padding for smaller text
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)', // Better shadow
            userSelect: 'none', // Prevent text selection
            pointerEvents: 'none', // Don't interfere with graph interactions
            backdropFilter: 'blur(1px)' // Subtle blur effect
          }}
        >
          {element.text}
        </div>
      ))}
    </div>
  );
};

export default LinkTextOverlay;