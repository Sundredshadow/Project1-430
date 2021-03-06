const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const scriptHandler = require('./scriptResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

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
    '/src/index.js': scriptHandler.getScript,
    '/src/edsLIB.js': scriptHandler.getScript,
    '/src/physics.js': scriptHandler.getScript,
    '/src/client.js': scriptHandler.getScript,
    '/loadmap':jsonHandler.getData,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notFound: jsonHandler.notFoundMeta,
  },
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/savestate') {
    const body=[];
    request.on('error',(err)=>{
      console.dir(err);
      response.statusCode=400;
      response.end();
    });

    request.on('data',(chunk)=>{
      body.push(chunk);
    });

    request.on('end',()=>{
      const bodyString=Buffer.concat(body).toString();
      const bodyParams=query.parse(bodyString);

      jsonHandler.addData(request,response,bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  console.dir(parsedUrl.pathname);
  console.dir(request.method);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    // handle get
    if (urlStruct[request.method][parsedUrl.pathname]) {
      urlStruct[request.method][parsedUrl.pathname](request, response, parsedUrl.pathname);
    } else {
      urlStruct[request.method].notFound(request, response);
    }
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
