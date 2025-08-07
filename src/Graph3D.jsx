import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { getNodeDisplayValue } from './utils/graphUtils.js';
import { setInitial3DPositions } from './utils/forceSimulation.js';
import { GRAPH_CONSTANTS } from './constants/graphConstants.js';

export default function Graph3D({ nodes = [], links = [], dimensions, isRotating = true, setIsRotating }) {
  const fgRef = useRef();
  const rotationIntervalRef = useRef();
  const angleRef = useRef(0); // Persist angle across start/stop
  
  
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
        
        // Disable navigation controls when rotating
        if (fgRef.current.controls) {
          fgRef.current.controls.enabled = false;
        }
      } else {
        // Stop camera rotation but keep D3 simulation running
        if (rotationIntervalRef.current) {
          clearInterval(rotationIntervalRef.current);
          rotationIntervalRef.current = null;
        }
        
        // Stay at current camera position when stopping (better UX)
        // User can now manually navigate from wherever they stopped
        
        // Enable user navigation controls when rotation is stopped
        if (fgRef.current.controls) {
          fgRef.current.controls.enabled = true;
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
        
        // Get node size - make shapes bigger
        const size = (node.size || 4) * 1.8;  // 1.8x bigger
        
        // Create 3D shape based on node type
        let geometry, material, shape;
        material = new THREE.MeshLambertMaterial({ 
          color: node.color || '#ffffff',
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide  // Render both sides to prevent disappearing
        });
        
        switch(node.type) {
          case 'environment':
            // Circle -> Sphere
            geometry = new THREE.SphereGeometry(size/2, 16, 16);
            break;
          case 'boundary':
            // Triangle -> More stable geometry options
            // Option 1: Cone with more segments for stability
            geometry = new THREE.ConeGeometry(size/2, size, 6);
            // Option 2: Tetrahedron (uncomment to test)
            // geometry = new THREE.TetrahedronGeometry(size/2);
            break;
          case 'system':
            // Diamond -> Octahedron (diamond-like shape)
            geometry = new THREE.OctahedronGeometry(size/2);
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
        labelSprite.textHeight = 8;
        labelSprite.position.y = size + 4; // closer to shape
        group.add(labelSprite);
        
        // Value sprite below shape (matching 2D graph) - adjust for bigger shape
        const displayValue = getNodeDisplayValue(node);
        if (displayValue) {
          const valueSprite = new SpriteText(displayValue);
          valueSprite.material.depthWrite = false;
          valueSprite.color = '#FFD700'; // Gold color like 2D
          valueSprite.textHeight = 6; // smaller text
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
        sprite.textHeight = 3;
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
      linkDirectionalParticles={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_COUNT}     // animated Partikel auf Links
      linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_SPEED}
      linkDirectionalParticleColor={() => '#FF0000'}  // Explicit red function (works for 3D)
      linkDirectionalParticleWidth={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_WIDTH}
      linkDistance={30}
      backgroundColor="#111111"        // dunkler Hintergrund
      width={dimensions.width3D}  // Dynamic width based on panel split
      height={dimensions.height}
    />
  );
}