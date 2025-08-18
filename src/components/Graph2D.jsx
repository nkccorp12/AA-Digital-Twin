import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { configure2DForces } from '../utils/forceSimulation.js';
import { getNodeDisplayValue, pairHashAngle, toBidirectional } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

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
      configure2DForces(fgRef.current);
    }
  }, []);

  // Constants for custom link rendering
  const EDGE_OFFSET = 14;        // px distance between two tracks
  const ARROW_SIZE = 8;
  const FWD_COLOR = '#ff4d4d';
  const REV_COLOR = '#2b6cff';

  // Quadratic Bezier helper functions
  const pointOnQuad = useCallback((x0, y0, cx, cy, x1, y1, t) => {
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * cx + t * t * x1,
      y: u * u * y0 + 2 * u * t * cy + t * t * y1
    };
  }, []);

  const tangentOnQuad = useCallback((x0, y0, cx, cy, x1, y1, t) => {
    return {
      x: 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx),
      y: 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
    };
  }, []);

  const drawArrow = useCallback((ctx, x, y, angle, size) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size * 0.6);
    ctx.lineTo(-size, -size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const drawDualCurve = useCallback((link, ctx, globalScale) => {
    const s = link.source, t = link.target;
    if (!s || !t || s.x == null || t.x == null) return;

    const dx = t.x - s.x, dy = t.y - s.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;            // Normal vector
    const midx = (s.x + t.x) / 2, midy = (s.y + t.y) / 2;

    const sign = link.isReverse ? -1 : 1;
    const off = EDGE_OFFSET * sign;

    const cx = midx + nx * off;                     // Control point shifted
    const cy = midy + ny * off;

    // Draw curve
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.quadraticCurveTo(cx, cy, t.x, t.y);
    ctx.lineWidth = Math.max(1, 1.5 / globalScale);
    ctx.strokeStyle = sign === 1 ? FWD_COLOR : REV_COLOR;
    ctx.stroke();

    // Draw arrow at 60% of curve
    const p = pointOnQuad(s.x, s.y, cx, cy, t.x, t.y, 0.6);
    const tg = tangentOnQuad(s.x, s.y, cx, cy, t.x, t.y, 0.6);
    ctx.fillStyle = sign === 1 ? FWD_COLOR : REV_COLOR;
    drawArrow(ctx, p.x, p.y, Math.atan2(tg.y, tg.x), ARROW_SIZE / globalScale);
  }, [pointOnQuad, tangentOnQuad, drawArrow]);

  // Prepare graph data with bidirectional links if enabled
  const graphData = {
    nodes,
    links: showBidirectional ? toBidirectional(links) : links
  };

  // Base props for 2D graph
  const graphProps = {
    graphData,
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
        
        // Custom link rendering - replace standard rendering
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={(link, ctx, globalScale) => {
          if (showBidirectional) {
            drawDualCurve(link, ctx, globalScale);
          } else {
            // Simple standard line for unidirectional
            link.isReverse = false;
            drawDualCurve(link, ctx, globalScale);
          }
        }}
        
        // Disable standard link rendering
        linkColor={() => 'rgba(0,0,0,0)'}  // Transparent - we draw our own
        linkWidth={0}
        linkCurvature={0}
        linkDirectionalArrowLength={0}  // We draw our own arrows
        linkDirectionalParticles={0}    // Disable particles for clean look
        
        // Interaction
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};

export default Graph2D;