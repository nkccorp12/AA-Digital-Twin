import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { configure2DForces } from '../utils/forceSimulation.js';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

const Graph2D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions 
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

    // Draw label above node - make a bit longer/more descriptive
    const baseLabel = node.label || node.id;
    const typePrefix = node.type ? `[${node.type.charAt(0).toUpperCase()}] ` : '';
    const label = `${typePrefix}${baseLabel}`;
    
    const fontSize = Math.max(10, GRAPH_CONSTANTS.GRAPH_2D.FONT_SIZE / globalScale);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = GRAPH_CONSTANTS.COLORS.TEXT_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, node.x, node.y - radius - 2);
    
    // Draw value below node
    const displayValue = getNodeDisplayValue(node);
    if (displayValue) {
      const valueSize = Math.max(8, GRAPH_CONSTANTS.GRAPH_2D.VALUE_FONT_SIZE / globalScale);
      ctx.font = `bold ${valueSize}px Inter, sans-serif`;
      ctx.fillStyle = GRAPH_CONSTANTS.COLORS.TEXT_VALUE;
      ctx.textBaseline = 'top';
      ctx.fillText(displayValue, node.x, node.y + radius + 2);
    }
  }, []);

  // Configure forces when component mounts
  useEffect(() => {
    if (fgRef.current) {
      configure2DForces(fgRef.current);
    }
  }, []);

  // Base props for 2D graph (no conflicting auto-rendering props)
  const graphProps = {
    graphData: { nodes, links },
    nodeLabel: node => `${node.label || node.id}`,
    linkLabel: link => `${link.influenceType || 'Connection'} (${link.weight?.toFixed(2) || '0'})`,
    onNodeClick: onNodeClick
  };

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        {...graphProps}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={GRAPH_CONSTANTS.COLORS.BACKGROUND}
        warmupTicks={50}
        
        // Node rendering (custom only)
        nodeCanvasObject={renderNode}
        
        // Link styling
        linkColor={() => GRAPH_CONSTANTS.COLORS.LINK_DEFAULT}
        linkWidth={link => Math.max(1, (link.weight || 0.5) * GRAPH_CONSTANTS.GRAPH_2D.LINK_WIDTH_MULTIPLIER)}
        linkOpacity={0.8}
        
        // Animation particles - SUPER VISIBLE
        linkDirectionalParticles={4}  // Even more particles
        linkDirectionalParticleWidth={10}  // Much bigger particles
        linkDirectionalParticleSpeed={0.002}  // Much slower for visibility
        linkDirectionalParticleColor={() => "#FF0000"}  // Function like 3D works
        
        // Interaction
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};

export default Graph2D;