const P3 = (() => {

  const STREAM = [
    "you were holding something…",
    "I can't see your face clearly…",
    "don't stop…",
    "it keeps repeating…",
    "I recognise nothing…",
    "please…",
    "almost…",
    "don't stop looking…",
    "you left something here…",
    "it changes every time…",
    "I miss everything about you…",
    "you are always in my memories…",
  ];

  const SHAPE_NAMES = ['tea', 'clock', 'tv', 'camera', 'bowl'];
  const PARTICLE_COUNT = 380;


const POEM_SETS = [


  {
    left: [
      "the teapot",
      "was always",
      "already warm",
      "before I woke up.",
      "",
      "steam drifted",
      "through the room",
      "like a quiet",
      "morning ritual."
    ],

    right: [
      "you poured tea",
      "slowly.",
      "",
      "as if",
      "there would",
      "always be",
      "another morning",
      "waiting for us."
    ],
  },

 
  {
    left: [
      "the old clock",
      "never stopped",
      "ticking.",
      "",
      "even late",
      "at night,",
      "its sound",
      "filled",
      "the hallway."
    ],

    right: [
      "sometimes",
      "I listened",
      "to it",
      "instead of sleeping.",
      "",
      "it sounded",
      "like time",
      "was breathing."
    ],
  },


  {
    left: [
      "the television",
      "glowed softly",
      "in the dark.",
      "",
      "colors flickered",
      "across your face",
      "while the room",
      "stayed silent."
    ],

    right: [
      "I don't remember",
      "what was playing.",
      "",
      "only the feeling",
      "of sitting there",
      "beside you."
    ],
  },


  {
    left: [
      "you placed",
      "the camera",
      "carefully",
      "in my hands.",
      "",
      "'wait for the light,'",
      "you said,",
      "before taking",
      "the picture."
    ],

    right: [
      "I still look",
      "for that light",
      "sometimes.",
      "",
      "in windows.",
      "in strangers.",
      "in myself."
    ],
  },


  {
    left: [
      "the bowls",
      "and chopsticks",
      "clinked softly",
      "against the table.",
      "",
      "small sounds",
      "that once made",
      "the house",
      "feel full."
    ],

    right: [
      "now the table",
      "looks larger",
      "than before.",
      "",
      "as if",
      "absence itself",
      "has taken up",
      "a seat."
    ],
  },

];
  let _poemIdx     = 0;
  let _poemAlphaA  = 0;   
  let _poemAlphaB  = 0;   
  let _poemFading  = false;

  const LEFT_LINES  = POEM_SETS[0].left;
  const RIGHT_LINES = POEM_SETS[0].right;

  let particles  = [];
  let shapeIdx   = 0;
  let exploding  = false;
  let explodeTimer = 0;
  let mutCount   = 0;

  let rotX = 0, rotY = 0;
  let dragRotX = 0, dragRotY = 0;
  let isDragging = false;
  let lastMX = 0, lastMY = 0;
  let velX = 0, velY = 0;

  let zoomScale  = 1.0;
  let zoomTarget = 1.0;
  const ZOOM_MIN = 0.28;
  const ZOOM_MAX = 3.6;

  let prevMouseX = 0, prevMouseY = 0;
  let mouseVX    = 0, mouseVY    = 0;
  const MOUSE_INFLUENCE = 100;

  let glitchLevel  = 0;
  let glitchActive = false;
  let glitchCooldown = 0;
  let ambParticles = [];

  let streamChars  = [];
  let streamTimer  = 0;
  let streamIdx    = 0;
  let streamGlitch = false;
  let streamSpeed  = 1;

  let btnHovered = false;
  let btnAlpha   = 0;
  let btnX, btnY, btnW, btnH;

  let rgbShift = 0;
  let shakeX = 0, shakeY = 0;
  let poetryAlpha = 0;

  const _objRegistry = {};

  function _getShapeVerts(idx) {
    let name = SHAPE_NAMES[idx % SHAPE_NAMES.length];
    if (_objRegistry[name]) {
      let src = _objRegistry[name];
      return Array.from({ length: PARTICLE_COUNT },
        (_, i) => src[i % src.length]);
    }
    let n = PARTICLE_COUNT;
    return Array.from({length: n}, () => ({
      x: (Math.random()-0.5)*2,
      y: (Math.random()-0.5)*2,
      z: (Math.random()-0.5)*2,
    }));
  }

  function setup() {}

  function init() {
    shapeIdx  = 0;
    exploding = false; explodeTimer = 0; mutCount = 0;
    rotX = 0; rotY = 0; dragRotX = 0; dragRotY = 0;
    velX = 0; velY = 0; isDragging = false;
    zoomScale = 1.0; zoomTarget = 1.0;
    glitchLevel = 0; glitchActive = false;
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseVX = 0; mouseVY = 0;
    ambParticles = [];
    for (let i = 0; i < 50; i++) _spawnAmb(true);
    streamChars = []; streamTimer = 0; streamIdx = 0;
    btnAlpha = 0; rgbShift = 0; shakeX = 0; shakeY = 0;
    poetryAlpha = 0; _poemIdx=0; _poemIdxB=1; _poemAlphaA=0; _poemAlphaB=0; _poemFading=false;
    _nextStream();
    _buildParticles(shapeIdx, true);
  }

  function _buildParticles(idx, firstTime) {
    let verts  = _getShapeVerts(idx);
    let scale  = min(width, height) * 0.27;

    if (firstTime || particles.length === 0) {
      particles = verts.map(v => ({
        x: width/2  + random(-scale, scale),
        y: height/2 + random(-scale, scale),
        tx: v.x * scale,
        ty: v.y * scale,
        tz: v.z * scale,
        vx: 0, vy: 0,
        col: random() < 0.50 ? COL.violet
           : random() < 0.65 ? COL.glow
           : [220, 160, 255],
        size: random(1.6, 4.8),
        alpha: 0,
      }));
    } else {
      for (let i = 0; i < particles.length; i++) {
        let v = verts[i % verts.length];
        particles[i].tx = v.x * scale;
        particles[i].ty = v.y * scale;
        particles[i].tz = v.z * scale;
      }
    }
  }

  function draw() {
    image(bgVideo3, 0, 0, width, height);
    rgbShift  = max(0, rgbShift - 0.04);
    shakeX   *= 0.82; shakeY *= 0.82;
    streamGlitch = false;

    rotX += 0.003;
    rotY += 0.005;

    if (!isDragging) {
      dragRotX += velX; dragRotY += velY;
      velX *= 0.90;    velY *= 0.90;
    }

    mouseVX    = mouseX - prevMouseX;
    mouseVY    = mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    let mouseSpeed = sqrt(mouseVX*mouseVX + mouseVY*mouseVY);
    if (mouseSpeed > 18 && !exploding && glitchCooldown <= 0) {
      glitchLevel    = min(1, glitchLevel + 1);
      glitchCooldown = 200;
    }
    if (glitchCooldown > 0) glitchCooldown--;
    glitchLevel  = max(0, glitchLevel - 0.008);
    glitchActive = glitchLevel > 0.2;

    if (exploding) {
      explodeTimer++;
      if (explodeTimer > 55) {
        exploding = false;
        explodeTimer = 0;
        _buildParticles(shapeIdx, false);
      }
    }

    zoomScale += (zoomTarget - zoomScale) * 0.10;

    _drawBg();
    _updateAmb();

    poetryAlpha = min(0.65, poetryAlpha + 0.003);
    _poemAlphaA = min(0.65, _poemAlphaA + 0.003);
 
    if (_poemFading) {
      _poemAlphaB = min(0.65, _poemAlphaB + 0.018);
      _poemAlphaA = max(0,    _poemAlphaA - 0.022);
      if (_poemAlphaA <= 0) {
        _poemIdx    = _poemIdxB;
        _poemAlphaA = _poemAlphaB;
        _poemAlphaB = 0;
        _poemFading = false;
      }
    }
    _drawPoetryPanels();

    push(); translate(shakeX, shakeY);
    _drawParticles();
    pop();

    _drawRGBShift();
    _drawTextStream();
    _drawBottomQuote();
    _drawMoveOnBtn();

    push();
    fill(255,255,255, 0.55);
    noStroke(); textSize(9); textAlign(CENTER,CENTER);
    text('P R E S S   A N Y   K E Y   T O   T R A N S F O R M', width/2, 36);
    pop();

    push();
    fill(COL.violet[0],COL.violet[1],COL.violet[2], 0.9);
    noStroke(); textSize(8); textAlign(RIGHT,TOP);
    text('SHAPE: ' + SHAPE_NAMES[shapeIdx % SHAPE_NAMES.length].toUpperCase(), width-24, 24);
    pop();
    _drawZoomIndicator();

    drawVignette();
    drawScanlines(0.022);
    drawGrain(80 + mutCount*5 + floor(glitchLevel*35));

    
    _drawHUD();

    cursor(isDragging ? 'grabbing' : (btnHovered ? HAND : 'grab'));
  }
  function _drawHUD() {
    const HUD_FONT_LG    = 11;   
    const HUD_FONT_SM    = 13;
    const HUD_ALPHA_HI   = 1.0;  
    const HUD_ALPHA_LO   = 0.82; 
    const HUD_PAD        = 22;   
    const HUD_LINE_H     = 17;   
    const HUD_CORNER_LEN = 22;   
    const HUD_CORNER_W   = 1.4; 
    const HUD_BG_ALPHA   = 0.30; 

    let m = HUD_PAD;
    let len = HUD_CORNER_LEN;

 
    push();
    noFill();
    stroke(COL.violet[0], COL.violet[1], COL.violet[2], 0.85);
    strokeWeight(HUD_CORNER_W);

    line(m, m, m+len, m);       line(m, m, m, m+len);
    line(width-m, m, width-m-len, m); line(width-m, m, width-m, m+len);
    line(m, height-m, m+len, height-m); line(m, height-m, m, height-m-len);
    line(width-m, height-m, width-m-len, height-m); line(width-m, height-m, width-m, height-m-len);
    pop();

    let tlX = m + 8;
    let tlY = m + 6;
    let tlLines = [
      { txt: 'MEMORY ARCHIVE  ■', sz: HUD_FONT_LG, col: COL.violet, a: HUD_ALPHA_HI },
      { txt: 'STATUS: ' + (glitchActive ? 'UNSTABLE' : mutCount > 0 ? 'TRACING' : 'REMEMBERING'),
                                               sz: HUD_FONT_SM, col: [255,255,255], a: HUD_ALPHA_LO },
      { txt: '---',                            sz: HUD_FONT_SM, col: [255,255,255], a: HUD_ALPHA_LO * 0.55 },
    ];

    if (HUD_BG_ALPHA > 0) {
      let panW = 170, panH = tlLines.length * HUD_LINE_H + 10;
      noStroke(); fill(8, 4, 18, HUD_BG_ALPHA);
      rect(tlX - 4, tlY - 2, panW, panH, 3);
    }

    push();
    noStroke(); textAlign(LEFT, TOP);
    for (let i = 0; i < tlLines.length; i++) {
      let l = tlLines[i];
      textSize(l.sz);
      fill(l.col[0], l.col[1], l.col[2], l.a);
      text(l.txt, tlX, tlY + i * HUD_LINE_H);
    }
    pop();

    let elapsed = frameCount / 60;
    let mm = floor(elapsed/60), ss = floor(elapsed%60), ms2 = floor((elapsed%1)*100);
    let timeStr = nf(mm,2) + ':' + nf(ss,2) + ':' + nf(ms2,2);

    let trLines = [
      { txt: timeStr + '  ■',   sz: HUD_FONT_SM, col: [255,255,255], a: HUD_ALPHA_LO },
    ];

    let trX = width - m - 8;
    let trY = m + 6;

    if (HUD_BG_ALPHA > 0) {
      let panW = 155, panH = trLines.length * HUD_LINE_H + 10;
      noStroke(); fill(8, 4, 18, HUD_BG_ALPHA);
      rect(trX - panW + 4, trY - 2, panW, panH, 3);
    }

    push();
    noStroke(); textAlign(RIGHT, TOP);
    for (let i = 0; i < trLines.length; i++) {
      let l = trLines[i];
      textSize(l.sz);
      fill(l.col[0], l.col[1], l.col[2], l.a);
      text(l.txt, trX, trY + i * HUD_LINE_H);
    }
    pop();

   
    push();
    noStroke(); textAlign(LEFT, BOTTOM);
    textSize(HUD_FONT_SM - 1);
    fill(255, 255, 255, HUD_ALPHA_LO * 0.6);
    text('EXISTING', m + 8, height - m - 4);
    pop();
  }

  function _drawPoems(setIdx, alpha) {
    if (alpha < 0.01) return;
    let set = POEM_SETS[setIdx % POEM_SETS.length];
    let lineH = 22, lx = 36;
    let ly = height/2 - (set.left.length * lineH)/2 - 20;
    push(); textFont('Courier New'); textSize(12); noStroke();
    // left
    textAlign(LEFT, TOP);
    for (let i=0; i<set.left.length; i++) {
      if (!set.left[i]) continue;
      let pulse = 0.82 + sin(frameCount*0.018 + i*0.4)*0.18;
      fill(255,255,255, min(1.0, alpha*pulse*2.2)); text(set.left[i], lx, ly+i*lineH);
    }
    // right
    let ry = height/2 - (set.right.length * lineH)/2 - 20;
    let rx = width - 36;
    textAlign(RIGHT, TOP);
    for (let i=0; i<set.right.length; i++) {
      if (!set.right[i]) continue;
      let pulse = 0.82 + sin(frameCount*0.018 + i*0.5)*0.18;
      fill(255,255,255, min(1.0, alpha*pulse*2.2)); text(set.right[i], rx, ry+i*lineH);
    }
    pop();
  }

  function _drawPoetryPanels() {
    _drawPoems(_poemIdx,  _poemAlphaA);
    if (_poemFading) _drawPoems(_poemIdxB, _poemAlphaB);
    let a = _poemAlphaA;
    if (a < 0.01) return;
    let set   = POEM_SETS[_poemIdx];
    let lineH = 22;
    let ly    = height/2 - (set.left.length  * lineH)/2 - 20;
    let ry    = height/2 - (set.right.length * lineH)/2 - 20;
    push();
    stroke(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.3);
    strokeWeight(0.5);
    line(28, ly - 4, 28, ly + set.left.length  * lineH + 4);
    line(width - 28, ry - 4, width - 28, ry + set.right.length * lineH + 4);
    pop();
  }

  function _drawBottomQuote() {
    let a = poetryAlpha * 0.95;
    if (a < 0.01) return;

    push();
    textFont('Courier New');
    textSize(11);
    textAlign(LEFT, CENTER);
    noStroke();

    let seg1 = 'you were here.   you saw.   you left a ';
    let seg2 = 'trace';
    let seg3 = '.   I miss you.';

    let w1 = textWidth(seg1);
    let w2 = textWidth(seg2);
    let w3 = textWidth(seg3);
    let total = w1 + w2 + w3;

    let sx = width / 2 - total / 2;
    let sy = height - 50;

    // subtle glow behind the whole line
    fill(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.08);
    textSize(13);
    text(seg1 + seg2 + seg3, sx, sy);

    textSize(11);
    fill(255, 255, 255, a * 0.68);
    text(seg1, sx, sy);
    let tp = 0.88 + sin(frameCount * 0.05) * 0.12;
    fill(COL.violet[0], COL.violet[1], COL.violet[2], a * tp);
    text(seg2, sx + w1, sy);

    fill(255, 255, 255, a * 0.68);
    text(seg3, sx + w1 + w2, sy);

    pop();
  }

  function _drawZoomIndicator() {
    let diff = abs(zoomScale - 1.0);
    let a = constrain(map(diff, 0.04, 0.15, 0, 1), 0, 1) * 0.55;
    if (a < 0.01) return;

    push();
    let bw = 56, bh = 3;
    let bx = width - 24 - bw, by = 40;

    fill(COL.violet[0], COL.violet[1], COL.violet[2], a);
    noStroke(); textSize(7); textAlign(RIGHT, TOP);
    text(nf(zoomScale, 1, 2) + '×', width - 24, by + 6);

    stroke(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.35);
    strokeWeight(0.6); noFill();
    rect(bx, by, bw, bh);

    let filled = map(zoomScale, ZOOM_MIN, ZOOM_MAX, 0, bw);
    fill(COL.glow[0], COL.glow[1], COL.glow[2], a * 0.7);
    noStroke(); rect(bx, by, constrain(filled, 0, bw), bh);

    let oneX = bx + map(1.0, ZOOM_MIN, ZOOM_MAX, 0, bw);
    stroke(255, 255, 255, a * 0.4); strokeWeight(0.6);
    line(oneX, by - 2, oneX, by + bh + 2);
    pop();
  }

  function _drawBg() {
    let g = drawingContext;
    let gr = g.createRadialGradient(width/2,height/2,0,width/2,height/2,height*0.7);
    gr.addColorStop(0,   'rgba(75,18,155,0.2)');
    gr.addColorStop(0.5, 'rgba(38,9,88,0.08)');
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0,0,width,height);
  }

  function _spawnAmb(ini) {
    ambParticles.push({
      x: random(width), y: ini ? random(height) : height+5,
      vx: random(-0.18,0.18), vy: random(-0.45,-0.12),
      size: random(1,3.5), alpha: random(0.2,0.7), life: random(0.5,1),
    });
  }

  function _updateAmb() {
    if (frameCount % 3 === 0) _spawnAmb(false);
    noStroke();
    for (let i = ambParticles.length-1; i >= 0; i--) {
      let p = ambParticles[i];
      p.x+=p.vx; p.y+=p.vy; p.life-=0.0022;
      if (p.life<=0||p.y<-5){ambParticles.splice(i,1);continue;}
      let a=p.alpha*p.life;
      fill(COL.violet[0],COL.violet[1],COL.violet[2],a*0.22);
      ellipse(p.x,p.y,p.size*3);
      fill(COL.glow[0],COL.glow[1],COL.glow[2],a*0.6);
      ellipse(p.x,p.y,p.size);
    }
  }

 function _drawParticles() {
  let cx = width / 2;
  let cy = height / 2 - 15;

  let totalRX = rotX + dragRotX;
  let totalRY = rotY + dragRotY;

  let fov = 420;

  let projected = particles.map(p => {

    let tx = p.tx * zoomScale;
    let ty = p.ty * zoomScale;
    let tz = p.tz * zoomScale;
    let cosY = cos(totalRY);
    let sinY = sin(totalRY);

    let rx = tx * cosY - tz * sinY;
    let rz = tx * sinY + tz * cosY;

    tx = rx;
    tz = rz;
    let cosX = cos(totalRX);
    let sinX = sin(totalRX);

    let ry  = ty * cosX - tz * sinX;
    let rz2 = ty * sinX + tz * cosX;

    ty = ry;
    tz = rz2;

    let depth = fov / (fov + tz + 300);

    let screenX = cx + tx * depth;
    let screenY = cy + ty * depth;

    return {
      p,
      screenX,
      screenY,
      tz,
      depth
    };
  });

  projected.sort((a, b) => a.tz - b.tz);

  for (let { p, screenX, screenY } of projected) {

    p.alpha = min(1, p.alpha + 0.02);

    if (exploding) {

      p.vx += random(-1.2, 1.2);
      p.vy += random(-1.2, 1.2);

      p.vx *= 0.94;
      p.vy *= 0.94;

      p.x += p.vx;
      p.y += p.vy;

    } else {

      let dx = screenX - p.x;
      let dy = screenY - p.y;

      p.vx += dx * 0.015;
      p.vy += dy * 0.015;

      p.vx *= 0.82;
      p.vy *= 0.82;

      p.x += p.vx;
      p.y += p.vy;

      // mouse interaction
      let md = dist(mouseX, mouseY, p.x, p.y);

      if (md < MOUSE_INFLUENCE && md > 0.5) {

        let angle = atan2(p.y - mouseY, p.x - mouseX);

        let speed = sqrt(mouseVX * mouseVX + mouseVY * mouseVY);

        let falloff = 1 - md / MOUSE_INFLUENCE;

        if (speed < 2.5) {

          let attract = falloff * 0.9;

          p.vx -= cos(angle) * attract;
          p.vy -= sin(angle) * attract;

        } else {

          let repulse = falloff * min(speed * 0.42, 5);

          p.vx += cos(angle) * repulse;
          p.vy += sin(angle) * repulse;
        }
      }
    }
  }
push();

blendMode(SCREEN);
noFill();

let sample =
  projected.filter((_, i) => i % 2 === 0);

for (let i = 0; i < sample.length; i++) {

  let a = sample[i];

  for (
    let j = i + 1; j < min(i + 7, sample.length);
    j++
  ) {
    let b = sample[j];
    let d =
      dist(a.p.x,a.p.y,b.p.x,b.p.y);

    if (d < 90) {

      let t =
        1 - d / 90;

      stroke(120,90,180,t * 8);
      strokeWeight(1.5);
      line(a.p.x,a.p.y,b.p.x,b.p.y);
      stroke(240,220,255,t * 32);
      strokeWeight(0.35);

      line(a.p.x, a.p.y, b.p.x, b.p.y);
    }
  }
}


noStroke();

for (let { p, depth } of projected) {

  let sz =
    p.size * depth;

  fill(  255,255,255,45);

  rect( p.x,   p.y, sz * 0.8,sz * 0.8); 
}

blendMode(BLEND);

pop();
}

  function _drawRGBShift() {
    let total = max(rgbShift, glitchLevel * 0.75);
    if (total < 0.01) return;
    push();
    blendMode(ADD);
    noStroke();
    fill(120,0,220, total*0.1);
    rect(0,0,width,height);
    for (let y=0; y<height; y+=random(5,25)) {
      fill(180,60,255, random(0,total*0.07));
      rect(0,y,width,1);
    }
    if (glitchActive) {
      for (let i=0; i<floor(glitchLevel*6); i++) {
        let gy=random(height), gw=random(width*0.15,width*0.7);
        let gc = random()<0.5 ? [255,0,180] : [0,200,255];
        fill(gc[0],gc[1],gc[2], random(0.05,0.18));
        rect(random(width-gw),gy,gw,random(1,4));
      }
    }
    blendMode(BLEND);
    pop();
  }

  function _nextStream() {
    let txt = STREAM[streamIdx % STREAM.length]; streamIdx++;
    streamChars = txt.split('').map((ch,i) => ({ ch, alpha:0, delay:i*2.5 }));
    streamTimer = 0;
  }

  function _drawTextStream() {
    streamTimer++;
    let spd = (streamGlitch||glitchActive) ? random(0.3,4) : streamSpeed;
    push();
    textSize(10); textAlign(LEFT,CENTER);
    let totalW = streamChars.length * 10;
    let startX = width/2 - totalW/2;
    for (let i=0; i<streamChars.length; i++) {
      let c = streamChars[i];
      if (streamTimer > c.delay) c.alpha = min(0.65, c.alpha + 0.04*spd);
      let ch = c.ch;
      let jx=0, jy=0;
      if ((streamGlitch||glitchActive) && random()<0.3) {
        ch = String.fromCharCode(floor(random(33,126)));
        jx = random(-3,3); jy = random(-4,4);
      }
      fill(COL.violet[0],COL.violet[1],COL.violet[2], c.alpha*0.8);
      text(ch, startX+i*10+jx+1, height-64+jy+1);
      fill(255,255,255, min(1.0, c.alpha * 1.5));
      text(ch, startX+i*10+jx, height-64+jy);
    }
    pop();
    if (streamTimer > 170) _nextStream();
  }



  function _drawMoveOnBtn() {
    btnW=130; btnH=34;
    btnX=width-28-btnW; btnY=height-28-btnH;
    btnAlpha=min(0.85, btnAlpha+0.004);
    btnHovered=(mouseX>btnX&&mouseX<btnX+btnW&&mouseY>btnY&&mouseY<btnY+btnH);
    let ba=btnAlpha;
    push();
    if (btnHovered) {
      noFill();
      for (let i=3;i>=1;i--) {
        stroke(COL.violet[0],COL.violet[1],COL.violet[2],ba*0.1*i);
        strokeWeight(i*3); rect(btnX,btnY,btnW,btnH);
      }
    }
    noFill();
    stroke(COL.violet[0],COL.violet[1],COL.violet[2],ba*(btnHovered?1.0:0.75));
    strokeWeight(0.8); rect(btnX,btnY,btnW,btnH);
    if (btnHovered) {
      fill(COL.violet[0],COL.violet[1],COL.violet[2],ba*0.1);
      noStroke(); rect(btnX,btnY,btnW,btnH);
    }
    fill(255,255,255, 1.0);
    noStroke(); textSize(11); textAlign(CENTER,CENTER);
    text('MOVE ON?  →', btnX+btnW/2, btnY+btnH/2);
    pop();
  }

  function keyPressed() {
    playKeySound();
    if (exploding) return;
    _poemIdxB   = (_poemIdx + 1) % POEM_SETS.length;
    _poemAlphaB = 0;
    _poemFading = true;
    shapeIdx++;
    mutCount++;
    exploding    = true;
    explodeTimer = 0;
    rgbShift     = 1;
    shakeX       = random(-14,14);
    shakeY       = random(-14,14);
    streamGlitch = true;
    streamSpeed  = random(0.2,3.5);
    for (let p of particles) {
      let angle = random(TWO_PI);
      let spd   = random(4, 14);
      p.vx = cos(angle)*spd;
      p.vy = sin(angle)*spd;
    }
  }

  function mousePressed() {
    if (btnHovered) { goToPage(4); return; }
    isDragging=true; lastMX=mouseX; lastMY=mouseY;
    velX=0; velY=0;
  }

  function mouseReleased() { isDragging=false; }

  function mouseDragged() {
    if (!isDragging) return;
    let dx=mouseX-lastMX, dy=mouseY-lastMY;
    velX = dy*0.007;
    velY = dx*0.007;
    dragRotX+=velX; dragRotY+=velY;
    lastMX=mouseX; lastMY=mouseY;
  }

  function mouseWheel(e) {
    let factor = 1 - e.delta * 0.0012;
    zoomTarget  = constrain(zoomTarget * factor, ZOOM_MIN, ZOOM_MAX);
    return false;
  }

  function mouseMoved() {}

  function loadOBJ(name, lines) {
    if (!lines || lines.length === 0) return;
    let raw = [];
    for (let line of lines) {
      if (!line.startsWith('v ')) continue;
      let p = line.trim().split(/\s+/);
      if (p.length < 4) continue;
      raw.push({ x: parseFloat(p[1]), y: parseFloat(p[2]), z: parseFloat(p[3]) });
    }
    if (raw.length === 0) return;

    let cx=0, cy=0, cz=0;
    for (let v of raw) { cx+=v.x; cy+=v.y; cz+=v.z; }
    cx/=raw.length; cy/=raw.length; cz/=raw.length;
    let maxR = 0;
    for (let v of raw)
      maxR = Math.max(maxR, Math.sqrt((v.x-cx)**2+(v.y-cy)**2+(v.z-cz)**2));
    if (maxR === 0) return;

    _objRegistry[name] = raw.map(v => ({
      x: (v.x - cx) / maxR,
      y: (v.y - cy) / maxR,
      z: (v.z - cz) / maxR,
    }));

    console.log('[P3] loadOBJ:', name, raw.length, 'verts');
  }

  return { setup, init, draw, keyPressed, mousePressed, mouseReleased, mouseDragged, mouseMoved, mouseWheel, loadOBJ };
})();