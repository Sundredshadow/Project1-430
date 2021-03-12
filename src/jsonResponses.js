// Note this object is purely in memory
const saves = {};

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

const getData = (request, response) => {
  const data = saves.eds7847;
  const responseJSON = {
    data,
  };
  // console.dir(saves);
  return respondJSON(request, response, 200, responseJSON);
};

const addData = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };
  if (!body.gravitySpeed || !body.flowSpeed || !body.flowChance || !body.penSize || !body.blocks) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;
  // need to create a unique identifier(for now temporarily only on possible save)
  if (saves.eds7847) {
    responseCode = 204;
  } else {
    saves.eds7847 = {};
    saves.eds7847.name = 'eds7847';
  }
  saves.eds7847.gravitySpeed = body.gravitySpeed;
  saves.eds7847.flowSpeed = body.flowSpeed;
  saves.eds7847.flowChance = body.flowChance;
  saves.eds7847.penSize = body.penSize;
  saves.eds7847.blocks = body.blocks;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

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
  addData,
  getUsersMeta,
  // updateUser,
  notFound,
  notFoundMeta,
};
