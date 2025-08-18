import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { configure2DForces } from '../utils/forceSimulation.js';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

console.log('✅ components/Graph2D.jsx mounted');

const FWD_COLOR = '#ff4d4d';
const REV_COLOR = '#2b6cff';

const Graph2D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions,
  showBidirectional = false
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
      // Even stronger repulsion for optimal spacing
      fgRef.current.d3Force('charge').strength(-600);
      
      // Larger distance between connected nodes
      fgRef.current.d3Force('link').distance(80);
      
      // Center force to keep nodes together
      const centerForce = fgRef.current.d3Force('center');
      if (centerForce) {
        centerForce.x(0).y(0);
      }
      
      console.log('🔧 D3 Forces configured: charge=-600, link=80');
    }
  }, []);

  // Debug bidirectional link drawing function with extreme visual differences
  const drawBidirectionalLink = useCallback((link, ctx, globalScale) => {
    const source = link.source;
    const target = link.target;
    
    // Skip if nodes don't have positions
    if (!source || !target || source.x == null || target.x == null) {
      console.log('❌ Skipping link - no positions:', link.id);
      return;
    }
    
    // DEBUG: Log every single link being drawn
    console.log('🎨 Drawing link:', {
      id: link.id,
      isReverse: link.isReverse,
      source: { x: source.x, y: source.y },
      target: { x: target.x, y: target.y }
    });
    
    // Calculate line vector
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) {
      console.log('❌ Zero distance link:', link.id);
      return;
    }
    
    // Normalize direction vector
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // EXTREME OFFSET for debugging - 50px instead of 12px
    const offsetDistance = 50 / globalScale;
    const normalX = -unitY; // Perpendicular to line
    const normalY = unitX;
    
    // Determine offset direction based on isReverse
    const offset = link.isReverse ? -offsetDistance : offsetDistance;
    
    // Calculate start and end points with offset
    const startX = source.x + normalX * offset;
    const startY = source.y + normalY * offset;
    const endX = target.x + normalX * offset;
    const endY = target.y + normalY * offset;
    
    console.log('📏 Link offset calculation:', {
      id: link.id,
      isReverse: link.isReverse,
      offsetDistance,
      offset,
      normal: { x: normalX, y: normalY },
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    });
    
    // Draw the line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    
    // EXTREME VISUAL DIFFERENCES for debugging
    if (link.isReverse) {
      ctx.strokeStyle = '#00FF00'; // Bright green for reverse
      ctx.lineWidth = Math.max(1, 8 / globalScale); // Very thick
      ctx.setLineDash([10, 5]); // Dashed line
    } else {
      ctx.strokeStyle = '#FF00FF'; // Bright pink for forward  
      ctx.lineWidth = Math.max(1, 4 / globalScale); // Medium thick
      ctx.setLineDash([]); // Solid line
    }
    
    ctx.stroke();
    ctx.restore();
  }, []);

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={GRAPH_CONSTANTS.COLORS.BACKGROUND}
        warmupTicks={100}
        
        // Standard node rendering
        nodeCanvasObject={renderNode}
        nodeLabel={node => `${node.label || node.id}`}
        
        // Link styling - only change when bidirectional
        linkColor={l => showBidirectional ? (l.isReverse ? REV_COLOR : FWD_COLOR) : '#9aa4b2'}
        linkWidth={l => showBidirectional ? 1.5 : 1}
        linkOpacity={0.9}
        
        // Bidirectional separation - only when enabled
        linkCurvature={l => showBidirectional ? 0.3 : 0}
        linkCurveRotation={l => showBidirectional ? (l.isReverse ? Math.PI : 0) : 0}
        
        // Standard arrows - keep simple
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.5}
        linkDirectionalParticles={0}
        
        // Link labels
        linkLabel={link => `${link.influenceType || 'Connection'} (${link.weight?.toFixed(2) || '0'})`}
        
        // Interaction
        onNodeClick={onNodeClick}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        
        // Performance
        pixelRatio={Math.min(2, window.devicePixelRatio || 1)}
      />
    </div>
  );
};

export default Graph2D;