/* eslint-disable max-len */
// to keep eslint from sending EXCESSIVE errors about max-len
// the if statements are FINE and in fact more readible on one line then SEVEN

// self.onmessage=function(e){
//     console.log("loaded web worker");
//     physics();
//     this.postMessage(blocks);
// }
(function () {
  const width = 640;// canvas height and width
  const height = 480;
  const rows = height / 5;
  const cols = width / 5;

  // populates a 2 dimensional array
  let blocks = new Uint8Array(cols * rows).fill(0);// contains all blocks
  let movedAlready = new Uint8Array(cols * rows).fill(0);// skips over already moved through blocks

  // worker
  // let worker;

  // helpers/////////////////////////////////////////
  // allows easy identification of type of physics that needs to be used based on block iD in blocks
  // has been rendered obsolete. Basically a single get for physics of all types of blocks.
  /* function physicsType(iD) {
    // 1,3 sand//2,6 water//4 gas
    let physicsType;
    switch (iD) {
      case 1:
      case 3:
        physicsType = 1;
        break;
      case 2:
      case 6:
      case 7:
      case 8:
      case 9:
        physicsType = 2;
        break;
      case 4:
      case 10:
        physicsType = 3;
        break;
      default:
        // code block
    }
    return physicsType;
  } */

  // returns if iD2 is lower density return true
  function densityCheck(iD1, iD2) {
    switch (iD1) {
      case 1: // sand
        if (iD2 === 2 || iD2 === 6 || iD2 === 7 || iD2 === 8) { return true; }
        break;
      case 2:// water
        if (iD2 === 7 || iD2 === 8) { return true; }
        break;
      case 3:// salt
        if (iD2 === 2 || iD2 === 6 || iD2 === 7 || iD2 === 8) { return true; }
        break;
      case 4:// smoke
        if (iD2 === 10) { return true; }
        break;
      case 5:// ground
        break;
      case 6:// salt water
        if (iD2 === 2 || iD2 === 7 || iD2 === 8) { return true; }
        break;
      case 7:// oil
        if (iD2 === 8) { return true; }
        break;
      case 8:// acid
        break;
      case 9:// mercury
        if ((iD2 === 1 || iD2 === 2 || iD2 === 3 || iD2 === 6 || iD2 === 7 || iD2 === 8)) { return true; }
        break;
      case 10:// fire
      case 11:
      case 12:
        break;
      default:
        return false;
    }
    return false;
  }

  // does a lot of checks so made it seperate from interactioncheck
  function fireInteraction(iD1, i, z, ax, ay) {
    const rand = edsLIB.getRandomInt(0, 1);
    if (rand === 1) {
      for (let x = -1; x <= 1; x++) { // check surroundings//x=-1;x<=1;x++
        for (let y = 1; y >= 1; y--) { // y=1;y>=-1;y--
          if (i + x >= 0 && i + x < cols && z + y >= 0 && z + y < rows) {
            const temp = blocks[(i + x) + (z + y) * cols];
            if (iD1 === 7 && (temp === 10 || temp === 11 || temp === 12)) { // if oil fire
              blocks[(i + x) + (z + y) * cols] = 10;
              blocks[(i) + (z) * cols] = 10;
              movedAlready[(i) + (z) * cols] = 1;
              movedAlready[(i + x) + (z + y) * cols] = 1;
              return true;
            }
            if ((iD1 === 10 || iD1 === 11 || iD1 === 12) && temp === 7) { // if fire oil
              blocks[(i + x) + (z + y) * cols] = 10;
              blocks[(i) + (z) * cols] = 10;
              movedAlready[(i) + (z) * cols] = 1;
              movedAlready[(i + x) + (z + y) * cols] = 1;
              return true;
            }
          }
        }
      }
      if (iD1 > 9 && iD1 < 12) { // changes fire
        blocks[(i + ax) + (z + ay) * cols] = iD1 + 1;
        movedAlready[(i + ax) + (z + ay) * cols] = 1;
        return true;
      } if (iD1 !== 7) {
        const rand2 = edsLIB.getRandomInt(0, 10);
        if (rand2 === 1) { // 1/10 chance of turning into smoke
          blocks[(i + ax) + (z + ay) * cols] = 4;
          movedAlready[(i + ax) + (z + ay) * cols] = 1;
          return true;
        }
        blocks[(i + ax) + (z + ay) * cols] = 0;
        movedAlready[(i + ax) + (z + ay) * cols] = 1;
        return true;
      }
    }
    return false;
  }

  // pass in two Ids if interaction valid
  // use location of iD2, and i,z//intial location,(a:ax,ay)//speed factors to make stuff happen
  function interactionCheck(iD1, iD2, iD2x, iD2y, i, z, ax, ay) {
    switch (iD1) {
      case 2:// water
      case 3:// salt
        if (iD2 + iD1 === 5) {
          if (iD1 === 3 && iD2 === 2) {
            blocks[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 6;// turns into salt water
            blocks[(i + ax) + (z + ay) * cols] = 0;
          } else {
            blocks[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 0;// turns into salt water
            blocks[(i + ax) + (z + ay) * cols] = 6;
          }
          movedAlready[(i + ax) + (z + ay) * cols] = 1;
          movedAlready[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 1;
          return true;
        }
        if (iD2 === 8) {
          blocks[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 0;
          blocks[(i + ax) + (z + ay) * cols] = 0;
          movedAlready[(i + ax) + (z + ay) * cols] = 1;
          movedAlready[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 1;
          return true;
        }
        return false;
      case 1:
      case 4:
      case 6:
      case 7:
      case 9:
        if (iD2 === 8) { // check for acid interaction
          blocks[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 0;
          blocks[(i + ax) + (z + ay) * cols] = 0;
          movedAlready[(i + ax) + (z + ay) * cols] = 1;
          movedAlready[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 1;
          return true;
        }
        if (iD1 === 7) { // checks if oil is lit
          fireInteraction(iD1, i, z, ax, ay);
        }
        break;
      case 8:// acid deletes everything
        if (iD2 !== 0 && iD2 !== 8 && iD2 !== 5) {
          blocks[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 0;
          blocks[(i + ax) + (z + ay) * cols] = 0;
          movedAlready[(i + ax) + (z + ay) * cols] = 1;
          movedAlready[(i + iD2x + ax) + (z + iD2y + ay) * cols] = 1;
          return true;
        }
        return false;
      case 10:// fire
      case 11:
      case 12:
        fireInteraction(iD1, i, z, ax, ay);
        break;
      default: break;
    }
    return false;
  }

  // for transferring to edsLIB
  function GetBlocks() {
    return blocks;
  }
  function SetBlocks(blockNew){
    blocks=blockNew;
  }

  // functionality for reset with reload page
  function WipeBlocks() {
    blocks = new Uint8Array(cols * rows).fill(0);// contains all blocks
    movedAlready = new Uint8Array(cols * rows).fill(0);// skips over already moved through blocks
  }

  // physics functions//////////////////////////////////////////////////////////////////////////
  function sandPhysics(i, z) {
    // for loop to increase sand particle falling speed
    // uses gravitySpeed as amount allowed to go downward
    for (let a = 0; a < index.GetGravity(); a++) {
      // gravity also does the check if sand is above a liquid
      if (z + 1 + a < rows && (blocks[i + (z + 1 + a) * cols] === 0// empty slot
        || (densityCheck(blocks[i + (z + a) * cols], blocks[i + (z + 1 + a) * cols]))// salt water on water, oil on water,etc
        || (interactionCheck(blocks[i + (z + a) * cols], blocks[i + (z + 1 + a) * cols], 0, 1, i, z, 0, a)))) { // water on salt etc.
        if (interactionCheck(blocks[i + (z + a) * cols], blocks[i + (z + 1 + a) * cols], 0, 1, i, z, 0, a) === true) { break; }// done inside interaction check
        else {
          const temp = blocks[i + (z + 1 + a) * cols];
          blocks[i + (z + 1 + a) * cols] = blocks[i + (z + a) * cols];
          blocks[i + (z + a) * cols] = temp;
          movedAlready[i + (z + a) * cols] = 1;
          movedAlready[i + (z + 1 + a) * cols] = 1;
        }
      } else {
        a = index.GetGravity();
      }
    }
    if (movedAlready[i + z * cols] === 0) {
      // switch the two
      if (z + 1 <= rows) {
        let leftDiag = false;
        let rightDiag = false;
        if (i + 1 < cols && (blocks[(i + 1) + (z + 1) * cols] === 0
            || densityCheck(blocks[i + z * cols], blocks[(i + 1) + (z + 1) * cols]))) { // last check is density check//ex:salt water and freshwater
          rightDiag = true;
        }
        if (i - 1 >= 0 && (blocks[(i - 1) + (z + 1) * cols] === 0
            || densityCheck(blocks[i + z * cols], blocks[(i - 1) + (z + 1) * cols]))) { // last check is density check//ex:salt water and freshwater
          leftDiag = true;
        }

        if (leftDiag && rightDiag) {
          const x = edsLIB.getRandomInt(0, 1);
          if (x === 0) {
            rightDiag = false;
          } else {
            leftDiag = false;
          }
        }
        if (rightDiag) {
          for (let a = 0; a < index.GetSlide(); a++) {
            if (z + 1 + a < rows && i + 1 + a < cols) {
              if (blocks[(i + 1 + a) + (z + 1 + a) * cols] !== blocks[(i + a) + (z + a) * cols]
                        || interactionCheck(blocks[(i + a) + (z + a) * cols], blocks[(i + 1 + a) + (z + 1 + a) * cols], 1, 1, i, z, a, a)) {
                if (interactionCheck(blocks[(i + a) + (z + a) * cols], blocks[(i + 1 + a) + (z + 1 + a) * cols], 1, 1, i, z, a, a)) { break; } else {
                  const temp = blocks[(i + 1 + a) + (z + 1 + a) * cols];
                  blocks[(i + 1 + a) + (z + 1 + a) * cols] = blocks[(i + a) + (z + a) * cols];
                  blocks[(i + a) + (z + a) * cols] = temp;
                  movedAlready[(i + 1 + a) + (z + 1 + a) * cols] = 1;
                  movedAlready[(i + a) + (z + a) * cols] = 1;
                }
              } else { a = index.GetSlide(); }
            }
          }
        } else if (leftDiag) { // leftDiag
          for (let a = 0; a < index.GetSlide(); a++) {
            if (z + 1 + a < rows && i - 1 - a >= 0) {
              if (blocks[(i - 1 + a) + (z + 1 + a) * cols] !== blocks[(i - a) + (z + a) * cols]
                        || interactionCheck(blocks[(i - a) + (z + a) * cols], blocks[(i - 1 + a) + (z + 1 + a) * cols], -1, 1, i, z, -a, a)) {
                if (interactionCheck(blocks[(i - a) + (z + a) * cols], blocks[(i - 1 + a) + (z + 1 + a) * cols], -1, 1, i, z, -a, a)) { break; } else {
                  const temp = blocks[(i - 1 + a) + (z + 1 + a) * cols];
                  blocks[(i - 1 + a) + (z + 1 + a) * cols] = blocks[(i - a) + (z + a) * cols];
                  blocks[(i - a) + (z + a) * cols] = temp;
                  movedAlready[(i - 1 + a) + (z + 1 + a) * cols] = 1;
                  movedAlready[(i - a) + (z + a) * cols] = 1;
                }
              } else { a = index.GetSlide(); }
            }
          }
        }
      }
    }
  }
  // since sideMovement is identical for gasPhysics and waterPhysics thus made it a seperate function
  function sideMovement(i, z) {
    if (movedAlready[i + z * cols] === 0) {
      // determines which directions are valid
      let left = false;
      let right = false;
      if (i + 1 < cols && ((blocks[(i + 1) + z * cols] === 0) || densityCheck(blocks[i + z * cols], blocks[(i + 1) + z * cols])
        || interactionCheck(blocks[i + z * cols], blocks[(i + 1) + z * cols], 1, 0, i, z, 0, 0))) {
        right = true;
      }
      if (i - 1 >= 0 && (blocks[(i - 1) + z * cols] === 0 || densityCheck(blocks[i + z * cols], blocks[(i - 1) + z * cols])
        || interactionCheck(blocks[i + z * cols], blocks[(i - 1) + z * cols], -1, 0, i, z, 0, 0))) {
        left = true;
      }
      // decides which direction left, right, or standstill
      if (left && right) {
        const x = edsLIB.getRandomInt(0, 1);
        if (x === 0) { // 1/2 chance right
          left = false;
        } else if (x === 1) { // 1/2 chance left
          right = false;
        }
      }
      // carries out those directions according to flowSpeed
      if (right) {
        for (let a = 0; a < index.GetFlowSpeed(); a++) {
          if (i + 1 + a < cols && (blocks[(i + 1 + a) + z * cols] === 0
                || densityCheck(blocks[(i + a) + z * cols], blocks[(i + 1 + a) + z * cols])// compare density allow denser liquids flow sideways
                || interactionCheck(blocks[(i + a) + z * cols], blocks[(i + 1 + a) + z * cols], 1, 0, i, z, a, 0))) { // liquid to liquid interaction. Ex:acid
            if (interactionCheck(blocks[(i + a) + z * cols], blocks[(i + 1 + a) + z * cols], 1, 0, i, z, a, 0) === true) { break; } else {
              const x = edsLIB.getRandomInt(0, index.GetFlowChance());
              if (x === 0) {
                const temp = blocks[(i + 1 + a) + z * cols];
                blocks[(i + 1 + a) + z * cols] = blocks[(i + a) + z * cols];
                blocks[(i + a) + z * cols] = temp;
                movedAlready[(i + 1 + a) + z * cols] = 1;
                movedAlready[(i + a) + z * cols] = 1;
              }
            }
          } else {
            a = index.GetFlowSpeed();
          }
        }
      } else if (left) { // left
        for (let a = 0; a < index.GetFlowSpeed(); a++) { // check based on a
          if (i - 1 - a >= 0 && (blocks[(i - 1 - a) + z * cols] === 0
                || densityCheck(blocks[(i - a) + z * cols], blocks[(i - 1 - a) + z * cols])// compare density allow denser liquids flow sideways
                || interactionCheck(blocks[(i - a) + z * cols], blocks[(i - 1 - a) + z * cols], -1, 0, i, z, -a, 0))) { // liquid to liquid interaction. Ex:acid
            if (interactionCheck(blocks[(i - a) + z * cols], blocks[(i - 1 - a) + z * cols], -1, 0, i, z, -a, 0) === true) { break; } else {
              const x = edsLIB.getRandomInt(0, index.GetFlowChance());
              if (x === 0) {
                const temp = blocks[(i - 1 - a) + z * cols];
                blocks[(i - 1 - a) + z * cols] = blocks[(i - a) + z * cols];
                blocks[(i - a) + z * cols] = temp;
                movedAlready[(i - 1 - a) + z * cols] = 1;
                movedAlready[(i - a) + z * cols] = 1;
              }
            }
          } else {
            a = index.GetFlowSpeed();
          }
        }
      }
    }
  }
  function waterPhysics(i, z) {
    sandPhysics(i, z);
    sideMovement(i, z);// what seperates water from sand
  }
  function gasPhysics(i, z) {
    // for loop to increase gas particle rising speed
    // uses gravitySpeed as amount allowed to go upward
    for (let a = 0; a < index.GetRising(); a++) {
      // gravity also does the check if sand is above a liquid
      if (z - 1 - a >= 0 && (interactionCheck(blocks[i + (z - a) * cols], blocks[i + (z - 1 - a) * cols], 0, -1, i, z, 0, a)
        || (densityCheck(blocks[i + (z - a) * cols], blocks[i + (z - 1 - a) * cols]))
        || (blocks[i + (z - 1 - a) * cols] === 0))) {
        const temp = blocks[i + (z - 1 - a) * cols];
        blocks[i + (z - 1 - a) * cols] = blocks[i + (z - a) * cols];
        blocks[i + (z - a) * cols] = temp;
        movedAlready[i + (z - a) * cols] = 1;
        movedAlready[i + (z - 1 - a) * cols] = 1;
      } else {
        a = gravitySpeed;
      }
    }
    if (movedAlready[i + z * cols] === 0) {
      // switch the two
      if (z - 1 >= 0) {
        let leftDiag = false;
        let rightDiag = false;
        if (i + 1 < cols && (blocks[(i + 1) + (z - 1) * cols] === 0
            || (densityCheck(blocks[i + z * cols], blocks[(i + 1) + (z - 1) * cols])))) {
          rightDiag = true;
        }
        if (i - 1 >= 0 && (blocks[(i - 1) + (z - 1) * cols] === 0
            || (densityCheck(blocks[i + z * cols], blocks[(i - 1) + (z - 1) * cols])))) {
          leftDiag = true;
        }

        if (leftDiag && rightDiag) {
          const x = edsLIB.getRandomInt(0, 1);
          if (x === 0) {
            rightDiag = false;
          } else {
            leftDiag = false;
          }
        }
        if (rightDiag) {
          if (blocks[(i + 1) + (z - 1) * cols] !== blocks[i + z * cols]
                || interactionCheck(blocks[i + z * cols], blocks[(i + 1) + (z - 1) * cols], 1, -1, i, z, 0, 0)) {
            if (interactionCheck(blocks[i + z * cols], blocks[(i + 1) + (z - 1) * cols], 1, -1, i, z, 0, 0)) {} else {
              const temp = blocks[(i + 1) + (z - 1) * cols];
              blocks[(i + 1) + (z - 1) * cols] = blocks[i + z * cols];
              blocks[i + z * cols] = temp;
              movedAlready[(i + 1) + (z - 1) * cols] = 1;
              movedAlready[i + z * cols] = 1;
            }
          }
        } else if (leftDiag) { // leftDiag
          if (blocks[(i - 1) + (z - 1) * cols] !== blocks[i + z * cols]
                || interactionCheck(blocks[i + z * cols], blocks[(i - 1) + (z - 1) * cols], -1, -1, i, z, 0, 0)) {
            if (interactionCheck(blocks[i + z * cols], blocks[(i - 1) + (z - 1) * cols], -1, -1, i, z, 0, 0)) {} else {
              const temp = blocks[(i - 1) + (z - 1) * cols];
              blocks[(i - 1) + (z - 1) * cols] = blocks[i + z * cols];
              blocks[i + z * cols] = temp;
              movedAlready[(i - 1) + (z - 1) * cols] = 1;
              movedAlready[i + z * cols] = 1;
            }
          }
        }
      }
    }
    sideMovement(i, z);// execute side movement code identical to water so in a seperate function
  }
  function physics() {
    // worker code
    // if(window.Worker){
    //     worker=new Worker('src/physicsWorker.js');
    // }
    // worker.postMessage(blocks);
    // simple switch for physics based on block type
    for (let i = 0; i < cols; i++) {
      for (let z = 0; z < rows; z++) {
        if (movedAlready[i + z * cols] === 0) {
          switch (blocks[i + z * cols]) {
            case 1:
            case 3:
              sandPhysics(i, z, blocks[i + z * cols]);
              break;
            case 2:
            case 6:
            case 7:
            case 8:
            case 9:
              waterPhysics(i, z);
              break;
            case 10:
            case 11:
            case 12:
            case 4:
              gasPhysics(i, z);
              break;
            case 5: break;// no movement aka standing block
            default:
                    // code block
          }
        }
      }
    }
    for (let i = 0; i < cols; i++) {
      for (let z = 0; z < rows; z++) {
        movedAlready[i + z * cols] = 0;
      }
    }
  }

  window.physics = { physics, GetBlocks, WipeBlocks,SetBlocks };
}());
