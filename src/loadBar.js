// holds xhr and server related update functions
/* global document, XMLHttpRequest,window */
import * as edsLIB from './edsLIB';
import * as physics from './physics';

const hiddenCanvas = document.querySelector('#hiddenCanvas');
const width = 640;// canvas height and width
const height = 480;
const rows = height / 5;
const cols = width / 5;
let hiddenCtx;

// loadmenuBar
let loadmenuBar;// just html element

// checks if there is data to be loaded
const xhrUpdated = 0;// compared to size of save array from GET request

// function declarations so eslint isn't worried
let handleResponse; let handleBlocks;

// basic intializa
const hiddenCanvasInit = () => {
  hiddenCtx = hiddenCanvas.getContext('2d');
  hiddenCanvas.width = width;
  hiddenCanvas.height = height;
  loadmenuBar = document.querySelector('#LoadMenu');
};

// combined code for even based and non-event based get requests
const xhrGET = (e, path, data) => {
  const xhr = new XMLHttpRequest();
  let newData = data;
  if (!newData) {
    newData = '';
  }
  xhr.open('GET', path + newData);

  xhr.setRequestHeader('Accept', 'application/json');
  if (!e && newData) {
    xhr.onload = () => handleBlocks(xhr);// non event based need blocks
  } else {
    xhr.onload = () => handleResponse(xhr, true);// event based
  }
  xhr.send();
};
// event based request format
const requestUpdate = (e, path, data) => {
  xhrGET(e, path, data);
  e.preventDefault();
  return false;
};

const loadDataInitButton = (currentID, blocks) => {
  // clear the canvas
  edsLIB.cls(hiddenCtx, width, height);
  if (blocks) {
    // draw on canvas using blocks put in
    edsLIB.draw(hiddenCtx, cols, rows, blocks);
  } else {
    // recent save so drawn using the current canvas blocks(avoids unessarry get request)
    edsLIB.draw(hiddenCtx, cols, rows, physics.GetBlocks());
  }
  // turn data into a img and add it to the page
  loadmenuBar.innerHTML = `<img class='Load' id='-${currentID}-' width=10% height=10% src=${hiddenCanvas.toDataURL()} alt="Not able to load image">${loadmenuBar.innerHTML}`;
  // now click event to load into main canvas via a get request
  const loadButtons = document.querySelectorAll('.Load');
  for (let i = 0; i < loadButtons.length; i++) {
    const button = loadButtons[i];
    const data = `?${button.id}`;// query
    const loadSave = (e) => requestUpdate(e, '/loadmap', data);
    button.addEventListener('click', loadSave);
  }
};

// xhr stuff////////////////////////////////////////////////////////////////////////
handleResponse = (xhr, parseResponse) => {
  switch (xhr.status) {
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
      return;
    default:
      console.log('Error code not implemented by client!');
      break;
  }

  if (parseResponse) {
    const obj = JSON.parse(xhr.response);
    // sets up variables that will automatically redraw to main canvas and edit sliders
    if (obj.element) { // must be /loadmap
      edsLIB.SetGravity(obj.element.gravitySpeed);
      edsLIB.SetFlowChance(obj.element.flowChance);
      edsLIB.SetFlowSpeed(obj.element.flowSpeed);
      edsLIB.SetPenSize(obj.element.penSize);
      const newBlocks = Uint8Array.from(obj.element.blocks.split(','));
      physics.SetBlocks(newBlocks);
      // draw to canvas using the data
      // edsLIB.draw(ctx, cols, rows, newBlocks);
    } else if (obj.length) { // check to see if needs refreshing uses /sizeOfSaves
      // based on the size  xhrUpdated and saves size add more img buttons
      if (xhrUpdated < obj.length) {
        // clear all img buttons
        loadmenuBar.innerHTML = '';
        // add them all back
        for (let i = 1; i < obj.length + 1; i++) {
          // need to get blocks for that id and create button with that sending get request
          xhrGET(undefined, '/loadmap', `?-${i}-`);
        }
      }
    } else if (obj.uuid) { // geting a unique id from server /getID
      // only sending id because this was a recent save(currently on main canvas)
      loadDataInitButton(obj.uuid.ID);// intialize load button
    }
  }
  console.log('Meta Data Received');
};

// loads in only blocks uses /loadmap
handleBlocks = (xhr) => {
  const obj = JSON.parse(xhr.response);// parsing
  const loadedBlocks = Uint8Array.from(obj.element.blocks.split(','));
  loadDataInitButton(obj.element.name, loadedBlocks);
};
const refreshButton = document.querySelector('#Refresh');
const sendPost = (e) => {
  e.preventDefault();
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/savestate');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.onload = () => handleResponse(xhr);

  // large quantity of data to be sent over as a save via POST request
  const data = `gravitySpeed=${edsLIB.GetGravity()}&flowSpeed=${edsLIB.GetFlowSpeed()}&flowChance=${edsLIB.GetFlowChance()}&penSize=${edsLIB.GetPenSize()}&blocks=${physics.GetBlocks()}`;// all data needed to be saved goes here
  xhr.send(data);

  // click to prevent issues when multiple clients send posts before refresh
  // force refresh essentially so this cannot happen(or is unlikely)
  refreshButton.click();
  return false;
};

const xhrInit = () => {
  // intializes save button functionality
  const saveButton = document.querySelector('#Save');
  const getID = (e) => requestUpdate(e, '/getID');// GET id to use to load
  const addSave = (e) => sendPost(e);// send POST request
  saveButton.addEventListener('click', getID);
  saveButton.addEventListener('click', addSave);

  // refresh button to see if more load image buttons need to get added due to additional saves//GET
  const refreshes = (e) => requestUpdate(e, '/sizeOfSaves');
  refreshButton.addEventListener('click', refreshes);

  // automatic refresh
  window.setInterval(() => {
    refreshButton.click();
  }, 15000);// 15 sec
};

export { hiddenCanvasInit, loadDataInitButton, xhrInit };
