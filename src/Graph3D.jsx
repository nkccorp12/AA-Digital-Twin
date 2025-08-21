import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { getNodeDisplayValue, pairHashAngle } from './utils/graphUtils.js';
import { setInitial3DPositions } from './utils/forceSimulation.js';
import { GRAPH_CONSTANTS } from './constants/graphConstants.js';
import { SHAPE_3D, SHAPE_3D_ALT } from './constants/shapeConstants.js';
import { getNodeColor } from './utils/colorUtils.js';

export default function Graph3D({ nodes = [], links = [], dimensions, isRotating = true, setIsRotating, showBidirectional = false, alternativeShapes = false, showMainValues = true, showInOutValues = false }) {
  const fgRef = useRef();
  const rotationIntervalRef = useRef();
  const angleRef = useRef(0); // Persist angle across start/stop
  
  // Constants for curvature
  const BASE_CURVE = 0.28;
  
  
  
  
  // Use the passed mock data or empty arrays as fallback
  const data = {
    nodes,
    links
  };

  // Configure charge force like in demo + camera orbit
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-120);
      
      // Initial 3D positions are now set in App.jsx before cloning
      // No need to call setInitial3DPositions here anymore
      
      // Set initial camera position (start at rotation position to avoid jump)
      const distance = 400; // Increased for better overview of the graph
      fgRef.current.cameraPosition({ x: 0, z: distance });
    }
  }, [nodes]);

  // Separate effect for rotation control (camera only, keep physics running)
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      const distance = 400; // Same distance as initial camera

      if (isRotating) {
        // Start camera orbit animation from current angle (no jump)
        rotationIntervalRef.current = setInterval(() => {
          if (fgRef.current) {
            fgRef.current.cameraPosition({
              x: distance * Math.sin(angleRef.current),
              z: distance * Math.cos(angleRef.current)
            });
            angleRef.current += Math.PI / 1000; // Much slower rotation
          }
        }, 10);
        
        // Completely disable all user interactions during rotation
        if (fgRef.current.controls) {
          const controls = fgRef.current.controls();
          controls.enabled = false;
          controls.noZoom = true;
          controls.noPan = true;
          controls.noRotate = true;
        }
      } else {
        // Stop camera rotation but keep D3 simulation running
        if (rotationIntervalRef.current) {
          clearInterval(rotationIntervalRef.current);
          rotationIntervalRef.current = null;
        }
        
        // Stay at current camera position when stopping (better UX)
        // User can now manually navigate from wherever they stopped
        
        // Re-enable all user interactions when rotation is stopped
        if (fgRef.current.controls) {
          const controls = fgRef.current.controls();
          controls.enabled = true;
          controls.noZoom = false;
          controls.noPan = false;
          controls.noRotate = false;
        }
        
        // ✅ CRITICAL FIX: Keep D3 force simulation running!
        // DON'T call pauseAnimation() - it stops physics and causes explosion
        // The force simulation needs to keep running to maintain stable node positions
      }

      // Cleanup interval on effect change or component unmount
      return () => {
        if (rotationIntervalRef.current) {
          clearInterval(rotationIntervalRef.current);
          rotationIntervalRef.current = null;
        }
      };
    }
  }, [nodes, isRotating]);


  // Debug & Force: Check and fix Three.js renderer size immediately
  useEffect(() => {
    if (fgRef.current && fgRef.current.renderer && dimensions?.width3D && dimensions?.height) {
      const renderer = fgRef.current.renderer();
      const actualSize = renderer.getSize(new THREE.Vector2());
      const targetWidth = dimensions.width3D;
      const targetHeight = dimensions.height;
      const widthDiff = Math.abs(actualSize.width - targetWidth);
      const match = widthDiff < 5 ? '✅' : '❌';
      
      if (widthDiff >= 5) {
        // Force immediate renderer resize
        renderer.setSize(targetWidth, targetHeight);
      }
    }
  }, [dimensions?.width3D, dimensions?.height]);

  return (
    <ForceGraph3D
        ref={fgRef}
        graphData={data}
        enableNavigationControls={true}
        nodeLabel={node => node.label || node.id}  // Tooltip shows label like 2D
        nodeVal={0}                      // Disable auto node size (causes standard spheres)
        nodeColor={() => 'transparent'}  // Make auto nodes invisible
        nodeOpacity={0}                  // Make auto nodes completely transparent
      nodeThreeObject={node => {
        // Create group for shape + labels
        const group = new THREE.Group();
        
        // Use fixed size since nodes don't have size property
        const size = 7 * 1.2;  // 20% bigger
        
        // Create 3D shape based on node type - using shape constants
        let geometry, material, shape;
        material = new THREE.MeshLambertMaterial({ 
          color: getNodeColor(node.type, alternativeShapes),
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide  // Render both sides to prevent disappearing
        });
        
        // Get geometry definition from constants
        const shapeSet = alternativeShapes ? SHAPE_3D_ALT : SHAPE_3D;
        const shapeConfig = shapeSet[node.type] || shapeSet.default;
        const geometryConfig = shapeConfig(size);
        
        // Create geometry based on type and args
        switch(geometryConfig.type) {
          case 'SphereGeometry':
            geometry = new THREE.SphereGeometry(...geometryConfig.args);
            break;
          case 'ConeGeometry':
            geometry = new THREE.ConeGeometry(...geometryConfig.args);
            break;
          case 'OctahedronGeometry':
            geometry = new THREE.OctahedronGeometry(...geometryConfig.args);
            break;
          case 'BoxGeometry':
            geometry = new THREE.BoxGeometry(...geometryConfig.args);
            break;
          default:
            geometry = new THREE.SphereGeometry(size/2, 16, 16);
        }
        
        shape = new THREE.Mesh(geometry, material);
        group.add(shape);
        
        // Main label sprite above shape - adjust for bigger shape
        const labelSprite = new SpriteText(node.label || node.id);
        labelSprite.material.depthWrite = false;
        labelSprite.color = '#ffffff';
        labelSprite.textHeight = GRAPH_CONSTANTS.GRAPH_3D.TEXT_HEIGHT;
        labelSprite.position.y = size + 4; // closer to shape
        group.add(labelSprite);
        
        // Value sprite(s) below shape (matching 2D graph) - adjust for bigger shape
        const displayValue = getNodeDisplayValue(node, { showMainValues, showInOutValues });
        if (displayValue) {
          if (Array.isArray(displayValue)) {
            // Multi-line display
            displayValue.forEach((line, index) => {
              const valueSprite = new SpriteText(line);
              valueSprite.material.depthWrite = false;
              valueSprite.color = '#FFD700'; // Gold color like 2D
              valueSprite.textHeight = GRAPH_CONSTANTS.GRAPH_3D.VALUE_TEXT_HEIGHT; // smaller text
              valueSprite.position.y = -(size + 4 + (index * 6)); // Stack lines below shape
              group.add(valueSprite);
            });
          } else {
            // Single line display
            const valueSprite = new SpriteText(displayValue);
            valueSprite.material.depthWrite = false;
            valueSprite.color = '#FFD700'; // Gold color like 2D
            valueSprite.textHeight = GRAPH_CONSTANTS.GRAPH_3D.VALUE_TEXT_HEIGHT; // smaller text
            valueSprite.position.y = -(size + 4); // closer to shape
            group.add(valueSprite);
          }
        }
        
        return group;
      }}
      nodeThreeObjectExtend={true}     // like in demo
      linkColor={(link) => {
        if (!showBidirectional) return '#666666'; // Gray for unidirectional
        return link.isReverse ? '#2b6cff' : '#ff4d4d'; // Blue/Red for bidirectional
      }}
      linkOpacity={0.8}
      linkWidth={1}  // Same thickness for both directions
      linkCurvature={(link) => {
        if (!showBidirectional) return 0;
        return link.isReverse ? -BASE_CURVE : BASE_CURVE; // Opposite curves for separation
      }}
      linkCurveRotation={(link) => showBidirectional ? pairHashAngle(link) : 0}
      linkThreeObjectExtend={true}
      linkThreeObject={link => {
        // Fix object reference issue: handle both string IDs and object references
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        // Create text sprite showing influenceType and weight (like 2D graph)
        const influenceText = link.influenceType || 'Connection';
        const weightText = link.weight ? `(${link.weight.toFixed(2)})` : '';
        const linkText = `${influenceText} ${weightText}`;
        
        const sprite = new SpriteText(linkText);
        sprite.color = 'lightgrey';
        sprite.textHeight = GRAPH_CONSTANTS.GRAPH_3D.LINK_TEXT_HEIGHT;
        sprite.material.depthWrite = false;
        return sprite;
      }}
      linkPositionUpdate={(sprite, { start, end }) => {
        const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
          [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
        })));
        
        // Position sprite in middle of link
        Object.assign(sprite.position, middlePos);
      }}
      // Dynamic arrows based on link showArrow property - only show on forward links in bidirectional mode
      linkDirectionalArrowLength={l => l.showArrow && (!showBidirectional || !l.isReverse) ? ((l.arrowLength || 4) * 0.5) : 0}
      linkDirectionalArrowColor={l => l.showArrow && (!showBidirectional || !l.isReverse) ? (l.arrowColor || (showBidirectional ? '#ff4d4d' : '#ff4d4d')) : undefined}
      linkDirectionalArrowRelPos={l => l.arrowPosition === 'source' ? 0.05 : 0.95}
      
      linkDirectionalParticles={2}     // animated Partikel auf Links
      linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_SPEED}
      linkDirectionalParticleColor={(link) => link.isReverse ? '#2b6cff' : '#ff4d4d'}  // Blue for reverse, red for original
      linkDirectionalParticleWidth={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_WIDTH}
      linkDistance={30}
      backgroundColor="#111111"        // dunkler Hintergrund
      width={dimensions.width3D}  // Dynamic width based on panel split
      height={dimensions.height}
    />
  );
}