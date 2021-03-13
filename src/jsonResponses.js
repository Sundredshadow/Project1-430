// Note this object is purely in memory
const saves = [];
const uuid = {};
uuid.ID = 0;// intiallize a starting id// limited by size of obj.

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const getData = (request, response, data) => {
  //console.dir(data);
  data=data.replace(/[^0-9]/g, '');//set to only numbers
  //console.dir(data);
  //console.dir(saves);
  if (data) {
    const element = saves.find((item) => item.name === data);
    //console.dir(element);
    const responseJSON = {
      element,
    };
    // console.dir(saves);
    return respondJSON(request, response, 200, responseJSON);
  }
  return notFound(request, response);
};

// generates an unique id(essentially just iterates through numbers)
const getID = (request, response) => {
  uuid.ID++;
  const responseJSON = {
    uuid,
  };
  return respondJSON(request, response, 200, responseJSON);
};

const addData = (request, response, body) => {
  const responseJSON = {
    message: 'Missing Params',
  };
  if (!body.gravitySpeed || !body.flowSpeed || !body.flowChance || !body.penSize || !body.blocks) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;
  // unique identifier
  let element = saves.find((item) => item.name === uuid.ID);
  if (element) {
    responseCode = 204;
  } else {
    saves.push({});
    element = saves[saves.length - 1];
    element.name = `${uuid.ID}`;
  }
  element.gravitySpeed = body.gravitySpeed;
  element.flowSpeed = body.flowSpeed;
  element.flowChance = body.flowChance;
  element.penSize = body.penSize;
  element.blocks = body.blocks;
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

// const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

// const updateUser = (request, response) => {
//   // const newUser = {
//   //   createdAt: Date.now(),
//   // };
//   // users[newUser.createdAt] = newUser;

//   // return respondJSON(request, response, 201, newUser);
// };

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you were looking for was not found',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

module.exports = {
  getData,
  getID,
  addData,
  // getUsersMeta,
  // updateUser,
  notFound,
  notFoundMeta,
};
