const NodeLegend = ({ 
  className = '',
  leftPanelWidth = 50,
  fullscreenMode = null,
  isRotating = false,
  showLinkTexts2D = true,
  showBidirectional = false,
  alternativeShapes = false,
  onToggleFullscreen = () => {},
  onToggleRotation = () => {},
  onToggleLinkTexts2D = () => {},
  onToggleBidirectional = () => {},
  onToggleAlternativeShapes = () => {}
}) => {

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
      {/* Logo ganz links am Viewport-Rand */}
      <div style={{
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 10000
      }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{
            height: '32px',
            width: 'auto',
            opacity: 0.9,
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
          }}
        />
        <div style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          letterSpacing: '0.3px'
        }}>
          Risk Sim
        </div>
      </div>
      
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
          <button
            onClick={onToggleLinkTexts2D}
            style={{
              backgroundColor: showLinkTexts2D ? '#10b981' : '#374151',
              color: 'white',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={showLinkTexts2D ? 'Hide Link Texts' : 'Show Link Texts'}
          >
{showLinkTexts2D ? 'T' : 'T̸'}
          </button>
          <button
            onClick={() => onToggleFullscreen('2d')}
            style={{
              backgroundColor: fullscreenMode === '2d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={fullscreenMode === '2d' ? 'Exit Fullscreen' : 'Fullscreen 2D'}
          >
            {fullscreenMode === '2d' ? '⇱' : '⛶'}
          </button>
        </div>

        {/* Center Section - Bidirectional Toggle Only */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '16px',
          flex: '1 1 auto'
        }}>
          {/* Bidirectional Toggle Button */}
          <button
            onClick={() => {
              console.log('🎯 NodeLegend button clicked! showBidirectional prop:', showBidirectional);
              console.log('🎯 Calling onToggleBidirectional...');
              onToggleBidirectional();
            }}
            style={{
              backgroundColor: showBidirectional ? '#10b981' : '#374151',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              minWidth: '40px'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={showBidirectional ? 'Switch to Unidirectional Links' : 'Switch to Bidirectional Links'}
          >
            {showBidirectional ? '↔' : '→'}
          </button>
          
          {/* Alternative Shapes Toggle Button */}
          <button
            onClick={() => {
              console.log('🔘 Shape button clicked');
              onToggleAlternativeShapes();
            }}
            style={{
              backgroundColor: alternativeShapes ? '#f97316' : '#374151',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              minWidth: '40px'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={alternativeShapes ? 'Switch to Default Shapes' : 'Switch to Alternative Shapes'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
              <g fill="currentColor">
                <path d="m20.708 4.412l-10.25 10.287h3.59v2h-7v-7h2v3.58L19.293 3z"/>
                <path d="M11 4.706v2H5v12h12v-6h2v8H3v-16z"/>
              </g>
            </svg>
          </button>
        </div>

        {/* Right Section - 3D Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '0 0 auto'
        }}>
          <button
            onClick={() => onToggleFullscreen('3d')}
            style={{
              backgroundColor: fullscreenMode === '3d' ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
              padding: '8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '80px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title={isRotating ? 'Stop Rotation' : 'Start Rotation'}
          >
            {isRotating ? 'Stop Rotation' : 'Start Rotation'}
          </button>
        </div>
      </div>
      
      {/* Controls Disabled Message - Right Edge */}
      {isRotating && (
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10000
        }}>
          <span style={{
            color: '#fbbf24',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
            animation: 'pulse 2s infinite',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            🔒 Controls Disabled
          </span>
        </div>
      )}
    </div>
  );
};

export default NodeLegend;