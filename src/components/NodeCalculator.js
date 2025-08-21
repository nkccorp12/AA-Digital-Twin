/**
 * NodeCalculator - Calculates node values based on link weights
 * Extends existing nodes with mainValue, incomingValue, and outgoingValue properties
 */

/**
 * Calculate node values based on incoming and outgoing link weights
 * @param {Array} nodes - Array of node objects
 * @param {Array} links - Array of link objects with weights
 * @returns {Array} Enhanced nodes with calculated values
 */
export const calculateNodeValues = (nodes, links) => {
  if (!nodes || !links) return nodes || [];
  
  return nodes.map(node => {
    // Calculate incoming value (sum of weights from links targeting this node)
    const incomingLinks = links.filter(link => {
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return targetId === node.id;
    });
    const incomingValue = incomingLinks.reduce((sum, link) => sum + (link.weight || 0), 0);
    
    // Calculate outgoing value (sum of weights from links sourcing from this node)
    const outgoingLinks = links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      return sourceId === node.id;
    });
    const outgoingValue = outgoingLinks.reduce((sum, link) => sum + (link.weight || 0), 0);
    
    // Calculate mainValue as sum of incoming + outgoing, with fallback to original stressLevel
    const calculatedMainValue = incomingValue + outgoingValue;
    const mainValue = calculatedMainValue > 0 ? calculatedMainValue : (node.stressLevel || 0);
    
    // Preserve original stressLevel for reference
    const originalStressLevel = node.stressLevel || 0;
    
    return {
      ...node,
      mainValue: Math.round(mainValue * 100) / 100, // Round to 2 decimal places
      incomingValue: Math.round(incomingValue * 100) / 100, // Round to 2 decimal places
      outgoingValue: Math.round(outgoingValue * 100) / 100, // Round to 2 decimal places
      originalStressLevel: Math.round(originalStressLevel * 100) / 100 // Keep original for reference
    };
  });
};

/**
 * Get summary statistics for all nodes
 * @param {Array} enhancedNodes - Nodes with calculated values
 * @returns {Object} Statistics object
 */
export const getNodeValueStatistics = (enhancedNodes) => {
  if (!enhancedNodes || enhancedNodes.length === 0) {
    return {
      totalNodes: 0,
      avgIncoming: 0,
      avgOutgoing: 0,
      avgMain: 0,
      maxIncoming: 0,
      maxOutgoing: 0,
      maxMain: 0
    };
  }
  
  const stats = enhancedNodes.reduce((acc, node) => ({
    totalIncoming: acc.totalIncoming + (node.incomingValue || 0),
    totalOutgoing: acc.totalOutgoing + (node.outgoingValue || 0),
    totalMain: acc.totalMain + (node.mainValue || 0),
    maxIncoming: Math.max(acc.maxIncoming, node.incomingValue || 0),
    maxOutgoing: Math.max(acc.maxOutgoing, node.outgoingValue || 0),
    maxMain: Math.max(acc.maxMain, node.mainValue || 0)
  }), {
    totalIncoming: 0,
    totalOutgoing: 0,
    totalMain: 0,
    maxIncoming: 0,
    maxOutgoing: 0,
    maxMain: 0
  });
  
  const nodeCount = enhancedNodes.length;
  
  return {
    totalNodes: nodeCount,
    avgIncoming: Math.round((stats.totalIncoming / nodeCount) * 100) / 100,
    avgOutgoing: Math.round((stats.totalOutgoing / nodeCount) * 100) / 100,
    avgMain: Math.round((stats.totalMain / nodeCount) * 100) / 100,
    maxIncoming: stats.maxIncoming,
    maxOutgoing: stats.maxOutgoing,
    maxMain: stats.maxMain
  };
};