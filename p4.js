const P4 = (() => {

  let _imgOpen   = null;
  let _imgSealed = null;


  let letterText = '';
  let cursorBlink = 0;
  let pageAlpha   = 0;  

  
  let phase       = 'writing';
  let phaseTimer  = 0;


  let sealedY     = 0;   
  let sealedAlpha = 0;
  let crossAlpha  = 0;   
  let btnHovered  = false;
  let sealBtn     = { hov: false };  // seal button state
  let ambParts = [];


  const FONT_SZ  = 50;
  const LINE_H   = 60;    
  const MAX_CHARS = 500;

  // public
  function setAssets(imgOpen, imgSealed) {
    _imgOpen   = imgOpen   || null;
    _imgSealed = imgSealed || null;
  }

  function setup() {}

  function init() {
    letterText  = '';
    cursorBlink = 0;
    pageAlpha   = 0;
    phase       = 'writing';
    phaseTimer  = 0;
    sealedY     = 0;
    sealedAlpha = 0;
    crossAlpha  = 0;
    btnHovered  = false;
    ambParts    = [];
    for (let i = 0; i < 40; i++) _spawnAmb(true);
  }

  function draw() {
    background(8, 4, 18);
    pageAlpha = min(1, pageAlpha + 0.02);
    cursorBlink++;

    _updateAmb();

    switch (phase) {
      case 'writing':  _drawWriting(); break;
      case 'sealing':  _drawSealing(); break;
      case 'floating': _drawFloating(); break;
    }

    drawVignette();
    drawScanlines(0.015);
    drawGrain(14);
    cursor(btnHovered && phase === 'writing' ? HAND : 'default');
  }


  function _spawnAmb(ini) {
    ambParts.push({
      x: random(width), y: ini ? random(height) : height + 5,
      vx: random(-0.1,0.1), vy: random(-0.3,-0.07),
      size: random(1,2.5), alpha: random(0.15,0.45), life: random(0.5,1),
    });
  }

  function _updateAmb() {
    if (frameCount % 6 === 0) _spawnAmb(false);
    noStroke();
    for (let i = ambParts.length-1; i >= 0; i--) {
      let p = ambParts[i]; p.x+=p.vx; p.y+=p.vy; p.life-=0.002;
      if (p.life<=0||p.y<-5){ambParts.splice(i,1);continue;}
      let a = p.alpha * p.life;
      fill(COL.violet[0],COL.violet[1],COL.violet[2],a*0.2); ellipse(p.x,p.y,p.size*3);
      fill(COL.glow[0],COL.glow[1],COL.glow[2],a*0.5); ellipse(p.x,p.y,p.size);
    }
  }


  function _drawWriting() {
    let lw, lh, lx, ly;
    if (_imgOpen) {
      let ratio = _imgOpen.width / _imgOpen.height;
      lh = height * 0.82;
      lw = lh * ratio;
      if (lw > width * 0.88) { lw = width * 0.88; lh = lw / ratio; }
      lx = width/2 - lw/2;
      ly = height/2 - lh/2 - 10;
      push();
      tint(255, 255, 255, pageAlpha * 0.95);
      image(_imgOpen, lx, ly, lw, lh);
      noTint();
      pop();
    } else {
      lw = width * 0.7; lh = height * 0.78;
      lx = width/2 - lw/2; ly = height/2 - lh/2 - 10;
      push();
      fill(30, 14, 50, pageAlpha * 0.9); noStroke(); rect(lx, ly, lw, lh, 4);
      stroke(COL.violet[0],COL.violet[1],COL.violet[2],0.3); strokeWeight(0.8); noFill();
      rect(lx, ly, lw, lh, 4);
      pop();
    }

    let padX  = lw * 0.10;
    let padTop = lh * 0.12;
    let padBot = lh * 0.14;
    let textX  = lx + padX;
    let textW  = lw - padX * 2;
    let textStartY = ly + padTop;
    let textEndY   = ly + lh - padBot;
    let maxLines   = floor((textEndY - textStartY) / LINE_H);

    push();
    textSize(FONT_SZ);
    textFont('Dancing Script');
    textAlign(LEFT, TOP);

    let lines = _wrapText(letterText, textW);
    let visLines = lines.slice(0, maxLines);

    for (let i = 0; i < visLines.length; i++) {
      let ly2 = textStartY + i * LINE_H;
      fill(60, 20, 80, pageAlpha * 0.5);
      text(visLines[i], textX + 1, ly2 + 1);
      fill(40, 15, 65, pageAlpha * 0.95);
      text(visLines[i], textX, ly2);
    }

    if (floor(cursorBlink / 30) % 2 === 0) {
      let curLine  = min(visLines.length - 1, maxLines - 1);
      let lastStr  = visLines[curLine] || '';
      let curX     = textX + textWidth(lastStr);
      let curY     = textStartY + curLine * LINE_H;
      fill(80, 30, 100, pageAlpha * 0.85);
      noStroke(); rect(curX + 2, curY + 2, 1.5, FONT_SZ - 2);
    }
    pop();

    let remaining = MAX_CHARS - letterText.length;
    if (remaining < 80) {
      push();
      fill(COL.violet[0],COL.violet[1],COL.violet[2], map(remaining,0,80,0.7,0.1));
      noStroke(); textSize(7); textAlign(RIGHT, BOTTOM);
      text(remaining + ' chars left', lx+lw-16, ly+lh-8);
      pop();
    }


    _drawSealBtn(lx, ly, lw, lh);
  }

function _drawSealBtn(lx, ly, lw, lh) {

  let label = 'SEAL  &  SEND';

  push();

  textFont('Courier New');
  textSize(30);
  textAlign(CENTER, CENTER);

  let tw = textWidth(label);

  let tx = lx + lw/2;
  let ty = ly + lh - lh * 0.09;
  let padX = 40;
  let padY = 20;

  sealBtn.hov =
    mouseX > tx - tw/2 - padX &&
    mouseX < tx + tw/2 + padX &&
    mouseY > ty - padY &&
    mouseY < ty + padY;

  let ba = pageAlpha;


  if (sealBtn.hov) {
    blendMode(SCREEN);
    noStroke();
    fill( 140,90,255,ba * 0.12 );
    ellipse(tx,ty,tw + 140,70);
    blendMode(BLEND);
  }

  if (sealBtn.hov) {

    blendMode(SCREEN);
    fill( 180,140,255,ba * 0.2);
    text(label,tx,ty );

    blendMode(BLEND);
    fill(  255,245, 255,ba );

  } else {
    fill(20, 14, 28, ba * 0.9);
  }
  noStroke();
  text(label,tx, ty);
  stroke(
    sealBtn.hov
      ? color(255, 245, 255, ba * 0.9)
      : color(20, 14, 28, ba * 0.4)
  );

  strokeWeight(
    sealBtn.hov ? 1 : 0.7
  );

  line(  tx - tw/2,ty + 18, tx + tw/2,  ty + 18);

  pop();
}


  function _drawSealing() {
    phaseTimer++;
    crossAlpha = min(1, crossAlpha + 0.025);

    let lw, lh, lx, ly;
    _getLetterBounds(out => { lw=out.lw; lh=out.lh; lx=out.lx; ly=out.ly; });
    if (_imgOpen) {
      push();
      tint(255,255,255, (1 - crossAlpha) * 0.95);
      image(_imgOpen, lx, ly, lw, lh);
      noTint();
      pop();
    }
    if (_imgSealed) {
      push();
      tint(255,255,255, crossAlpha * 0.95);
      image(_imgSealed, lx, ly, lw, lh);
      noTint();
      pop();
    }

    if (crossAlpha >= 1 && phaseTimer > 40) {
      phase = 'floating';
      phaseTimer = 0;
      sealedY = 0;
      sealedAlpha = 1;
    }
  }

  function _drawFloating() {
    phaseTimer++;
    sealedY    -= 0.8;
    sealedAlpha = max(0, sealedAlpha - 0.008);

    let lw, lh, lx, ly;
    _getLetterBounds(out => { lw=out.lw; lh=out.lh; lx=out.lx; ly=out.ly; });

    if (_imgSealed) {
      push();
      tint(255,255,255, sealedAlpha * 0.95);
      image(_imgSealed, lx, ly + sealedY, lw, lh);
      noTint();
      pop();
    }
    if (phaseTimer < 60) {
      noStroke();
      for (let i=0; i<3; i++) {
        let px = lx + random(lw);
        let py = ly + sealedY + random(lh*0.3, lh*0.7);
        fill(COL.glow[0],COL.glow[1],COL.glow[2], random(0.1,0.4));
        ellipse(px, py, random(2,6));
      }
    }
    if (phaseTimer > 40) {
      let ta = map(phaseTimer, 40, 80, 0, 0.5);
      push();
      fill(COL.violet[0],COL.violet[1],COL.violet[2], ta);
      noStroke(); textSize(9); textFont('Courier New'); textAlign(CENTER,CENTER);
      text('r e t u r n i n g . . .', width/2, height/2 + lh*0.55);
      pop();
    }

    if (sealedAlpha <= 0 || phaseTimer > 130) {
      goToPage(1);
    }
  }



  function _getLetterBounds(cb) {
    let lw, lh, lx, ly;
    let img = _imgOpen || _imgSealed;
    if (img) {
      let ratio = img.width / img.height;
      lh = height * 0.82;
      lw = lh * ratio;
      if (lw > width * 0.88) { lw = width * 0.88; lh = lw / ratio; }
    } else {
      lw = width * 0.7; lh = height * 0.78;
    }
    lx = width/2 - lw/2;
    ly = height/2 - lh/2 - 10;
    cb({lw,lh,lx,ly});
  }

  function _wrapText(txt, maxW) {
    if (!txt || txt.length === 0) return [''];
    let lines = [];
    let rawLines = txt.split('\n');
    push();
    textSize(FONT_SZ);
    textFont('Dancing Script');
    for (let raw of rawLines) {
      if (raw.length === 0) { lines.push(''); continue; }
      let cur = '';
      for (let ch of raw) {
        let test = cur + ch;
        if (textWidth(test) > maxW && cur.length > 0) {
          let lastSpace = cur.lastIndexOf(' ');
          if (lastSpace > 0) {
            lines.push(cur.slice(0, lastSpace));
            cur = cur.slice(lastSpace + 1) + ch;
          } else {
            lines.push(cur);
            cur = ch;
          }
        } else {
          cur = test;
        }
      }
      lines.push(cur);
    }
    pop();
    return lines.length ? lines : [''];
  }

  function keyPressed() {
    if (phase !== 'writing') return false;
    playTick();
    if (key === 'Backspace') {
      letterText = letterText.slice(0, -1);
      return false;
    }
    if (key === 'Enter') {
      if (letterText.length < MAX_CHARS) letterText += '\n';
      return false;
    }
    if (key.length === 1 && letterText.length < MAX_CHARS) {
      letterText += key;
    }
    return false;
  }

  function mousePressed() {
    if (phase !== 'writing') return;
    if (!sealBtn.hov) return;
    phase = 'sealing';
    phaseTimer = 0;
    crossAlpha = 0;
  }

  return { setup, init, draw, keyPressed, mousePressed, setAssets };
})();