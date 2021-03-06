const fs = require('fs'); // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../index.html`);
const css = fs.readFileSync(`${__dirname}/../css/default-styles.css`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getPNG = (request, response, pathname) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(fs.readFileSync(`${__dirname}/..${pathname}`));
  response.end();
};

const getFont = (request, response, pathname) => {
  response.writeHead(200, { 'Content-Type': 'font/ttf' });
  response.write(fs.readFileSync(`${__dirname}/..${pathname}`));
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getPNG,
  getFont,
};
