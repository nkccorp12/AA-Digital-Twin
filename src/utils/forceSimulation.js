import * as d3 from 'd3-force-3d';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

/**
 * Configure 2D force simulation
 * @param {Object} forceGraph - The force graph instance
 */
export const configure2DForces = (forceGraph) => {
  const forces = GRAPH_CONSTANTS.FORCES['2D'];
  
  forceGraph.d3Force('charge', d3.forceManyBody().strength(forces.CHARGE_STRENGTH));
  forceGraph.d3Force('link', d3.forceLink().distance(link => 
    forces.LINK_DISTANCE_BASE + link.weight * forces.LINK_DISTANCE_MULTIPLIER
  ));
  forceGraph.d3Force('center', d3.forceCenter());
};

/**
 * Configure 3D force simulation - simple approach to avoid errors
 * @param {Object} forceGraph - The force graph instance
 */
export const configure3DForces = (forceGraph) => {
  const forces = GRAPH_CONSTANTS.FORCES['3D'];
  
  // Standard charge force
  forceGraph.d3Force('charge', d3.forceManyBody().strength(forces.CHARGE_STRENGTH));
  
  // Link forces
  forceGraph.d3Force('link', d3.forceLink().distance(link => 
    forces.LINK_DISTANCE_BASE + link.weight * forces.LINK_DISTANCE_MULTIPLIER
  ));
  
  // Center force
  forceGraph.d3Force('center', d3.forceCenter(0, 0, 0));
  
  // Optional Z-force for stability (prevents wild Z movement)
  forceGraph.d3Force('z', d3.forceZ(0).strength(forces.CHARGE_STRENGTH / 10));
};

/**
 * Set initial 3D node positions to prevent flat start
 * @param {Array} nodes - Array of nodes
 */
export const setInitial3DPositions = (nodes) => {
  nodes.forEach(node => {
    // Set initial Z positions based on node type
    if (node.type === 'environment') {
      node.z = 100 + (Math.random() - 0.5) * 50;  // Top layer with variation
    } else if (node.type === 'boundary') {
      node.z = (Math.random() - 0.5) * 50;        // Middle layer with variation
    } else if (node.type === 'system') {
      node.z = -100 + (Math.random() - 0.5) * 50; // Bottom layer with variation
    }
    
    // Add some random X and Y positioning too
    if (!node.x) node.x = (Math.random() - 0.5) * 200;
    if (!node.y) node.y = (Math.random() - 0.5) * 200;
  });
};

/**
 * Set initial camera position for 3D graph
 * @param {Object} forceGraph - The 3D force graph instance
 */
export const setInitial3DCameraPosition = (forceGraph) => {
  const distance = GRAPH_CONSTANTS.GRAPH_3D.CAMERA_DISTANCE;
  const animationMs = GRAPH_CONSTANTS.ANIMATION.CAMERA_TRANSITION_MS;
  
  setTimeout(() => {
    forceGraph.cameraPosition(
      { x: distance, y: distance, z: distance }, 
      { x: 0, y: 0, z: 0 }, 
      animationMs
    );
  }, GRAPH_CONSTANTS.ANIMATION.FORCE_SETTLING_MS);
};