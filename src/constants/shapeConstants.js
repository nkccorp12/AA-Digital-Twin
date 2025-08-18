// 2D Shape drawing functions for Canvas context
export const SHAPE_2D = {
  environment: (ctx, radius) => {
    // Circle
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  },
  
  boundary: (ctx, radius) => {
    // Triangle (pointing up)
    ctx.moveTo(0, -radius);
    ctx.lineTo(-radius * 0.866, radius * 0.5);
    ctx.lineTo(radius * 0.866, radius * 0.5);
    ctx.closePath();
  },
  
  system: (ctx, radius) => {
    // Diamond
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius, 0);
    ctx.closePath();
  },
  
  default: (ctx, radius) => {
    // Default circle
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  }
};

// 3D Geometry factory functions for Three.js
export const SHAPE_3D = {
  environment: (size) => {
    // Circle -> Sphere
    return {
      type: 'SphereGeometry',
      args: [size/2, 16, 16]
    };
  },
  
  boundary: (size) => {
    // Triangle -> Cone
    return {
      type: 'ConeGeometry', 
      args: [size/2, size, 6]
    };
  },
  
  system: (size) => {
    // Diamond -> Octahedron
    return {
      type: 'OctahedronGeometry',
      args: [size/2]
    };
  },
  
  default: (size) => {
    // Default sphere
    return {
      type: 'SphereGeometry',
      args: [size/2, 16, 16]
    };
  }
};

// Alternative 2D shape set
export const SHAPE_2D_ALT = {
  environment: (ctx, radius) => {
    // Triangle (pointing up)
    ctx.moveTo(0, -radius);
    ctx.lineTo(-radius * 0.866, radius * 0.5);
    ctx.lineTo(radius * 0.866, radius * 0.5);
    ctx.closePath();
  },
  
  boundary: (ctx, radius) => {
    // Square/Rectangle
    ctx.rect(-radius/2, -radius/2, radius, radius);
  },
  
  system: (ctx, radius) => {
    // Square/Rectangle (same as boundary)
    ctx.rect(-radius/2, -radius/2, radius, radius);
  },
  
  default: (ctx, radius) => {
    // Default triangle
    ctx.moveTo(0, -radius);
    ctx.lineTo(-radius * 0.866, radius * 0.5);
    ctx.lineTo(radius * 0.866, radius * 0.5);
    ctx.closePath();
  }
};

// Alternative 3D geometry set
export const SHAPE_3D_ALT = {
  environment: (size) => {
    // Triangle -> Cone
    return {
      type: 'ConeGeometry',
      args: [size/2, size, 4]  // 4-sided cone for triangle-like appearance
    };
  },
  
  boundary: (size) => {
    // Square -> Cube/Box
    return {
      type: 'BoxGeometry', 
      args: [size, size, size]
    };
  },
  
  system: (size) => {
    // Square -> Cube/Box (same as boundary)
    return {
      type: 'BoxGeometry',
      args: [size, size, size]
    };
  },
  
  default: (size) => {
    // Default cone
    return {
      type: 'ConeGeometry',
      args: [size/2, size, 4]
    };
  }
};