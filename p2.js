const P2 = (() => {

  const CONVERSATIONS = [
    [
      { text: "Wake up, it's time to get up.",                   side: 'left'  },
      { text: " Five more minutes, pleaseee.",                   side: 'right' },
      { text: "Okay then, I'll let you sleep a bit longer.",     side: 'left'  },
      { text: "Thank you, Grandpa.",                             side: 'right' },
      { text: "Remember to wake up or i'll be late.",            side: 'left'  },
      { text: "YES, I will.",                                    side: 'right' },
    ],
    
    [
      { text: "Let's watch football.",                        side: 'left'  },
      { text: "But its time too late, my mom will be mad.",   side: 'right' },
      { text: "Don't worry, I won't tell her.",               side: 'left'  },
      { text: "yay, I also want some food ",                  side: 'right' },
      { text: "popcorn and sausages?",                        side: 'left'  },
      { text: "Yes pleaseee",                                 side: 'right' },
    ],
   
    [
      { text: "Come down, the meal is ready.",       side: 'left'  },
      { text: "I'm coming.",                         side: 'right' },
      { text: "i cook for you a lot of food.",       side: 'left'  },
      { text: "yayyy",                               side: 'right' },
      { text: "You like it?",                        side: 'left'  },
      { text: "I always do.",                        side: 'right' },
    ],
   
    [
      { text: "I heard you like taking photos.",             side: 'left'  },
      { text: "Yes but i dont have my own camera.",          side: 'right' },
      { text: "Don't worry, I'll give you my camera.",       side: 'left'  },
      { text: "Is it real?",                                 side: 'right' },
      { text: "Yes, tomorrow i'll teach you how to use it.", side: 'left'  },
      { text: "yayyyy",                                      side: 'right' },
    ],
    
    [
    
      { text: "Can i have a bottle of iced tea, please?",  side: 'right' },
      { text: "Let me make you some.",                     side: 'left'  },
      { text: "thank you, granny",                         side: 'right' },
      { text: "The tea is ready.",                         side: 'left'  },
      { text: "yay, its always good!",                     side: 'right' },
    ],
  ];

  const OBJ_DEFS = [
    { label: 'TEA',    id: 0 },
    { label: 'CLOCK',  id: 1 },
    { label: 'CAMERA', id: 2 },
    { label: 'TV',     id: 3 },
    { label: 'MEMORY', id: 4 },
  ];

  const OBJ_CAPTIONS = [
    '...the clock\nwas always\nreminding me of you...',
    'All the tv shows\nand football games\nwe watch together...',
    'Every meals \nI had with  you...\n',
    'You and I\n always tried to capture\n every moment...',
    'Tea\ntastes better\nwhen you make it...',
  ];

  let _bgImg   = null;
  let _objImgs = [null, null, null, null, null];

  let objects       = [];
  let collected     = 0;
  let dialogue      = null;
  let roomShake     = 0;
  let completing    = false;
  let completeTimer = 0;
  let floorParticles = [];

  let _startFrame = 0;
  let _leaveBtn = { x:0, y:0, w:148, h:32, hov:false, alpha:0 };

  function setAssets(bgImg, objImgArr) {
    _bgImg   = bgImg    || null;
    _objImgs = objImgArr || [null, null, null, null];
  }

  function setup() {}

  function init() {
    collected = 0; dialogue = null;
    roomShake = 0; completing = false; completeTimer = 0;
    objects = []; floorParticles = [];
    _startFrame = frameCount;
    _leaveBtn.alpha = 0;
    for (let i = 0; i < 50; i++) _spawnFloor(true);
    _placeObjects();
  }

  function _placeObjects() {
    let positions = [
      { x: width * 0.19, y: height * 0.30, w: 200, h: 200 },
      { x: width * 0.73, y: height * 0.22, w: 200, h: 200 },
      { x: width * 0.50, y: height * 0.50, w: 190, h: 190 },
      { x: width * 0.20, y: height * 0.72, w: 210, h: 210 },
      { x: width * 0.80, y: height * 0.70, w: 160, h: 160 },
    ];
    for (let i = 0; i < 5; i++) {
      objects.push({
        ...OBJ_DEFS[i],
        x: positions[i].x,
        y: positions[i].y,
        baseY: positions[i].y,
        alive:      true,
        alpha:      0,
        brightness: 0.78,
        hovered:    false,
        floatT:     random(TWO_PI),
        dissolving: false,
        dissolveT:  0,
        displayW:   positions[i].w,
        displayH:   positions[i].h,
        captionAlpha: 0,
        hoverGlow: 0,
        sparkles: Array.from({ length: 10 }, () => ({
          angle: random(TWO_PI),
          dist:  random(70, 145),
          speed: random(0.008, 0.025) * (random() < 0.5 ? 1 : -1),
          size:  random(1.5, 3.5),
          alpha: random(0.4, 0.85),
        })),
      });
    }
  }


  function draw() {
    let sx = completing ? random(-roomShake, roomShake) : 0;
    let sy = completing ? random(-roomShake, roomShake) : 0;

    _drawBg();
    _drawFlashlight();

    push(); translate(sx, sy);
    _drawFloorParticles();
    _drawObjects();
    _drawDialogue();
    pop();

    if (completing) _handleCompletion();

    drawVignette();
    drawScanlines(0.018);
    drawGrain(completing ? 70 : 16);

    _drawHUD();
  }


  function _drawHUD() {
    let a = 0.72;
    _corners(a * 0.55);

    push();
    fill(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.85);
    noStroke(); textSize(13); textAlign(LEFT, TOP);
    text('MEMORY ARCHIVE  ■', 28, 20);
    fill(255,255,255, a * 0.42);
    textSize(11);
    text('STATUS: ' + (completing ? 'COMPLETE' : collected > 0 ? 'TRACING' : 'EXPLORING'), 28, 40);
    text('---', 28, 56);
    pop();


  
    push();
    let elapsed = (frameCount - _startFrame) / 60;
    let mm = floor(elapsed / 60);
    let ss = floor(elapsed % 60);
    let ms = floor((elapsed % 1) * 100);
    let timeStr = nf(mm,2) + ':' + nf(ss,2) + ':' + nf(ms,2);
    noStroke(); textSize(13); textAlign(RIGHT, TOP);
    fill(255,255,255, a * 0.55);
    textSize(11);
    text(timeStr + '  ■', width - 28, 25);
    pop();

    push();
    fill(255,255,255, a * 0.45);
    noStroke(); textSize(11); textAlign(LEFT, BOTTOM);
    text('MEMORIES FOUND: ' + collected + ' / 5', 28, height - 25);
    pop();
  }

  function _corners(a) {
    let t    = frameCount * 0.022;
    let len  = 22 + sin(t) * 4;
    let th   = 0.6 + sin(t * 0.7) * 0.25;
    let glow = a * (0.55 + sin(t * 1.1) * 0.18);

    push(); noFill(); let m = 16;

    stroke(COL.violet[0], COL.violet[1], COL.violet[2], glow * 0.35);
    strokeWeight(th + 1.6);
    line(m, m, m+len+2, m); line(m, m, m, m+len+2);
    line(width-m, m, width-m-len-2, m); line(width-m, m, width-m, m+len+2);
    line(m, height-m, m+len+2, height-m); line(m, height-m, m, height-m-len-2);
    line(width-m, height-m, width-m-len-2, height-m); line(width-m, height-m, width-m, height-m-len-2);

    stroke(COL.violet[0], COL.violet[1], COL.violet[2], glow);
    strokeWeight(th);
    line(m, m, m+len, m); line(m, m, m, m+len);
    line(width-m, m, width-m-len, m); line(width-m, m, width-m, m+len);
    line(m, height-m, m+len, height-m); line(m, height-m, m, height-m-len);
    line(width-m, height-m, width-m-len, height-m); line(width-m, height-m, width-m, height-m-len);

    let dotA = glow * (0.5 + sin(t * 1.4 + PI) * 0.4);
    fill(COL.violet[0], COL.violet[1], COL.violet[2], dotA); noStroke();
    ellipse(m, m, 3); ellipse(width-m, m, 3);
    ellipse(m, height-m, 3); ellipse(width-m, height-m, 3);
    pop();
  }

  function _drawBg() {
    background(6, 3, 14);
    if (_bgImg) {
      let s  = max(width / _bgImg.width, height / _bgImg.height) * 1.1;
      let dw = _bgImg.width * s, dh = _bgImg.height * s;
      let dx = (width - dw) / 2, dy = (height - dh) / 2;
      push(); tint(255, 255, 255, 0.45); 
      imageMode(CORNER);
    image(_bgImg, dx, dy, dw, dh);
      image(_bgImg, dx, dy, dw, dh); noTint(); pop();
    }
    noStroke(); fill(0, 0, 0, 0.55); rect(0, 0, width, height);
    let g = drawingContext;
    let gr = g.createRadialGradient(width/2, height*0.4, 0, width/2, height*0.4, height*0.6);
    gr.addColorStop(0, 'rgba(60,15,120,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, width, height);
  }

  function _spawnFloor(ini) {
    floorParticles.push({
      x: random(width), y: ini ? random(height * 0.6, height) : height + 5,
      vx: random(-0.1, 0.1), vy: random(-0.22, -0.06),
      size: random(1, 2.5), alpha: random(0.1, 0.4), life: random(0.5, 1),
    });
  }

  function _drawFloorParticles() {
    if (frameCount % 6 === 0) _spawnFloor(false);
    noStroke();
    for (let i = floorParticles.length - 1; i >= 0; i--) {
      let p = floorParticles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.0018;
      if (p.life <= 0 || p.y < height * 0.3) { floorParticles.splice(i, 1); continue; }
      let a = p.alpha * p.life;
      fill(COL.violet[0],COL.violet[1],COL.violet[2], a * 0.18); ellipse(p.x, p.y, p.size * 2.5);
      fill(COL.glow[0],COL.glow[1],COL.glow[2], a * 0.45); ellipse(p.x, p.y, p.size);
    }
  }

  function _drawFlashlight() {
    let g = drawingContext;
    let radius = 220;
    let grad = g.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, radius);
    grad.addColorStop(0,    'rgba(0,0,0,0)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.04)');
    grad.addColorStop(0.78, 'rgba(0,0,0,0.45)');
    grad.addColorStop(1,    'rgba(0,0,0,0.68)');
    g.fillStyle = grad; g.fillRect(0, 0, width, height);
  }

  function _drawObjectAura(obj, oy) {
    obj.hoverGlow = lerp(obj.hoverGlow, obj.hovered ? 1.0 : 0.0, 0.055);

    let g = drawingContext;
    let basePulse = 0.22 + sin(obj.floatT * 0.65) * 0.05;
    let pulse = basePulse + obj.hoverGlow * 0.13;
    let glowR = (obj.displayW * 0.95 + sin(obj.floatT * 0.45) * 14)
                * (1 + obj.hoverGlow * 0.22);

    let grad = g.createRadialGradient(obj.x, oy, 0, obj.x, oy, glowR);
    grad.addColorStop(0,    `rgba(170,90,255,${pulse * obj.alpha})`);
    grad.addColorStop(0.18, `rgba(140,60,235,${pulse * 0.75 * obj.alpha})`);
    grad.addColorStop(0.42, `rgba(110,35,200,${pulse * 0.38 * obj.alpha})`);
    grad.addColorStop(0.70, `rgba(70,15,140,${pulse * 0.12 * obj.alpha})`);
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(obj.x - glowR, oy - glowR, glowR * 2, glowR * 2);

    if (obj.hoverGlow > 0.01) {
      let br = obj.displayW * (0.48 + obj.hoverGlow * 0.18);
      let grad2 = g.createRadialGradient(obj.x, oy, br * 0.25, obj.x, oy, br);
      grad2.addColorStop(0,    `rgba(210,140,255,0)`);
      grad2.addColorStop(0.4,  `rgba(190,110,255,${0.07 * obj.hoverGlow * obj.alpha})`);
      grad2.addColorStop(0.75, `rgba(150,70,230,${0.04 * obj.hoverGlow * obj.alpha})`);
      grad2.addColorStop(1,    'rgba(0,0,0,0)');
      g.fillStyle = grad2;
      g.fillRect(obj.x - br, oy - br, br * 2, br * 2);
    }
  }

  function _drawSparkles(obj, oy) {
    noStroke();
    for (let s of obj.sparkles) {
      s.angle += s.speed * (obj.hovered ? 1.6 : 1.0);
      let sx = obj.x + cos(s.angle) * s.dist;
      let sy = oy  + sin(s.angle) * s.dist * 0.52;
      let twink = 0.55 + sin(s.angle * 2.8 + obj.floatT * 1.3) * 0.45;
      let a = s.alpha * twink * obj.alpha;
      fill(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.2);
      ellipse(sx, sy, s.size * 4.5);
      fill(COL.glow[0], COL.glow[1], COL.glow[2], a * 0.45);
      ellipse(sx, sy, s.size * 2.2);
      fill(255, 255, 255, a * 0.85);
      ellipse(sx, sy, s.size * 0.7);
    }
  }

  function _drawObjects() {
    let anyCursor = false;
    for (let obj of objects) {
      if (!obj.alive && !obj.dissolving) continue;
      obj.alpha  = min(1, obj.alpha + 0.012);
      obj.floatT += 0.018;
      let oy = obj.baseY + sin(obj.floatT) * 7;
      let hw = obj.displayW / 2 + 18, hh = obj.displayH / 2 + 18;
      obj.hovered = (mouseX > obj.x - hw && mouseX < obj.x + hw &&
                     mouseY > oy - hh    && mouseY < oy + hh);
      if (obj.hovered) anyCursor = true;
      if (obj.dissolving) { _drawDissolve(obj); continue; }

      _drawObjectAura(obj, oy);
      _drawSparkles(obj, oy);

      let targetBright = obj.hovered ? 1.0 : 0.82;
      obj.brightness = lerp(obj.brightness, targetBright, 0.07);

      let img = _objImgs[obj.id];
      if (img) {
        push(); imageMode(CENTER);
        tint(20, 10, 35, floor(obj.alpha * 70));
        image(img, obj.x + 2, oy + 2, obj.displayW, obj.displayH);
        tint(255, 255, 255, floor(obj.brightness * obj.alpha * 235));
        image(img, obj.x, oy, obj.displayW, obj.displayH);
        noTint(); pop();
      }

      let captionTarget = obj.hovered ? 0.85 : 0.45;
      obj.captionAlpha = lerp(obj.captionAlpha, captionTarget * obj.alpha, 0.04);

      if (obj.captionAlpha > 0.01) {
        push();
        let align = obj.x < width / 2 ? RIGHT : LEFT;
        let cx2   = obj.x < width / 2
          ? obj.x - obj.displayW / 2 - 12
          : obj.x + obj.displayW / 2 + 12;
        fill(COL.violet[0], COL.violet[1], COL.violet[2], obj.captionAlpha * 0.35);
        textSize(11); textAlign(align, TOP);
        text(OBJ_CAPTIONS[obj.id], cx2 + 1, oy - 22 + 1);
        fill(255, 255, 255, obj.captionAlpha * 0.88);
        textSize(9);
        text(OBJ_CAPTIONS[obj.id], cx2, oy - 22);
        fill(COL.violet[0], COL.violet[1], COL.violet[2], obj.captionAlpha * 0.7);
        noStroke();
        let dotX = obj.x < width/2 ? cx2 + 5 : cx2 - 5;
        ellipse(dotX, oy - 14, 3.5, 3.5);
        pop();
      }
    }
    cursor(anyCursor ? HAND : 'default');
  }

  function _drawDissolve(obj) {
    obj.dissolveT += 0.05;
    let t = obj.dissolveT;
    push(); noStroke();
    let n = floor(map(t, 0, 1, 18, 0));
    for (let i = 0; i < n; i++) {
      let angle = random(TWO_PI);
      let d = t * random(40, 120);
      let px = obj.x + cos(angle) * d;
      let py = obj.baseY + sin(angle) * d * 0.6;
      let a  = (1 - t) * random(0.4, 0.9);
      fill(COL.violet[0],COL.violet[1],COL.violet[2], a * 0.3); ellipse(px, py, random(6, 14));
      fill(COL.glow[0],COL.glow[1],COL.glow[2], a); ellipse(px, py, random(2, 5));
    }
    pop();
    if (t >= 1) obj.dissolving = false;
  }


  function _drawDialogue() {
    if (!dialogue) return;
    dialogue.timer++;

    let t          = dialogue.timer;
    let charDelay  = 3;    
    let linePause  = 18;   
    let holdTime   = 50;  
    let totalLines = dialogue.lines.length;
    let lineStarts = [];
    let cursor = 0;
    for (let i = 0; i < totalLines; i++) {
      lineStarts[i] = cursor;
      cursor += dialogue.lines[i].text.length * charDelay + linePause;
    }

    let allDoneAt = cursor;                    
    let fadeStart = allDoneAt + holdTime;
    let fadeEnd   = fadeStart + 60;

    if (t > fadeEnd) {
  if (dialogue._triggerComplete) completing = true;
  dialogue = null;
  return;
}

   
    let overlayA = min(0.88, t / 25 * 0.88);
    if (t > fadeStart) overlayA *= 1 - (t - fadeStart) / 60;
    push();
    fill(0, 0, 0, overlayA); noStroke(); rect(0, 0, width, height);
    pop();


    let lineH  = 44;
    let baseY  = height / 2 - (totalLines * lineH) / 2;
    let margin = width * 0.12;

    for (let i = 0; i < totalLines; i++) {
      let ln       = dialogue.lines[i];
      let lineT    = t - lineStarts[i];  
      if (lineT <= 0) continue;

      let charsVisible = min(ln.text.length, floor(lineT / charDelay));
      let prevChars = floor((lineT - 1) / charDelay);
     if (charsVisible > prevChars && charsVisible <= ln.text.length) {
    playTick();
    }
      let visibleText  = ln.text.substring(0, charsVisible);
      let isTyping     = charsVisible < ln.text.length;

    
      let showCursor   = isTyping && (floor(frameCount / 8) % 2 === 0);

      let slideProgress = min(1, lineT / 18);
      let eased         = 1 - pow(1 - slideProgress, 3);
      let targetX = ln.side === 'left'  ? margin        : width - margin;
      let startX  = ln.side === 'left'  ? -width * 0.18 : width * 1.18;
      let cx      = startX + (targetX - startX) * eased;

      let lineA = min(1, lineT / 10);
      if (t > fadeStart) lineA *= 1 - (t - fadeStart) / 60;

      let align = ln.side === 'left' ? LEFT : RIGHT;

      push();
      textSize(20); textAlign(align, CENTER);

      fill(COL.violet[0], COL.violet[1], COL.violet[2], lineA * 0.30);
      text(visibleText, cx + 1, baseY + i * lineH + 1);

      fill(255, 255, 255, lineA * 1.5);
      text(visibleText, cx, baseY + i * lineH);

      if (showCursor) {
        let cursorOffsetX;
        if (ln.side === 'left') {
          cursorOffsetX = cx + textWidth(visibleText) + 3;
        } else {
          cursorOffsetX = cx - textWidth(visibleText) - 3;
        }
        fill(COL.violet[0], COL.violet[1], COL.violet[2], lineA * 0.85);
        textAlign(LEFT, CENTER);
        text('|', cursorOffsetX, baseY + i * lineH);
      }
      if (!isTyping) {
        let dotX = ln.side === 'left' ? cx - 14 : cx + 14;
        fill(COL.violet[0], COL.violet[1], COL.violet[2], lineA * 0.65);
        noStroke(); ellipse(dotX, baseY + i * lineH, 4, 4);
      }
      pop();
    }
  }

  function _handleCompletion() {
    completeTimer++;
    roomShake = min(8, roomShake + 0.06);
    if (completeTimer > 110) goToPage(3);
  }

  function mousePressed() {
    if (completing) return;
    for (let obj of objects) {
      if (obj.alive && obj.hovered) {
        obj.alive = false; obj.dissolving = true; obj.dissolveT = 0;
        playClickSound();
        collected++;
        let conv = CONVERSATIONS[obj.id] || CONVERSATIONS[0];
        dialogue = {
          lines: conv.map(l => ({ ...l })),
          timer: 0,
        };
      if (collected >= 5) dialogue._triggerComplete = true;
        break;
      }
    }
  }

  return { setup, init, draw, mousePressed, setAssets };
})();