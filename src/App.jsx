import React, { useState, useEffect } from 'react';
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

  // Prepare nodes with computed properties for 2D graph
  const enhancedNodes = prepareNodes(nodes, links);
  
  // Clean nodes for consistent data (remove D3 artifacts but keep positions)
  const cleanNodes = enhancedNodes.map(({ vx, vy, vz, index, ...rest }) => ({ ...rest }));
  
  console.log('🔄 App: Node processing:', {
    originalCount: nodes.length,
    enhancedCount: enhancedNodes.length,
    cleanedCount: cleanNodes.length,
    sampleEnhanced: enhancedNodes[0],
    sampleCleaned: cleanNodes[0]
  });

  const dimensions = {
    width: window.innerWidth / 2,
    height: window.innerHeight
  };

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
          nodes={cleanNodes}
          links={links}
          dimensions={dimensions}
          onNodeClick={(node) => console.log('2D clicked:', node)}
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
          nodes={cleanNodes}
          links={links}
          dimensions={dimensions}
          onNodeClick={(node) => console.log('3D clicked:', node)}
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