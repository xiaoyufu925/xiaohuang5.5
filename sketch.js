
let video;
let flowers = [];
let bloomParticles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  let constraints = {
    video: {
      facingMode: { ideal: "environment" }
    },
    audio: false
  };

  video = createCapture(constraints, () => {
    console.log("📷 后置摄像头已启动");
  });

  video.size(width, height);
  video.hide();
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  video.loadPixels();

  detectYellowFlowers();

  for (let f of flowers) {
    f.update();
    f.display();
  }

  for (let i = bloomParticles.length - 1; i >= 0; i--) {
    let p = bloomParticles[i];
    p.update();
    p.show();
    if (p.isFinished()) {
      bloomParticles.splice(i, 1);
    }
  }
}

function detectYellowFlowers() {
  let currentDetections = [];

  for (let y = 0; y < video.height; y += 10) {
    for (let x = 0; x < video.width; x += 10) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      let d = dist(r, g, b, 255, 255, 0);
      if (d < 80 && r > 200 && g > 200 && b < 100) {
        let screenX = map(x, 0, video.width, 0, width);
        let screenY = map(y, 0, video.height, 0, height);
        currentDetections.push({ x: screenX, y: screenY });
      }
    }
  }

  for (let det of currentDetections) {
    let exists = false;
    for (let f of flowers) {
      if (dist(f.x, f.y, det.x, det.y) < 50) {
        exists = true;
        f.targetSize = 80;
      }
    }
    if (!exists) {
      flowers.push(new Flower(det.x, det.y));
    }
  }
}

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.targetSize = 80;
    this.growthRate = 2;
    this.hue = 45;  // yellowish
    this.saturation = 100;
    this.brightness = 100;
  }

  update() {
    if (this.size < this.targetSize) {
      this.size += this.growthRate;
    }
    this.hue += 0.2;  // slowly shift color hue
    if (this.hue > 55) this.hue = 45;  // loop
  }

  display() {
    push();
    translate(this.x, this.y);
    colorMode(HSB);
    noStroke();
    fill(this.hue, this.saturation, this.brightness);
    for (let i = 0; i < 5; i++) {
      let angle = TWO_PI / 5 * i;
      let px = cos(angle) * this.size * 0.5;
      let py = sin(angle) * this.size * 0.5;
      ellipse(px, py, this.size * 0.5, this.size * 0.3);
    }
    fill(30, 100, 90);
    ellipse(0, 0, this.size * 0.4);
    pop();
  }
}

function mousePressed() {
  for (let i = 0; i < 10; i++) {
    bloomParticles.push(new BloomParticle(mouseX, mouseY));
  }
}

class BloomParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(12, 18);
    this.angle = random(TWO_PI);
    this.speed = random(1.5, 3);
    this.alpha = 255;
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    this.alpha -= 4;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(55, 100, 100, this.alpha);  // HSB yellow
    colorMode(HSB);
    ellipse(0, 0, this.r * 1.2, this.r);
    pop();
  }

  isFinished() {
    return this.alpha <= 0;
  }
}
