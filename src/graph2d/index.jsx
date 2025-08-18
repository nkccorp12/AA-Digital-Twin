import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';
import { SHAPE_2D, SHAPE_2D_ALT } from '../constants/shapeConstants.js';
import { getNodeColor } from '../utils/colorUtils.js';
import LinkTextOverlay from '../components/LinkTextOverlay.jsx';
import NodeTitleOverlay from '../components/NodeTitleOverlay.jsx';

const Graph2D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions,
  showLinkTexts = true,
  alternativeShapes = false
}) => {
  console.log('🎨 Graph2D render with alternativeShapes:', alternativeShapes);
  const fgRef = useRef();
  
  

  // Track alternativeShapes changes to avoid spam
  const prevAlternativeShapes = useRef(alternativeShapes);
  
  // Draw shape based on node type - using shape constants
  const drawNodeShape = useCallback((ctx, nodeType, radius) => {
    // Only log when alternativeShapes actually changes
    if (prevAlternativeShapes.current !== alternativeShapes) {
      console.log('🔄 Shape set changed:', prevAlternativeShapes.current, '→', alternativeShapes);
      prevAlternativeShapes.current = alternativeShapes;
    }
    
    const shapeSet = alternativeShapes ? SHAPE_2D_ALT : SHAPE_2D;
    const shapeFunction = shapeSet[nodeType] || shapeSet.default;
    shapeFunction(ctx, radius);
  }, [alternativeShapes]);

  // Clean 2D node rendering function
  const renderNode = useCallback((node, ctx, globalScale) => {
    if (!node.x || !node.y) return; // Skip if no position
    
    // Get node properties - different sizes for different shape sets
    const baseSize = node.size || GRAPH_CONSTANTS.NODE_SIZES.MIN;
    const radius = alternativeShapes 
      ? baseSize * 2.205  // Alternative shapes: 3x bigger than current 0.735x (0.735 * 3 = 2.205)
      : baseSize * 2.145; // Standard shapes: 30% bigger than current 1.65x (1.65 * 1.3 = 2.145)
    const color = getNodeColor(node.type, alternativeShapes);
    
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
  }, [drawNodeShape]); // Add drawNodeShape dependency


  // Configure 2D forces specifically
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      fgRef.current.d3Force('charge', forceManyBody().strength(-4720));
      fgRef.current.d3Force('link', forceLink().distance(200));  // Longer links for larger nodes and text space
      fgRef.current.d3Force('center', forceCenter(-1200, 0));
    }
  }, [nodes]);

  // Apply 40% zoom-out after component mounts and data loads
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      // Small delay to ensure graph is properly initialized
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoom(0.4); // 60% zoomed out
        }
      }, 100);
    }
  }, [nodes]);

  // Note: Using key prop on ForceGraph2D to force remount when alternativeShapes changes

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
        
        // Interaction settings
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
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

// Export without memo to ensure re-renders when alternativeShapes changes
export default Graph2D;