// Graph visualization constants
export const GRAPH_CONSTANTS = {
  // Node styling
  NODE_SIZES: {
    MIN: 4,
    MAX: 32,
    CONFIDENCE_MULTIPLIER: 8
  },

  // Colors
  COLORS: {
    BACKGROUND: '#000000',
    LINK_DEFAULT: 'rgba(255,255,255,0.8)',
    PARTICLE_COLOR: 'rgba(255, 0, 0, 0.5)', // Transparent red particles
    TEXT_PRIMARY: '#ffffff',
    TEXT_VALUE: '#FFD700', // Gold for values
    NODE_FALLBACK: '#6B7280'
  },

  // 2D specific constants
  GRAPH_2D: {
    FONT_SIZE: 12,
    VALUE_FONT_SIZE: 10,
    LINK_WIDTH_MULTIPLIER: 2,
    PARTICLE_COUNT: 3,
    PARTICLE_WIDTH: 6,
    PARTICLE_SPEED: 0.005
  },

  // 3D specific constants  
  GRAPH_3D: {
    TEXT_HEIGHT: 8,
    VALUE_TEXT_HEIGHT: 6,
    LINK_TEXT_HEIGHT: 4, // Increased from 3 for better readability
    TEXT_OFFSET_Y: 10,
    VALUE_OFFSET_Y: -8,
    LINK_WIDTH_MULTIPLIER: 3,
    PARTICLE_COUNT: 2,
    PARTICLE_WIDTH: 2,
    PARTICLE_SPEED: 0.008,
    CAMERA_DISTANCE: 390,
    AMBIENT_LIGHT: 0x888888,
    AMBIENT_INTENSITY: 0.4,
    DIRECTIONAL_LIGHT: 0xffffff,
    DIRECTIONAL_INTENSITY: 0.6
  },

  // Force simulation settings
  FORCES: {
    '2D': {
      CHARGE_STRENGTH: -80,   // Stärkere Abstoßung für mehr Spreizung
      LINK_DISTANCE_BASE: 225, // Größere Basis-Abstände  
      LINK_DISTANCE_MULTIPLIER: 70 // Mehr Gewichtung für luftigeres Layout
    },
    '3D': {
      CHARGE_STRENGTH: -30,   // Gleiche Werte wie 2D - gleiche Physik!
      LINK_DISTANCE_BASE: 80,  // Gleiche Werte wie 2D
      LINK_DISTANCE_MULTIPLIER: 20 // Gleiche Werte wie 2D
    }
  },

  // Animation timings
  ANIMATION: {
    CAMERA_TRANSITION_MS: 1000,
    FORCE_SETTLING_MS: 200
  }
};

// Node type color mapping
export const NODE_TYPE_COLORS = {
  'environment': '#10B981', // Modern Emerald Green
  'boundary': '#8B5CF6',    // Elegant Violet  
  'system': '#F97316'       // Warm Orange
};