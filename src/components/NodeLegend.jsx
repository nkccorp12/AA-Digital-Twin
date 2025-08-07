const NodeLegend = ({ 
  className = '',
  leftPanelWidth = 50,
  fullscreenMode = null,
  isRotating = false,
  onToggleFullscreen = () => {},
  onToggleRotation = () => {}
}) => {
  const nodeTypes = [
    {
      type: 'environment',
      color: '#10B981', // Modern Emerald Green
      label: 'Environment',
      description: 'External factors'
    },
    {
      type: 'boundary',
      color: '#8B5CF6', // Elegant Violet
      label: 'Boundary',
      description: 'Governance layers'
    },
    {
      type: 'system',
      color: '#F97316', // Warm Orange
      label: 'System', 
      description: 'Core operations'
    }
  ];

  return (
    <div 
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        {/* Left Section - 2D Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '0 0 auto'
        }}>
          <span style={{
            color: 'white',
            fontSize: '12px'
          }}>
            📊 2D View ({Math.round(leftPanelWidth)}%)
          </span>
          <button
            onClick={() => onToggleFullscreen('2d')}
            style={{
              backgroundColor: fullscreenMode === '2d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={fullscreenMode === '2d' ? 'Exit Fullscreen' : 'Fullscreen 2D'}
          >
            {fullscreenMode === '2d' ? '⇱' : '⛶'}
          </button>
        </div>

        {/* Center Section - Legend Items */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '24px',
          flex: '1 1 auto'
        }}>
          {nodeTypes.map((nodeType) => (
            <div key={nodeType.type} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              {/* Color Square */}
              <div 
                style={{ 
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: nodeType.color,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              />
              
              {/* Type Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: 'white',
                  letterSpacing: '0.3px'
                }}>
                  {nodeType.label}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#a1a1a1',
                  letterSpacing: '0.2px'
                }}>
                  {nodeType.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section - 3D Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '0 0 auto'
        }}>
          <span style={{
            color: 'white',
            fontSize: '12px'
          }}>
            🌐 3D View ({Math.round(100 - leftPanelWidth)}%)
          </span>
          <button
            onClick={() => onToggleFullscreen('3d')}
            style={{
              backgroundColor: fullscreenMode === '3d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={fullscreenMode === '3d' ? 'Exit Fullscreen' : 'Fullscreen 3D'}
          >
            {fullscreenMode === '3d' ? '⇱' : '⛶'}
          </button>
          <button
            onClick={onToggleRotation}
            style={{
              backgroundColor: isRotating ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={isRotating ? 'Stop Rotation' : 'Start Rotation'}
          >
            {isRotating ? 'Stop Rotation' : 'Start Rotation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeLegend;