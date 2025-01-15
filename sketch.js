let walls = []; 
let ray;
let particle;

let wallCount = 7; 
let rayCount = 1; 
let starPositions = []; 

function setup() {
  createCanvas(1000, 1000); 

  // Main star in the middle
  starPositions.push({ x: width / 2, y: height / 2, outer: 300, inner: 120 });
  
  // Three smaller stars with adjusted positions and sizes
  starPositions.push({ x: width / 4, y: height / 4, outer: 150, inner: 60 }); 
  starPositions.push({ x: width / 6, y: height * 0.75, outer: 150, inner: 60 }); 
  starPositions.push({ x: width * 0.75, y: height * 0.75, outer: 180, inner: 72 }); 

  // Adjust size for the small star on the left side
  starPositions[2].outer *= 0.8; 
  starPositions[2].inner *= 0.8;

  // Adjust size for the top-left star
  starPositions[1].outer *= 0.3; 
  starPositions[1].inner *= 0.3; 

  // Create stars using the stored positions and sizes
  for (let pos of starPositions) {
    createStarBoundaries(pos.x, pos.y, pos.outer, pos.inner, 5);
  }

  // Outlines (the boundaries of the canvas)
  walls.push(new Boundary(-2, -2, height, -2));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));

  particle = new Particle();

  noCursor();
}

function draw() {
  background(128, 0, 32); // Burgundy background

  for (let wall of walls) {
    wall.show();
  }

  // Particle follows mouse movement
  particle.update(mouseX, mouseY);
  particle.show();
  particle.look(walls);
}


///////////////////////////////////////////////Walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(128, 0, 32); // Burgundy-colored walls (same as background)
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

///////////////////////////////////////////Rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255); // Ray visibility in white
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

////////////////////////////////////////////////////Particles
class Particle { 
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        let grayValue = (frameCount * 5 + i * 10) % 255; // Spinning grayscale value
        // Spinning effect where rays transition between black, white, and red
        stroke(grayValue, 150, 150); // Spinning rays colors
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255); // Smaller circle for the white light source (particle)
    noStroke();
    ellipse(this.pos.x, this.pos.y, 8); // Radius is smaller (previously it was 10, now it's 8)
    for (let ray of this.rays) {
      ray.show();
    }
  }
}

///////////////////////////////////////////////Star Boundary Generator
function createStarBoundaries(cx, cy, rOuter, rInner, points) {
  let angleStep = PI / points; 
  let vertices = [];

  for (let i = 0; i < points * 2; i++) { 
    let angle = i * angleStep;
    let r = i % 2 === 0 ? rOuter : rInner; 
    let x = cx + cos(angle) * r;
    let y = cy + sin(angle) * r;
    vertices.push(createVector(x, y));
  }

  /// Connect vertices to form boundaries
  for (let i = 0; i < vertices.length; i++) {
    let a = vertices[i];
    let b = vertices[(i + 1) % vertices.length]; 
    walls.push(new Boundary(a.x, a.y, b.x, b.y));
  }
}
