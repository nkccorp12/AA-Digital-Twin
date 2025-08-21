import React, { useState, useRef, useEffect } from 'react';
import Graph2D from './Graph2D.jsx';
import Graph3D from './Graph3D.jsx';
import { prepareNodes } from '../utils/graphUtils.js';

const GraphContainer = ({ 
  nodes, 
  links, 
  onNodeClick
}) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  // Prepare base nodes with computed properties
  const enhancedNodes = prepareNodes(nodes, links);
  
  // Create clean node copies - keep positions but remove D3 simulation artifacts
  const clean2DNodes = enhancedNodes.map(({ vx, vy, vz, index, ...rest }) => ({ ...rest }));
  const clean3DNodes = enhancedNodes.map(({ vx, vy, vz, index, ...rest }) => ({ ...rest }));

  // Handle container resize - split screen needs half width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width / 2, // Split width for side-by-side
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graph2DProps = {
    nodes: clean2DNodes,
    links,
    onNodeClick,
    dimensions
  };

  const graph3DProps = {
    nodes: clean3DNodes,
    links,
    onNodeClick,
    dimensions
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Split Screen Container */}
      <div className="w-full h-full flex">
        {/* Left: 2D Graph */}
        <div className="w-1/2 h-full border-r border-white/10">
          <Graph2D key="graph-2d" {...graph2DProps} />
          <div className="absolute bottom-4 left-4 bg-black/90 border border-gray-600 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            📊 2D View
          </div>
        </div>
        
        {/* Right: 3D Graph */}
        <div className="w-1/2 h-full">
          <Graph3D key="graph-3d" {...graph3DProps} />
          <div className="absolute bottom-4 right-4 bg-black/90 border border-gray-600 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            🌐 3D View
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;