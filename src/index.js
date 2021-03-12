/* global document, window */
import * as physics from './physics';
import * as edsLIB from './edsLIB';
import * as loadBar from './loadBar';

let canvas;
let ctx;
let blockType = 1;// current type of block on click placed

const width = 640;// canvas height and width
const height = 480;
const rows = height / 5;
const cols = width / 5;

let basetime = Date.now();
const fpsCap = 1000 / 60;// denominator is fps

let play = true;

// core drive functions aka update/draw
function update() {
  const now = Date.now();
  const check = now - basetime;
  if (check / fpsCap >= 1) {
    basetime = now;
    if (play) {
      edsLIB.cls(ctx, width, height);
      physics.physics();
      edsLIB.draw(ctx, cols, rows, physics.GetBlocks());
    }
  }
  window.requestAnimationFrame(update);
}

// click and drag functionality
let timer;// time id for click and hold
let xClient = 0;
let yClient = 0;
function addBlocks(e) {
  if (play) {
    const blocks = physics.GetBlocks();
    const rect = canvas.getBoundingClientRect();
    const centerX = Math.round((xClient - rect.left) / 5) * 5;
    const centerY = Math.round((yClient - rect.top) / 5) * 5;
    for (let c = -1; c < edsLIB.GetPenSize(); c++) {
      for (let a = -1; a < edsLIB.GetPenSize(); a++) {
        if (centerX + (c * 5) < 640 && centerX + (c * 5) >= 0) {
          blocks[((centerX + (c * 5)) / 5) + (((centerY + (a * 5)) / 5)) * cols] = blockType;
        }
      }
    }
  }
  // console.log(x+","+y);
  timer = setTimeout(() => { addBlocks(e); }, 0);
}
function mouseMove(e) {
  xClient = e.clientX;
  yClient = e.clientY;
}
function mouseClick() {
  clearTimeout(timer);
}

// setup button events
function setupUI() {
  // block section
  document.querySelector('#Void').onclick = function Void() {
    blockType = 0;
  };
  document.querySelector('#Sand').onclick = function Sand() {
    blockType = 1;
  };
  document.querySelector('#Water').onclick = function Water() {
    blockType = 2;
  };
  document.querySelector('#Salt').onclick = function Salt() {
    blockType = 3;
  };
  document.querySelector('#Smoke').onclick = function Smoke() {
    blockType = 4;
  };
  document.querySelector('#Wall').onclick = function Wall() {
    blockType = 5;
  };
  document.querySelector('#SaltWater').onclick = function SaltWater() {
    blockType = 6;
  };
  document.querySelector('#Oil').onclick = function Oil() {
    blockType = 7;
  };
  document.querySelector('#Acid').onclick = function Acid() {
    blockType = 8;
  };
  document.querySelector('#Mercury').onclick = function Mercury() {
    blockType = 9;
  };
  document.querySelector('#Fire').onclick = function Fire() {
    blockType = 10;
  };

  // slider section
  document.querySelector('#gravitySpeed').oninput = function GravitySpeed() {
    edsLIB.SetGravity(this.value);
  };
  document.querySelector('#flowChance').oninput = function FlowChance() {
    edsLIB.SetFlowChance(this.value);
  };
  document.querySelector('#flowSpeed').oninput = function FlowSpeed() {
    edsLIB.SetSlideSpeed(this.value);
  };
  document.querySelector('#penSize').oninput = function PenSize() {
    edsLIB.SetPenSize(this.value);
  };
  // other
  document.querySelector('#Reset').onclick = function Reset() {
    physics.WipeBlocks();
    edsLIB.cls(ctx, width, height);
  };
  document.querySelector('#PausePlay').onclick = function PausePlay() {
    play = !play;
  };
}

// intialize/////////////////////////////////////////////////////////////////////////////
const init = () => {
  // #2 Now that the page has loaded, start drawing!
  console.log('init called');

  // A - canvas variable points at <canvas> tag
  canvas = document.querySelector('canvas');
  canvas.height = height;
  canvas.width = width;
  // B - the ctx variable points at a "2D drawing context"
  ctx = canvas.getContext('2d');

  // event listeners
  canvas.addEventListener('mousedown', addBlocks, false);
  canvas.addEventListener('click', mouseClick, false);
  canvas.addEventListener('mouseleave', mouseClick, false);
  canvas.addEventListener('mousemove', mouseMove, false);

  edsLIB.cls(ctx, width, height);
  setupUI();
  loadBar.xhrInit();
  loadBar.hiddenCanvasInit();
  update(ctx);
};

export { init as default };
