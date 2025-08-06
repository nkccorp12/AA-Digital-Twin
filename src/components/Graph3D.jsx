import React, { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { configure3DForces, setInitial3DCameraPosition, setInitial3DPositions } from '../utils/forceSimulation.js';
import { getCommonGraphProps, getNodeDisplayValue } from '../utils/graphUtils.js';
import { GRAPH_CONSTANTS } from '../constants/graphConstants.js';

const Graph3D = ({ 
  nodes, 
  links, 
  onNodeClick, 
  dimensions 
}) => {
  const fgRef = useRef();
  const [debugInfo, setDebugInfo] = useState({ webgl: null, mounted: false });

  console.log('🌐 Graph3D render called:', {
    nodeCount: nodes?.length || 0,
    linkCount: links?.length || 0,
    dimensions,
    hasNodes: Array.isArray(nodes) && nodes.length > 0
  });

  // Create simple node sprites with error handling
  const createNodeSprite = (node) => {
    try {
      console.log('🎯 Creating sprite for node:', { id: node.id, type: node.type, color: node.color });
      
      const displayValue = getNodeDisplayValue(node);
      if (!displayValue) {
        console.warn('⚠️ Empty display value for node:', node.id);
      }
      
      const sprite = new SpriteText(displayValue);
      sprite.material.depthWrite = false;
      sprite.color = node.color || '#ffffff';
      sprite.textHeight = 8;
      sprite.center.y = -0.6;
      
      console.log('✅ Sprite created successfully for:', node.id);
      return sprite;
    } catch (error) {
      console.error('❌ Failed to create sprite for node:', node.id, error);
      return null;
    }
  };

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const webglSupported = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    
    console.log('🔍 WebGL Support Check:', {
      supported: webglSupported,
      userAgent: navigator.userAgent
    });
    
    setDebugInfo(prev => ({ ...prev, webgl: webglSupported }));
    
    if (!webglSupported) {
      console.error('❌ WebGL not supported in this browser');
    }
  }, []);

  // Component mount/unmount logging
  useEffect(() => {
    console.log('🔄 Graph3D component mounted');
    setDebugInfo(prev => ({ ...prev, mounted: true }));
    
    return () => {
      console.log('🔄 Graph3D component unmounted');
    };
  }, []);

  // Configure 3D forces and lighting when component mounts
  useEffect(() => {
    console.log('⚙️ 3D Setup useEffect triggered:', {
      hasRef: !!fgRef.current,
      nodeCount: nodes.length,
      firstNode: nodes[0]
    });
    
    if (fgRef.current && nodes.length > 0) {
      try {
        console.log('🎮 Starting 3D scene setup...');
        
        // Set initial 3D positions for proper Z-layering
        console.log('📍 Setting initial 3D positions...');
        setInitial3DPositions(nodes);
        
        // Configure forces
        console.log('💨 Configuring 3D forces...');
        configure3DForces(fgRef.current);
        
        // Setup lighting
        console.log('💡 Setting up lighting...');
        const scene = fgRef.current.scene();
        
        if (!scene) {
          throw new Error('Three.js scene not available');
        }
        
        scene.add(new THREE.AmbientLight(
          GRAPH_CONSTANTS.GRAPH_3D.AMBIENT_LIGHT,
          GRAPH_CONSTANTS.GRAPH_3D.AMBIENT_INTENSITY
        ));
        scene.add(new THREE.DirectionalLight(
          GRAPH_CONSTANTS.GRAPH_3D.DIRECTIONAL_LIGHT,
          GRAPH_CONSTANTS.GRAPH_3D.DIRECTIONAL_INTENSITY
        ));
        
        // Set initial camera position
        console.log('📷 Setting camera position...');
        setInitial3DCameraPosition(fgRef.current);
        
        console.log('✅ 3D scene setup completed successfully');
      } catch (error) {
        console.error('❌ Failed to setup 3D scene:', error);
      }
    } else {
      console.log('⏸️ Skipping 3D setup:', {
        reason: !fgRef.current ? 'No ref' : 'No nodes',
        refExists: !!fgRef.current,
        nodeCount: nodes.length
      });
    }
  }, [nodes, links]);

  const commonProps = getCommonGraphProps({ 
    nodes, 
    links, 
    onNodeClick, 
    is3D: true
  });

  // Debug render
  console.log('🖼️ Graph3D about to render ForceGraph3D:', {
    webglSupported: debugInfo.webgl,
    mounted: debugInfo.mounted,
    commonPropsKeys: Object.keys(commonProps),
    graphDataNodeCount: commonProps.graphData?.nodes?.length,
    graphDataLinkCount: commonProps.graphData?.links?.length
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Debug overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        fontSize: '12px',
        borderRadius: '4px',
        zIndex: 1000
      }}>
        3D Debug: WebGL={debugInfo.webgl ? '✅' : '❌'} | Nodes={nodes.length} | Links={links.length}
      </div>
      
      <ForceGraph3D
        ref={fgRef}
        {...commonProps}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={GRAPH_CONSTANTS.COLORS.BACKGROUND}
        warmupTicks={50}
        nodeThreeObject={createNodeSprite}
        nodeThreeObjectExtend={true}
        linkWidth={link => link.weight * GRAPH_CONSTANTS.GRAPH_3D.LINK_WIDTH_MULTIPLIER}
        linkThreeObjectExtend={true}
        linkThreeObject={link => {
          try {
            // Add text sprite on links with fallback for missing influenceType
            const linkLabel = link.influenceType ? 
              `${link.influenceType} (${link.weight.toFixed(2)})` : 
              `${link.weight.toFixed(2)}`;
            const sprite = new SpriteText(linkLabel);
            sprite.color = GRAPH_CONSTANTS.COLORS.TEXT_PRIMARY;
            sprite.textHeight = 6;
            sprite.material.depthTest = false;
            return sprite;
          } catch (error) {
            console.error('❌ Failed to create link sprite:', error);
            return null;
          }
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          try {
            const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
              [c]: start[c] + (end[c] - start[c]) / 2
            })));
            Object.assign(sprite.position, middlePos);
          } catch (error) {
            console.error('❌ Failed to update link position:', error);
          }
        }}
        linkDirectionalParticles={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_COUNT}
        linkDirectionalParticleWidth={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_WIDTH}
        linkDirectionalParticleColor={GRAPH_CONSTANTS.COLORS.TEXT_PRIMARY}
        linkDirectionalParticleSpeed={GRAPH_CONSTANTS.GRAPH_3D.PARTICLE_SPEED}
        onEngineStop={() => console.log('🎮 3D Force engine stopped')}
        onEngineStart={() => console.log('🎮 3D Force engine started')}
      />
    </div>
  );
};

export default Graph3D;