import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { configure2DForces } from '../utils/forceSimulation.js';
import { getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';
import { SHAPE_2D, SHAPE_2D_ALT } from '../constants/shapeConstants.js';
import { getNodeColor } from '../utils/colorUtils.js';
import LinkTextOverlay from './LinkTextOverlay.jsx';

console.log('✅ components/Graph2D.jsx mounted');

const FWD_COLOR = '#ff4d4d';
const REV_COLOR = '#2b6cff';

const Graph2D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions,
  showBidirectional = false,
  alternativeShapes = false,
  showLinkTexts = true
}) => {
  console.log('🔍 Graph2D: showLinkTexts =', showLinkTexts);
  const fgRef = useRef();

  // Draw shape based on node type - using shape constants
  const drawNodeShape = useCallback((ctx, nodeType, radius) => {
    const shapeSet = alternativeShapes ? SHAPE_2D_ALT : SHAPE_2D;
    const shapeFunction = shapeSet[nodeType] || shapeSet.default;
    shapeFunction(ctx, radius);
  }, [alternativeShapes]);

  // Clean 2D node rendering function
  const renderNode = useCallback((node, ctx, globalScale) => {
    if (!node.x || !node.y) return; // Skip if no position
    
    // Get node properties - make shapes bigger
    const radius = (node.size || GRAPH_CONSTANTS.NODE_SIZES.MIN) * 1.2;  // 1.2x bigger
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

    // Draw label above node
    const label = node.label || node.id;
    
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
  }, [drawNodeShape, alternativeShapes]);

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


  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
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
        linkLabel={link => `${link.influenceType || 'Connection'} (${link.weight?.toFixed(2) || '0'})`}
        
        // Link styling - only change when bidirectional
        linkColor={l => showBidirectional ? (l.isReverse ? REV_COLOR : FWD_COLOR) : '#9aa4b2'}
        linkWidth={l => showBidirectional ? 1.5 : 1}
        linkOpacity={0.9}
        
        // Bidirectional separation - only when enabled
        linkCurvature={l => showBidirectional ? 0.3 : 0}
        linkCurveRotation={l => showBidirectional ? (l.isReverse ? Math.PI : 0) : 0}
        
        // Dynamic arrows based on link showArrow property
        linkDirectionalArrowLength={l => l.showArrow ? (l.arrowLength || 6) : 0}
        linkDirectionalArrowColor={l => l.showArrow ? (l.arrowColor || (showBidirectional ? (l.isReverse ? REV_COLOR : FWD_COLOR) : '#ff4d4d')) : undefined}
        linkDirectionalArrowRelPos={l => l.arrowPosition === 'source' ? 0.1 : 0.9}
        linkDirectionalParticles={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_COUNT}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_SPEED}
        linkDirectionalParticleColor={() => GRAPH_CONSTANTS.COLORS.PARTICLE_COLOR}
        
        
        // Interaction
        onNodeClick={onNodeClick}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        
        // Performance
        pixelRatio={Math.min(2, window.devicePixelRatio || 1)}
      />
      
      {/* Link Text Overlay - HTML elements positioned over canvas */}
      {showLinkTexts && (
        <LinkTextOverlay
          nodes={nodes}
          links={links}
          fgRef={fgRef}
          dimensions={dimensions}
          visible={showLinkTexts}
          showBidirectional={showBidirectional}
        />
      )}
    </div>
  );
};

export default Graph2D;