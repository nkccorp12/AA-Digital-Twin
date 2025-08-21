import { NODE_TYPE_COLORS, GRAPH_CONSTANTS } from '../constants/graphConstants.js';

/**
 * Get color for a node based on its type
 * @param {string} nodeType - The type of the node
 * @returns {string} Hex color code
 */
export const getNodeColor = (nodeType) => {
  return NODE_TYPE_COLORS[nodeType] || GRAPH_CONSTANTS.COLORS.NODE_FALLBACK;
};

/**
 * Calculate node size based on confidence metadata
 * @param {Object} node - Node object
 * @returns {number} Node size
 */
export const getNodeSize = (node) => {
  const confidence = node.metadata?.confidence || 0.5;
  return Math.max(
    GRAPH_CONSTANTS.NODE_SIZES.MIN,
    confidence * GRAPH_CONSTANTS.NODE_SIZES.CONFIDENCE_MULTIPLIER
  );
};

/**
 * Calculate centrality metric for a node
 * @param {string} nodeId - ID of the node
 * @param {Array} links - Array of link objects
 * @returns {number} Centrality score
 */
export const calculateCentrality = (nodeId, links) => {
  const connections = links.filter(link => 
    link.source === nodeId || link.target === nodeId ||
    (typeof link.source === 'object' && link.source.id === nodeId) ||
    (typeof link.target === 'object' && link.target.id === nodeId)
  );
  
  const degree = connections.length;
  const weightSum = connections.reduce((sum, link) => sum + link.weight, 0);
  
  return (degree * 0.5) + (weightSum * 0.5);
};

/**
 * Get display value for a node (stress level, confidence, or source count)
 * @param {Object} node - Node object
 * @returns {string} Display value
 */
export const getNodeDisplayValue = (node) => {
  // Priority: Stress Level > Confidence > Source Count
  if (node.stressLevel !== undefined) {
    return `${node.stressLevel.toFixed(1)}`;
  } else if (node.metadata?.confidence) {
    return `${(node.metadata.confidence * 100).toFixed(0)}%`;
  } else if (node.metadata?.sourceCount) {
    return `${node.metadata.sourceCount}`;
  }
  return '';
};

/**
 * Prepare nodes with computed properties (color, centrality, size)
 * @param {Array} nodes - Raw nodes array
 * @param {Array} links - Links array for centrality calculation
 * @returns {Array} Enhanced nodes with computed properties
 */
export const prepareNodes = (nodes, links) => {
  return nodes.map(node => ({
    ...node,
    color: getNodeColor(node.type),
    centrality: calculateCentrality(node.id, links),
    size: getNodeSize(node),
    group: node.type // Add group property for 3D nodeAutoColorBy compatibility
  }));
};

/**
 * Common graph props that are shared between 2D and 3D
 * @param {Object} options - Configuration options
 * @returns {Object} Common props object
 */
export const getCommonGraphProps = ({ nodes, links, onNodeClick, showMetrics, is3D = false }) => {
  const baseProps = {
    graphData: { nodes, links },
    nodeLabel: node => `${node.id}: ${node.label}`,
    linkLabel: link => `${link.influenceType} (${link.weight.toFixed(2)})`,
    linkOpacity: 0.6,
    onNodeClick: onNodeClick
  };

  // Only add these props for 3D graphs when NOT using custom nodeThreeObject
  // (they conflict with custom objects)
  if (is3D) {
    // Don't add auto-props when using custom node objects
    // baseProps.nodeAutoColorBy = showMetrics ? 'centrality' : 'type';
    // baseProps.nodeVal = node => getNodeSize(node);
  }

  return baseProps;
};