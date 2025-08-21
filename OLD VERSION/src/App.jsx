import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Graph2D from './graph2d';
import Graph3D from './graph3d';
import { prepareNodes } from './utils/graphUtils.js';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [isRotating, setIsRotating] = useState(true);

  // Load the mock data from baseline.json
  useEffect(() => {
    console.log('📊 App: Loading mock data...');
    fetch('/mock-data/baseline.json')
      .then(response => {
        console.log('📊 App: Fetch response received', { ok: response.ok, status: response.status });
        return response.json();
      })
      .then(data => {
        console.log('📊 App: Data loaded successfully:', {
          nodeCount: data.nodes?.length || 0,
          linkCount: data.links?.length || 0,
          firstNode: data.nodes?.[0],
          firstLink: data.links?.[0]
        });
        
        // Validate data structure
        if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) {
          throw new Error('Invalid data structure: nodes and links must be arrays');
        }
        
        setNodes(data.nodes);
        setLinks(data.links);
      })
      .catch(error => {
        console.error('❌ App: Error loading data:', error);
        // Set empty arrays as fallback
        setNodes([]);
        setLinks([]);
      });
  }, []);

  // Initialize positions for nodes (only once before cloning)
  const initPositions = (nodeArray) => {
    nodeArray.forEach(node => {
      if (!node.x) node.x = Math.random() * 400 - 200;
      if (!node.y) node.y = Math.random() * 400 - 200;
      if (!node.z) node.z = Math.random() * 400 - 200;
    });
  };

  // Prepare nodes with computed properties and create separate data for each graph
  const [nodes2D, nodes3D, links2D, links3D] = useMemo(() => {
    if (nodes.length === 0) return [[], [], [], []];
    
    
    // Prepare nodes with computed properties
    const enhancedNodes = prepareNodes(nodes, links);
    
    // Clean nodes (remove D3 artifacts but keep positions)
    const cleanNodes = enhancedNodes.map(({ vx, vy, vz, index, ...rest }) => ({ ...rest }));
    
    // Initialize positions BEFORE cloning
    initPositions(cleanNodes);
    
    // Create completely separate node arrays via deep clone
    const separateNodes2D = JSON.parse(JSON.stringify(cleanNodes));
    const separateNodes3D = JSON.parse(JSON.stringify(cleanNodes));
    
    // Create separate link arrays with ID validation
    const separateLinks2D = links.map(link => ({
      ...link,
      source: typeof link.source === 'object' ? link.source.id : link.source,
      target: typeof link.target === 'object' ? link.target.id : link.target
    }));
    const separateLinks3D = JSON.parse(JSON.stringify(separateLinks2D));
    
    
    return [separateNodes2D, separateNodes3D, separateLinks2D, separateLinks3D];
  }, [nodes, links]);


  const dimensions = useMemo(() => ({
    width: window.innerWidth / 2,
    height: window.innerHeight
  }), []); // Empty dependency - only create once

  // Stable callback functions to prevent unnecessary re-renders
  const handle2DNodeClick = useCallback((node) => {
    console.log('2D clicked:', node);
  }, []);

  const handle3DNodeClick = useCallback((node) => {
    console.log('3D clicked:', node);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#000',
      overflow: 'hidden'  // Prevent any scrolling
    }}>
      {/* Logo overlay */}
      <img 
        src="/logo.png" 
        alt="Logo" 
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          height: '150px',
          width: 'auto',
          zIndex: 50,
          opacity: 0.9,
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
        }}
      />
      
      {/* Left: 2D Graph */}
      <div style={{ 
        width: '50%', 
        height: '100%',
        borderRight: '1px solid #333',
        overflow: 'hidden'  // Prevent scrolling in 2D section
      }}>
        <Graph2D
          nodes={nodes2D}
          links={links2D}
          dimensions={dimensions}
          onNodeClick={handle2DNodeClick}
        />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'white',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '8px',
          borderRadius: '4px'
        }}>
          📊 2D View
        </div>
      </div>
      
      {/* Right: 3D Graph */}
      <div style={{ 
        width: '50%', 
        height: '100%',
        overflow: 'hidden'  // Prevent scrolling in 3D section
      }}>
        <Graph3D 
          nodes={nodes3D}
          links={links3D}
          dimensions={dimensions}
          onNodeClick={handle3DNodeClick}
          isRotating={isRotating}
          setIsRotating={setIsRotating}
        />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'white',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌐 3D View
          <button
            onClick={() => setIsRotating(!isRotating)}
            style={{
              backgroundColor: isRotating ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            {isRotating ? 'Stop Rotation' : 'Start Rotation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;