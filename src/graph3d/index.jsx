import React, { useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { forceManyBody, forceLink, forceCenter } from 'd3-force-3d';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { setInitial3DPositions } from '../utils/forceSimulation.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';
import { SHAPE_3D } from '../constants/shapeConstants.js';

export default function Graph3D({ nodes = [], links = [], isRotating = true, setIsRotating, showBidirectional = false }) {
  const fgRef = useRef();
  const rotationIntervalRef = useRef();
  
  // Use the passed mock data or empty arrays as fallback
  const data = {
    nodes,
    links
  };

  // Configure charge force like in demo + camera orbit
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      // Use 3D-specific forces
      fgRef.current.d3Force('charge', forceManyBody().strength(-120));
      fgRef.current.d3Force('link', forceLink().distance(30));
      fgRef.current.d3Force('center', forceCenter(0, 0, 0));
      
      // Set initial 3D positions for proper Z-layering
      setInitial3DPositions(nodes);
      
      // Set initial camera position like in example
      const distance = 770; // 10% zoomed out
      fgRef.current.cameraPosition({ z: distance });
    }
  }, [nodes]);

  // Separate effect for rotation control
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      const distance = 770; // 10% zoomed out
      let angle = 0;

      if (isRotating) {
        // Start camera orbit animation
        rotationIntervalRef.current = setInterval(() => {
          if (fgRef.current) {
            fgRef.current.cameraPosition({
              x: distance * Math.sin(angle),
              z: distance * Math.cos(angle)
            });
            angle += Math.PI / 1000; // Much slower rotation
          }
        }, 10);
        fgRef.current.resumeAnimation();
      } else {
        // Stop rotation
        if (rotationIntervalRef.current) {
          clearInterval(rotationIntervalRef.current);
          rotationIntervalRef.current = null;
        }
        fgRef.current.pauseAnimation();
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

  return (
    <ForceGraph3D
        ref={fgRef}
        graphData={data}
        enableNavigationControls={!isRotating}
        nodeLabel={node => node.label || node.id}  // Tooltip shows label like 2D
        nodeVal={0}                      // Disable auto node size (causes standard spheres)
        nodeColor={() => 'transparent'}  // Make auto nodes invisible
        nodeOpacity={0}                  // Make auto nodes completely transparent
      nodeThreeObject={node => {
        // Create group for shape + labels
        const group = new THREE.Group();
        
        // Use fixed size since nodes don't have size property
        const size = 5 * 1.2;  // 20% bigger
        
        // Create 3D shape based on node type - using shape constants
        let geometry, material, shape;
        material = new THREE.MeshLambertMaterial({ 
          color: node.color || '#ffffff',
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide  // Render both sides to prevent disappearing
        });
        
        // Get geometry definition from constants
        const shapeConfig = SHAPE_3D[node.type] || SHAPE_3D.default;
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
        
        // Value sprite below shape (matching 2D graph) - adjust for bigger shape
        const displayValue = getNodeDisplayValue(node);
        if (displayValue) {
          const valueSprite = new SpriteText(displayValue);
          valueSprite.material.depthWrite = false;
          valueSprite.color = '#FFD700'; // Gold color like 2D
          valueSprite.textHeight = GRAPH_CONSTANTS.GRAPH_3D.VALUE_TEXT_HEIGHT; // smaller text
          valueSprite.position.y = -(size + 4); // closer to shape
          group.add(valueSprite);
        }
        
        return group;
      }}
      nodeThreeObjectExtend={true}     // like in demo
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
      linkDirectionalArrowColor={l => l.showArrow && (!showBidirectional || !l.isReverse) ? (l.arrowColor || '#ff4d4d') : undefined}
      linkDirectionalArrowRelPos={l => l.arrowPosition === 'source' ? 0.05 : 0.95}
      
      linkDirectionalParticles={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_COUNT}     // animated Partikel auf Links
      linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_SPEED}
      linkDirectionalParticleColor={GRAPH_CONSTANTS.COLORS.PARTICLE_COLOR}  // rote Partikel
      linkDirectionalParticleWidth={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_WIDTH}
      linkDistance={30}
      backgroundColor="#111111"        // dunkler Hintergrund
      width={window.innerWidth / 2}  // Half width for split screen
      height={window.innerHeight}
    />
  );
}