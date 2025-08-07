import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import Graph2D from './graph2d';
import Graph3D from './graph3d';
import { prepareNodes } from './utils/graphUtils.js';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [isRotating, setIsRotating] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(null); // null | '2d' | '3d'
  const rafIdRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

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


  // Force immediate dimension updates using useLayoutEffect for canvas sync
  const [canvasDimensions, setCanvasDimensions] = useState({
    width2D: (window.innerWidth * leftPanelWidth) / 100,
    width3D: (window.innerWidth * (100 - leftPanelWidth)) / 100,
    height: window.innerHeight,
    isDragging: isDragging
  });
  
  // Synchronous dimension updates BEFORE browser paint to prevent canvas lag
  useLayoutEffect(() => {
    const new2DWidth = (window.innerWidth * leftPanelWidth) / 100;
    const new3DWidth = (window.innerWidth * (100 - leftPanelWidth)) / 100;
    
    
    setCanvasDimensions({
      width2D: new2DWidth,
      width3D: new3DWidth,
      height: window.innerHeight,
      isDragging: isDragging
    });
  }, [leftPanelWidth, isDragging]);

  // Stable callback functions to prevent unnecessary re-renders
  const handle2DNodeClick = useCallback((node) => {
    console.log('2D clicked:', node);
  }, []);

  const handle3DNodeClick = useCallback((node) => {
    console.log('3D clicked:', node);
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = useCallback((mode) => {
    if (fullscreenMode === mode) {
      // Exit fullscreen - return to 50/50 split
      setFullscreenMode(null);
      setLeftPanelWidth(50);
    } else {
      // Enter fullscreen
      setFullscreenMode(mode);
      setLeftPanelWidth(mode === '2d' ? 100 : 0);
    }
  }, [fullscreenMode]);

  // Resizer drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Throttle updates using requestAnimationFrame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      const rafTime = Date.now();
      const timeSinceLastUpdate = rafTime - lastUpdateTimeRef.current;
      
      // Limit updates to ~30fps (33ms intervals)
      if (timeSinceLastUpdate < 33) {
        return;
      }
      
      const containerWidth = window.innerWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
      
      setLeftPanelWidth(constrainedWidth);
      
      lastUpdateTimeRef.current = rafTime;
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Add global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
        width: `${leftPanelWidth}%`, 
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        willChange: isDragging ? 'width' : 'auto', // Hardware acceleration during drag
        transition: isDragging ? 'none' : 'width 0.15s ease-out', // Smooth transition when not dragging
        minWidth: '200px' // Prevent canvas from becoming too small
      }}>
        <Graph2D
          nodes={nodes2D}
          links={links2D}
          dimensions={canvasDimensions}
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
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 2D View ({Math.round(leftPanelWidth)}%)
          <button
            onClick={() => toggleFullscreen('2d')}
            style={{
              backgroundColor: fullscreenMode === '2d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
            title={fullscreenMode === '2d' ? 'Exit Fullscreen' : 'Fullscreen 2D'}
          >
            {fullscreenMode === '2d' ? '⇱' : '⛶'}
          </button>
        </div>
      </div>
      
      {/* Resizer Handle - Hidden in fullscreen mode */}
      {fullscreenMode === null && (
        <div
          style={{
            width: '6px',
            height: '100%',
            backgroundColor: isDragging ? '#555' : '#333',
            cursor: 'col-resize',
            position: 'relative',
            transition: isDragging ? 'none' : 'background-color 0.2s ease',
            zIndex: 10,
            willChange: 'background-color', // Hardware acceleration for color changes
            touchAction: 'none' // Prevent touch scrolling on mobile
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Visual grip dots */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '24px',
            background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)',
            pointerEvents: 'none'
          }} />
        </div>
      )}
      
      {/* Right: 3D Graph */}
      <div style={{ 
        width: `${100 - leftPanelWidth}%`, 
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        willChange: isDragging ? 'width' : 'auto', // Hardware acceleration during drag  
        transition: isDragging ? 'none' : 'width 0.15s ease-out', // Smooth transition when not dragging
        minWidth: '200px' // Prevent canvas from becoming too small
      }}>
        <Graph3D 
          nodes={nodes3D}
          links={links3D}
          dimensions={canvasDimensions}
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
          🌐 3D View ({Math.round(100 - leftPanelWidth)}%)
          <button
            onClick={() => toggleFullscreen('3d')}
            style={{
              backgroundColor: fullscreenMode === '3d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
            title={fullscreenMode === '3d' ? 'Exit Fullscreen' : 'Fullscreen 3D'}
          >
            {fullscreenMode === '3d' ? '⇱' : '⛶'}
          </button>
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