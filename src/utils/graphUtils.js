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
 * Get display value for a node with support for multiple display modes
 * @param {Object} node - Node object
 * @param {Object} options - Display options
 * @param {boolean} options.showMainValues - Show main values (default: true)
 * @param {boolean} options.showInOutValues - Show incoming/outgoing values (default: false)
 * @returns {string|Array} Display value(s) - string for single line, array for multi-line
 */
export const getNodeDisplayValue = (node, options = {}) => {
  const { showMainValues = true, showInOutValues = false } = options;
  
  // If no display modes are enabled, return empty
  if (!showMainValues && !showInOutValues) {
    return '';
  }
  
  const lines = [];
  
  // Main value line (stress level, confidence, or source count)
  if (showMainValues) {
    let mainValue = '';
    if (node.mainValue !== undefined) {
      // Use calculated mainValue if available
      mainValue = `${node.mainValue.toFixed(1)}`;
    } else if (node.stressLevel !== undefined) {
      // Fallback to original stressLevel
      mainValue = `${node.stressLevel.toFixed(1)}`;
    } else if (node.metadata?.confidence) {
      mainValue = `${(node.metadata.confidence * 100).toFixed(0)}%`;
    } else if (node.metadata?.sourceCount) {
      mainValue = `${node.metadata.sourceCount}`;
    }
    
    if (mainValue) {
      lines.push(mainValue);
    }
  }
  
  // In/Out values line
  if (showInOutValues && node.incomingValue !== undefined && node.outgoingValue !== undefined) {
    const inValue = node.incomingValue.toFixed(1);
    const outValue = node.outgoingValue.toFixed(1);
    lines.push(`↓${inValue} ↑${outValue}`);
  }
  
  // Return single string for single line, array for multi-line
  if (lines.length === 0) {
    return '';
  } else if (lines.length === 1) {
    return lines[0];
  } else {
    return lines; // Return array for multi-line rendering
  }
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
 * Generate bidirectional links with proper parallelSign for separation
 * @param {Array} links - Array of unidirectional link objects
 * @returns {Array} Array with both original and reverse links with parallelSign
 */
export const toBidirectional = (links) => {
  console.log('🔄 toBidirectional called with:', links.length, 'links');
  
  const out = [];
  
  // Create forward and reverse links
  for (const l of links) {
    const f = { ...l, id: `${l.source}-${l.target}-fwd`, isReverse: false };
    const r = { ...l, id: `${l.target}-${l.source}-rev`, source: l.target, target: l.source, isReverse: true };
    out.push(f, r);
  }
  
  // Group by undirected pairs
  const groups = new Map(); // key: undirected pair
  for (const l of out) {
    const a = typeof l.source === 'object' ? l.source.id : l.source;
    const b = typeof l.target === 'object' ? l.target.id : l.target;
    const key = a < b ? `${a}||${b}` : `${b}||${a}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(l);
  }
  
  // Assign parallel signs symmetrically: [-2,-1,1,2], ...
  for (const g of groups.values()) {
    g.sort((x, y) => (x.isReverse === y.isReverse) ? 0 : (x.isReverse ? 1 : -1));
    const seq = [];
    let k = 1;
    for (let i = 0; i < g.length; i++) {
      seq.push(i % 2 === 0 ? k : -k);
      if (i % 2 === 1) k++;
    }
    g.forEach((l, i) => l.parallelSign = seq[i]);
  }
  
  console.log('🔄 Final bidirectional links with parallelSign:', out.length, 'total links');
  return out;
};

/**
 * Deterministic rotation angle for each node pair
 * @param {Object} link - Link object
 * @returns {number} Rotation angle in radians
 */
export const pairHashAngle = (link) => {
  const a = typeof link.source === 'object' ? link.source.id : link.source;
  const b = typeof link.target === 'object' ? link.target.id : link.target;
  const key = a < b ? `${a}||${b}` : `${b}||${a}`;
  
  // Simple hash -> [0 .. 2π)
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const t = Math.abs(h) % 360;
  return (t / 360) * Math.PI * 2;
};

// Keep old function for backward compatibility but mark as deprecated
export const generateBidirectionalLinks = toBidirectional;

/**
 * Configure arrow heads for specific links
 * @param {Array} links - Array of link objects
 * @param {Object} arrowConfig - Configuration object mapping link IDs to arrow settings
 * @returns {Array} Links with arrow configuration applied
 * 
 * Example usage:
 * const arrowConfig = {
 *   "S2-B1": { showArrow: true, arrowPosition: "source" },
 *   "S2-B2": { showArrow: true, arrowPosition: "target" }
 * };
 * const configuredLinks = configureArrows(links, arrowConfig);
 */
export const configureArrows = (links, arrowConfig = {}) => {
  return links.map(link => {
    const linkId = `${link.source}-${link.target}`;
    const reverseId = `${link.target}-${link.source}`;
    
    // Check both directions for configuration
    const config = arrowConfig[linkId] || arrowConfig[reverseId];
    
    if (config) {
      return {
        ...link,
        showArrow: config.showArrow || false,
        arrowPosition: config.arrowPosition || 'target',
        arrowColor: config.arrowColor || '#ff4d4d',
        arrowLength: config.arrowLength || 6
      };
    }
    
    return link;
  });
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