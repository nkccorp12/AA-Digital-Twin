import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';
import LinkTextOverlay from '../components/LinkTextOverlay.jsx';
import NodeTitleOverlay from '../components/NodeTitleOverlay.jsx';

const Graph2D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions,
  showLinkTexts = true
}) => {
  const fgRef = useRef();
  
  

  // Draw shape based on node type - custom implementation
  const drawNodeShape = useCallback((ctx, nodeType, radius) => {
    switch(nodeType) {
      case 'environment':
        // Circle
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        break;
      case 'boundary':
        // Triangle (pointing up)
        ctx.moveTo(0, -radius);
        ctx.lineTo(-radius * 0.866, radius * 0.5);
        ctx.lineTo(radius * 0.866, radius * 0.5);
        ctx.closePath();
        break;
      case 'system':
        // Diamond
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, radius);
        ctx.lineTo(-radius, 0);
        ctx.closePath();
        break;
      default:
        // Default circle
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    }
  }, []);

  // Clean 2D node rendering function
  const renderNode = useCallback((node, ctx, globalScale) => {
    if (!node.x || !node.y) return; // Skip if no position
    
    // Get node properties - make shapes bigger
    const radius = (node.size || GRAPH_CONSTANTS.NODE_SIZES.MIN) * 1.8;  // 1.8x bigger
    const color = node.color || GRAPH_CONSTANTS.COLORS.NODE_FALLBACK;
    
    // Draw node shape based on type
    ctx.save();
    ctx.translate(node.x, node.y);
    
    ctx.beginPath();
    drawNodeShape(ctx, node.type, radius);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Add border for better visibility
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();

    // Node text rendering removed - now handled by NodeTitleOverlay for better layering
  }, []);


  // Configure 2D forces specifically
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      fgRef.current.d3Force('charge', forceManyBody().strength(-4720));
      fgRef.current.d3Force('link', forceLink().distance(160));  // Longer links for text space
      fgRef.current.d3Force('center', forceCenter(0, 0));
    }
  }, [nodes]);


  // Base props for 2D graph (no conflicting auto-rendering props)
  const graphProps = {
    graphData: { nodes, links },
    nodeLabel: node => `${node.label || node.id}`,
    linkLabel: link => `${link.influenceType || 'Connection'} (${link.weight?.toFixed(2) || '0'})`,
    onNodeClick: onNodeClick
  };

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        {...graphProps}
        width={dimensions.width2D}
        height={dimensions.height}
        backgroundColor={GRAPH_CONSTANTS.COLORS.BACKGROUND}
        warmupTicks={50}
        
        // Node rendering (custom only)
        nodeCanvasObject={renderNode}
        
        
        // Link styling - better visibility for particle background
        linkColor={() => GRAPH_CONSTANTS.COLORS.LINK_DEFAULT}
        linkWidth={link => Math.max(1, (link.weight || 0.5) * GRAPH_CONSTANTS.GRAPH_2D.LINK_WIDTH_MULTIPLIER)}
        linkOpacity={0.6}
        
        // Animation particles
        linkDirectionalParticles={GRAPH_CONSTANTS.GRAPH_2D.PARTICLE_COUNT}
        linkDirectionalParticleWidth={GRAPH_CONSTANTS.GRAPH_2D.PARTICLE_WIDTH}
        linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_2D.PARTICLE_SPEED}
        linkDirectionalParticleColor={() => GRAPH_CONSTANTS.COLORS.PARTICLE_COLOR}
        
        // Interaction and zoom settings
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        zoom={0.9} // Default zoom to 60% (40% zoomed out)
      />
      
      {/* HTML overlays for proper text layering */}
      <LinkTextOverlay
        nodes={nodes}
        links={links}
        fgRef={fgRef}
        dimensions={dimensions}
        visible={showLinkTexts}
      />
      <NodeTitleOverlay
        nodes={nodes}
        fgRef={fgRef}
        dimensions={dimensions}
      />
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(Graph2D);