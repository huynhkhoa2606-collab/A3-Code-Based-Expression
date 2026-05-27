const P1 = (() => {

  let uiAlpha  = 0;
  let btnHovered = false;
  let btnX, btnY, btnW, btnH;

  function setup() { init(); }

  function init() {
    uiAlpha    = 0;
    btnHovered = false;
  }

  function draw() {
    uiAlpha = min(1, uiAlpha + 0.012);
    _drawUI();
    drawVignette();
    drawScanlines();
    cursor(btnHovered ? HAND : 'default');
  }

  function _drawUI() {
    btnW = 160; btnH = 42;
    btnX = width / 2 - btnW / 2;
    btnY = height / 2 + 60;

    btnHovered = (mouseX > btnX && mouseX < btnX + btnW &&
                  mouseY > btnY && mouseY < btnY + btnH);

    let a = uiAlpha;
    push();

    
    if (btnHovered) {
      noFill();
      for (let i = 4; i >= 1; i--) {
        stroke(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.10 * i);
        strokeWeight(i * 4);
        rect(btnX, btnY, btnW, btnH);
      }
    }
    noFill();
  stroke(COL.deepPurple[0], COL.deepPurple[1], COL.deepPurple[2], a * (btnHovered ? 0.95 : 0.55));
    strokeWeight(1);
    rect(btnX, btnY, btnW, btnH);
    if (btnHovered) {
      fill(COL.violet[0], COL.violet[1], COL.violet[2], a * 0.15);
      noStroke();
      rect(btnX, btnY, btnW, btnH);
    }

    // chữ
    fill(COL.white[0], COL.white[1], COL.white[2], a * (btnHovered ? 1 : 0.80));
    noStroke();
    textSize(12); textAlign(CENTER, CENTER); textStyle(NORMAL);
    text('E N T E R', width / 2, btnY + btnH / 2);

    pop();
  }

  function mousePressed() {
    if (btnHovered) goToPage(2);
  }

  return { setup, init, draw, mousePressed };
})();