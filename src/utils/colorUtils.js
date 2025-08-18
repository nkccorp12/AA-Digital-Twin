// Color logic for nodes based on shape mode
export const getNodeColor = (nodeType, alternativeShapes) => {
  if (!alternativeShapes) {
    // Original 3-color system
    switch (nodeType) {
      case 'environment':
        return '#10B981'; // Modern Emerald Green
      case 'boundary':
        return '#8B5CF6'; // Elegant Violet
      case 'system':
        return '#F97316'; // Warm Orange
      default:
        return '#10B981'; // Default green
    }
  } else {
    // Alternative 2-color system based on shapes
    if (nodeType === 'environment') {
      return '#ff4d4d'; // Red for triangles (Extern)
    } else {
      return '#10b981'; // Green for squares (Intern) - both boundary and system
    }
  }
};