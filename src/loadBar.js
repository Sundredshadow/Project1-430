/* global document, XMLHttpRequest */
import * as edsLIB from './edsLIB';
import * as physics from './physics';

const hiddenCanvas = document.querySelector('#hiddenCanvas');
const canvas = document.querySelector('canvas');
const width = 640;// canvas height and width
const height = 480;
// const rows = height / 5;
// const cols = width / 5;
let hiddenCtx;

// loadmenuBar
let loadmenuBar;// just html element

//checks if there is data to be loaded 
let xhrUpdated=0;//compared to size of save array from GET request

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
const loadDataInitButton = (currentID) => {
  // turn data into a img and add it to the page
  loadmenuBar.innerHTML += `<img class='Load' id='-${currentID}-' width=10% height=10% src=${canvas.toDataURL()} alt="Not able to load image">`;
  // now click event to loed into game via a get request
  const loadButtons = document.querySelectorAll('.Load');
  for (const button of loadButtons) {
    const data =`?${button.id}`;
    const loadSave = (e) => requestUpdate(e, '/loadmap', data);
    button.addEventListener('click', loadSave);
  }
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
      return;
    default:
      console.log('Error code not implemented by client!');
      break;
  }

  if (parseResponse) {
    const obj = JSON.parse(xhr.response);
    //console.log(`${xhr.response}`);
    if (obj.element) { // must be /loadmap
      edsLIB.SetGravity(obj.element.gravitySpeed);
      edsLIB.SetFlowChance(obj.element.flowChance);
      edsLIB.SetFlowSpeed(obj.element.flowSpeed);
      edsLIB.SetPenSize(obj.element.penSize);
      const newBlocks = Uint8Array.from(obj.element.blocks.split(','));
      physics.SetBlocks(newBlocks);
      // draw to canvas using the data
      // edsLIB.draw(ctx, cols, rows, newBlocks);
    }else if (obj.length) {
      //based on the size  xhrUpdated and saves size add more img buttons
      if(xhrUpdated<obj.length){
        //clear all img buttons
        loadmenuBar.innerHTML='';
        //add them all back
        for(let i=1; i<obj.length+1;i++){
            loadDataInitButton(i);
        }
      }
    } else { // must be /getID
      loadDataInitButton(obj.uuid.ID);// intialize load button
    }
  } else {
    console.log('Meta Data Received');
  }
};

const requestUpdate = (e, path, data) => {
  const xhr = new XMLHttpRequest();
  console.log(data);
  if(!data){
    data='';
  }
  xhr.open('GET', path+data);

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

  // need to set as json instead
  const data = `gravitySpeed=${edsLIB.GetGravity()}&flowSpeed=${edsLIB.GetFlowSpeed()}&flowChance=${edsLIB.GetFlowChance()}&penSize=${edsLIB.GetPenSize()}&blocks=${physics.GetBlocks()}`;// all data needed to be saved goes here
  xhr.send(data);

  return false;
};

const xhrInit = () => {
  // intializes save button functionality
  const saveButton = document.querySelector('#Save');
  const getID = (e) => requestUpdate(e, '/getID');// GET id to use to load
  const addSave = (e) => sendPost(e);// send POST request
  saveButton.addEventListener('click', getID);
  saveButton.addEventListener('click', addSave);

  // refreshes to see if more load image buttons need to added//GET
  const  refreshButton= document.querySelector('#Refresh');
  const refreshes = (e) => requestUpdate(e, '/sizeOfSaves');
  refreshButton.addEventListener('click', refreshes);
};

export { hiddenCanvasInit, loadDataInitButton, xhrInit };
