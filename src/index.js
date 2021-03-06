(function () {
  let canvas;
  let ctx;
  let blockType = 1;// current type of block on click placed
  let penSize = 2;

  // a values aka speed values
  let gravitySpeed = 1;// constant vel going downward
  const slideSpeed = 1;// constant vel going downward
  const risingSpeed = 1;// amount gas is allowed to rise upward per frame
  let flowSpeed = 1;// current flow speed of water
  let flowChance = 1;

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
    requestAnimationFrame(update);
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
      for (let c = -1; c < penSize; c++) {
        for (let a = -1; a < penSize; a++) {
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
  function mouseClick(e) {
    clearTimeout(timer);
  }

  // setup button events
  function setupUI() {
    // block section
    document.querySelector('#Void').onclick = function () {
      blockType = 0;
    };
    document.querySelector('#Sand').onclick = function () {
      blockType = 1;
    };
    document.querySelector('#Water').onclick = function () {
      blockType = 2;
    };
    document.querySelector('#Salt').onclick = function () {
      blockType = 3;
    };
    document.querySelector('#Smoke').onclick = function () {
      blockType = 4;
    };
    document.querySelector('#Wall').onclick = function () {
      blockType = 5;
    };
    document.querySelector('#SaltWater').onclick = function () {
      blockType = 6;
    };
    document.querySelector('#Oil').onclick = function () {
      blockType = 7;
    };
    document.querySelector('#Acid').onclick = function () {
      blockType = 8;
    };
    document.querySelector('#Mercury').onclick = function () {
      blockType = 9;
    };
    document.querySelector('#Fire').onclick = function () {
      blockType = 10;
    };

    // slider section
    document.querySelector('#gravitySpeed').oninput = function () {
      gravitySpeed = this.value;
    };
    document.querySelector('#flowChance').oninput = function () {
      flowChance = this.value;
    };
    document.querySelector('#flowSpeed').oninput = function () {
      flowSpeed = this.value;
    };
    document.querySelector('#penSize').oninput = function () {
      penSize = this.value;
    };
    // other
    document.querySelector('#Reset').onclick = function () {
      physics.WipeBlocks();
      edsLIB.cls(ctx, width, height);
    };
    document.querySelector('#PausePlay').onclick = function () {
      play = !play;
    };
  }

  // speed getters//////////////////////////
  function GetGravity() {
    return gravitySpeed;
  }

  function GetSlide() {
    return slideSpeed;
  }

  function GetFlowSpeed() {
    return flowSpeed;
  }

  function GetRising() {
    return risingSpeed;
  }

  function GetFlowChance() {
    return flowChance;
  }
  ///////////////////////////////////////////////////////////////////////////////////
  //xhr stuff////////////////////////////////////////////////////////////////////////
  const handleResponse = (xhr, parseResponse) => {
      
      switch(xhr.status)
      {
        case 200:
          console.log('Success!');
          break;
        case 201:
          console.log('Created!');
          break;
        case 204:
          console.log('Updated No Content!');
        break;
        case 400:
          console.log('Bad Request :(!');
          break;
        case 404:
          console.log('Resource Not Found!');
          break;
        default:
          console.log('Error code not implemented by client!');
          break;
      }

      if(parseResponse){
        const obj=JSON.parse(xhr.response);
        //console.dir(obj);
        //console.log(`${xhr.response}`);
        gravitySpeed=2;
        gravitySpeed=obj.data.gravitySpeed
        flowChance=obj.data.flowChance;
        flowSpeed=obj.data.flowSpeed;
        penSize=obj.data.penSize;
        let newBlocks=Uint8Array.from(obj.data.blocks.split(","));
        physics.SetBlocks(newBlocks);
      }else
      {
        console.log(`Meta Data Received`);
      }
  };

  const requestUpdate = (e, userForm) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/loadmap');

    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = () => handleResponse(xhr, true);

    xhr.send();
    e.preventDefault();
    return false;
  };

  const sendPost = (e) => {
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/savestate');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = () => handleResponse(xhr);

    const formData = `gravitySpeed=${gravitySpeed}&flowSpeed=${flowSpeed}&flowChance=${flowChance}&penSize=${penSize}&blocks=${physics.GetBlocks()}`;// all data needed to be saved goes here
    xhr.send(formData);

    return false;
  };

  const xhrInit = () => {
    // intializes save button functionality
    const saveButton = document.querySelector('#Save');
    const addSave = (e) => sendPost(e);
    saveButton.addEventListener('click', addSave);

    //load button functionality
    const loadButton = document.querySelector('#Load');
    const loadSave = (e) => requestUpdate(e);
    loadButton.addEventListener('click', loadSave);
  };

  // intialize/////////////////////////////////////////////////////////////////////////////
  function init() {
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
    xhrInit();
    update(ctx);
  }
  window.onload = init;

  window.index = {
    GetGravity, GetSlide, GetFlowSpeed, GetFlowChance, GetRising,
  };
}());
