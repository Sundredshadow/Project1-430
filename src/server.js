// derieved from http-api-assignment-ii
const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const scriptHandler = require('./scriptResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handleQueryData = (request, response) => {
  const body = [];
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    if (request.method === 'POST') { // post
      jsonHandler.addData(request, response, bodyParams);
    }
  });
};

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/css/default-styles.css': htmlHandler.getCSS,
    '/css/fonts/BarlowSemiCondensed-ThinItalic.ttf': htmlHandler.getFont,
    '/src/images/Screenshot.png': htmlHandler.getPNG,
    '/src/images/title5.png': htmlHandler.getPNG,
    '/src/images/map-representation.png': htmlHandler.getPNG,
    '/src/images/whee.png': htmlHandler.getPNG,
    '/src/images/gravity-simulation-rules.png': htmlHandler.getPNG,
    '/src/index': scriptHandler.getScript,
    '/src/edsLIB': scriptHandler.getScript,
    '/src/physics': scriptHandler.getScript,
    '/src/client': scriptHandler.getScript,
    '/src/loader': scriptHandler.getScript,
    '/src/loadBar': scriptHandler.getScript,
    '/loadmap': jsonHandler.getData,
    '/getID': jsonHandler.getID,
    '/sizeOfSaves': jsonHandler.getSize,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/loadmap': jsonHandler.getDataMeta,
    '/getID': jsonHandler.getIDMeta,
    '/sizeOfSaves': jsonHandler.getSizeMeta,
    notFound: jsonHandler.notFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  console.dir(parsedUrl.pathname);
  console.dir(request.method);

  if (request.method === 'POST') {
    handleQueryData(request, response);// true is post request
  } else if (parsedUrl.query) { // running GET based on id parameter
    urlStruct.GET['/loadmap'](request, response, parsedUrl.query);
  } else if (urlStruct[request.method][parsedUrl.pathname]) { // handle get
    urlStruct[request.method][parsedUrl.pathname](request, response, parsedUrl);
  } else {
    urlStruct[request.method].notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
