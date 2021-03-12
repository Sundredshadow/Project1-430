/* global document, XMLHttpRequest */

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

const hiddenCanvasInit = () => {
  hiddenCtx = hiddenCanvas.getContext('2d');
  hiddenCanvas.width = width;
  hiddenCanvas.height = height;
  loadmenuBar = document.querySelector('#LoadMenu');
};

// const loadData= (data) =>{
//     //need meta data within the img tag to be able to get something from the request
//     //hence post request needs to create a unique identifier
// }

const loadData = (data) => {
  // first draw to canvas using the data
  edsLIB.draw(hiddenCtx, cols, rows, data);
  // now turn that data into a png and add it to the page
  loadmenuBar.innerHTML += `<img width=10% height=10% src=${hiddenCanvas.toDataURL()} alt="Not able to load image">`;
  // now click event to loed into game via a get request
  // const loadButton = document.querySelector('#Load');
  // const loadSave = (e) => requestUpdate(e);
  // loadButton.addEventListener('click', loadSave);
};

// xhr stuff////////////////////////////////////////////////////////////////////////
const handleResponse = (xhr, parseResponse) => {
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
      break;
    default:
      console.log('Error code not implemented by client!');
      break;
  }

  if (parseResponse) {
    const obj = JSON.parse(xhr.response);
    // console.dir(obj);
    // console.log(`${xhr.response}`);
    edsLIB.SetGravity(obj.data.gravitySpeed);
    edsLIB.SetFlowChance(obj.data.flowChance);
    edsLIB.SetFlowSpeed(obj.data.flowSpeed);
    edsLIB.SetPenSize(obj.data.penSize);
    const newBlocks = Uint8Array.from(obj.data.blocks.split(','));
    physics.SetBlocks(newBlocks);
    loadData(newBlocks);
  } else {
    console.log('Meta Data Received');
  }
};

const requestUpdate = (e) => {
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

  const data = `gravitySpeed=${edsLIB.GetGravity()}&flowSpeed=${edsLIB.GetFlowSpeed()}&flowChance=${edsLIB.GetFlowChance()}&penSize=${edsLIB.GetPenSize()}&blocks=${physics.GetBlocks()}`;// all data needed to be saved goes here
  xhr.send(data);

  return false;
};

const xhrInit = () => {
  // intializes save button functionality//POST
  const saveButton = document.querySelector('#Save');
  const addSave = (e) => sendPost(e);
  saveButton.addEventListener('click', addSave);

  // load button functionality//GET
  const loadButton = document.querySelector('#Load');
  const loadSave = (e) => requestUpdate(e);
  loadButton.addEventListener('click', loadSave);
};

export { hiddenCanvasInit, loadData, xhrInit };
