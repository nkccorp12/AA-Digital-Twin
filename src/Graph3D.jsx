import React, { useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { getNodeDisplayValue } from './utils/graphUtils.js';

export default function Graph3D({ nodes = [], links = [] }) {
  const fgRef = useRef();
  
  // Use the passed mock data or empty arrays as fallback
  const data = {
    nodes,
    links
  };

  // Configure charge force like in demo + camera distance
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-120);
      
      // Set initial camera further out for better overview
      setTimeout(() => {
        fgRef.current.cameraPosition(
          { x: 350, y: 350, z: 350 },  // Perfect distance for overview
          { x: 0, y: 0, z: 0 },        // Look at center
          1000                         // Animation duration
        );
      }, 100);
    }
  }, [nodes]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
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
      linkDirectionalParticles={2}     // animated Partikel auf Links
      linkDirectionalParticleSpeed={0.005}
      backgroundColor="#111111"        // dunkler Hintergrund
      width={window.innerWidth / 2}  // Half width for split screen
      height={window.innerHeight}
    />
  );
}