
let currentPage = 1;
let transitioning = false;
let transAlpha = 0;
let transDir = 'out';   
let nextPage = null;
let noiseT = 0;

const COL = {
  purple:     [120,  60, 200],
  violet:     [160,  80, 255],
  deepPurple: [ 60,  20, 120],
  glow:       [180, 100, 255],
  white:      [255, 255, 255],
  dark:       [  8,   4,  18],
};


let bgSynth, bgLoop, clickSynth, tickSynth;
let audioReady = false;

function initAudio() {
   if (audioReady) return;
  audioReady = true;

  
  bgSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 2.5, decay: 1, sustain: 0.7, release: 4 },
    volume: -22,
  }).toDestination();

  const reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).toDestination();
  bgSynth.connect(reverb);

  bgLoop = new Tone.Pattern((time, note) => {
    bgSynth.triggerAttackRelease(note, '2n', time);
  }, ['C3', 'Eb3', 'G3', 'Bb3', 'Ab3', 'F3'], 'random');
  bgLoop.interval = '1n';
  bgLoop.start(0);
  Tone.Transport.bpm.value = 52;
  Tone.Transport.start();

 clickSynth = new Tone.Synth({
  oscillator: { type: 'sine', count: 3, spread: 20 },
  envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.8 },
  volume: -8,
}).toDestination();

  tickSynth = new Tone.MetalSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.01 },
    volume: -28,
  }).toDestination();
}

function playKeySound() {
  if (!audioReady) return;
  let synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1  },
    volume: -10,
  }).toDestination();
  const r = new Tone.Reverb({ decay: 2, wet: 0.4 }).toDestination();
synth.connect(r);
  let notes = ['C4','D4','Eb4','F4','G4','Ab4','Bb4'];
  synth.triggerAttackRelease(notes[floor(random(notes.length))], '8n');
}
function playClickSound() {
  if (!audioReady) return;
  let notes = ['C2', 'G2', 'Bb2', 'F2'];
  clickSynth.triggerAttackRelease(notes[floor(random(notes.length))], '8n');
}
function playTick() {
  if (!audioReady) return;
  tickSynth.triggerAttackRelease('32n');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-wrap');
   bgVideo1 = createVideo(['assets/bg1.mp4']);;
   bgVideo1.size(width, height); bgVideo1.volume(0); bgVideo1.loop(); bgVideo1.hide();
   bgVideo3 = createVideo(['assets/bg.mp4']); 
   bgVideo3.size(width, height); bgVideo3.volume(0); bgVideo3.loop(); bgVideo3.hide();
  colorMode(RGB, 255, 255, 255, 1);
  textFont('Courier New');
  frameRate(60);
  P1.setup(); P2.setup(); P3.setup(); P4.setup();
  P2.setAssets(imgRoom, [imgObj0, imgObj1, imgObj2, imgObj3, imgObj4]);
  P3.loadOBJ('tea',    teaLines);
  P3.loadOBJ('clock',  clockLines);
  P3.loadOBJ('tv',     tvLines);
  P3.loadOBJ('camera', cameraLines);
  P3.loadOBJ('bowl',   bowlLines);
  P4.setAssets(imgLetterOpen, imgLetterSealed);
}

function draw() {
if (currentPage === 1) image(bgVideo1, 0, 0, width, height);
if (currentPage === 3) image(bgVideo3, 0, 0, width, height);



  noiseT += 0.002;

  switch (currentPage) {
    case 1: P1.draw(); break;
    case 2: P2.draw(); break;
    case 3: P3.draw(); break;
    case 4: P4.draw(); break;
  }

  if (transitioning) {
    noStroke();
    fill(0, 0, 0, transAlpha);
    rect(0, 0, width, height);

    if (transDir === 'out') {
      transAlpha = min(1, transAlpha + 0.045);
      if (transAlpha >= 1) {
        currentPage = nextPage;
        _initPage(currentPage);
        transDir = 'in';
      }
    } else {
      transAlpha = max(0, transAlpha - 0.028);
      if (transAlpha <= 0) transitioning = false;
    }
  }
}

function _initPage(p) {
  switch (p) {
    case 1: P1.init(); break;
    case 2: P2.init(); break;
    case 3: P3.init(); break;
    case 4: P4.init(); break;
  }
}

function goToPage(p) {
  if (transitioning) return;
  nextPage = p;
  transitioning = true;
  transDir = 'out';
  transAlpha = 0;
}

function mousePressed() {
  if (transitioning) return;
  Tone.start().then(initAudio);
  switch (currentPage) {
    case 1: P1.mousePressed(); break;
    case 2: P2.mousePressed(); break;
    case 3: P3.mousePressed(); break;
    case 4: P4.mousePressed(); break;
  }
}
function mouseMoved() {
  if (transitioning) return;
  if (currentPage === 3) P3.mouseMoved();
}
function mouseDragged() {
  if (transitioning) return;
  if (currentPage === 3) P3.mouseDragged();
}
function mouseReleased() {
  if (transitioning) return;
  if (currentPage === 3) P3.mouseReleased();
}
function mouseWheel(e) {
  if (transitioning) return;
  if (currentPage === 3) return P3.mouseWheel(e);
}
function keyPressed() {
  if (transitioning) return;
  if (currentPage === 3) { P3.keyPressed(); return false; }
  if (currentPage === 4) { return P4.keyPressed(); }
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); 
  if (currentPage === 2) P2.init(); 
}

let teaLines, clockLines, tvLines, cameraLines, bowlLines;
let imgLetterOpen, imgLetterSealed;
let bgVideo1, bgVideo3;
let imgRoom, imgObj0, imgObj1, imgObj2, imgObj3, imgObj4;

function preload() {
  imgRoom = loadImage('assets/bgImg.png');
  imgObj0 = loadImage('assets/obj0.png');
  imgObj1 = loadImage('assets/obj1.png');
  imgObj2 = loadImage('assets/obj2.png');
  imgObj3 = loadImage('assets/obj3.png');
  imgObj4 = loadImage('assets/obj4.png');   
  teaLines    = loadStrings('assets/tea.obj');
  clockLines  = loadStrings('assets/clock.obj');
  tvLines     = loadStrings('assets/tv.obj');
  cameraLines = loadStrings('assets/camera.obj');
  bowlLines   = loadStrings('assets/bowl.obj');
  imgLetterOpen   = loadImage('assets/letter_open.png');
  imgLetterSealed = loadImage('assets/letter_sealed.png');
}

function glowEllipse(x, y, r, col, alpha, layers = 5) {
  noStroke();
  for (let i = layers; i >= 1; i--) {
    fill(col[0], col[1], col[2], (alpha / layers) * 0.6);
    ellipse(x, y, r * i * 0.6, r * i * 0.6);
  }
  fill(col[0], col[1], col[2], alpha);
  ellipse(x, y, r, r);
}

function drawScanlines(alpha = 0.025) {
  stroke(0, 0, 0, alpha);
  strokeWeight(1);
  for (let y = 0; y < height; y += 3) line(0, y, width, y);
}

function drawVignette() {
  let g = drawingContext;
  let grad = g.createRadialGradient(width/2, height/2, height*0.2, width/2, height/2, height*0.85);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.82)');
  g.fillStyle = grad;
  g.fillRect(0, 0, width, height);
}

function drawGrain(amount) {
  noStroke();
  for (let i = 0; i < amount; i++) {
    fill(random(80,160), random(20,80), random(180,255), random(0.03, 0.09));
    rect(random(width), random(height), random(1,2), 1);
  }
}