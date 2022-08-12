const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

function templateHTML(title, list, body) {
  return `
  <!doctype html>
  <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        <a href="/create">create</a>
        ${body}
      </body>
  </html>
  `;
};

function templateList(filelist) {
  let list = '<ul>';
  let i = 0;
  while(i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i += 1;
  };
  list += '</ul>';
  return list;
};

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;
    
    if(pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir('./data', function(error, filelist) {
          const title = 'Welcome';
          let description = 'Hello, Node.js';
          let list = templateList(filelist);
          const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
          response.writeHead(200);
          response.end(template);
        }); 
      } else {
          fs.readdir('./data', function(error, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
              const title = queryData.id;
              let list = templateList(filelist);
              const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
              response.writeHead(200);
              response.end(template);
          });
        });
      }
    } else if(pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
          const title = 'Welcome';
          let description = 'Hello, Node.js';
          let list = templateList(filelist);
          const template = templateHTML(title, list, `
            <form action="http://localhost:3000/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                  <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                  <input type="submit">
              </p>
            </form>
          `);
          response.writeHead(200);
          response.end(template);
        });
    } else if(pathname === '/create_process') {
        let body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            let post = qs.parse(body);
            console.log(post);
        });
        response.writeHead(200);
        response.end('success');
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
