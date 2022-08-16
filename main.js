const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;
    
    if(pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir('./data', function(error, filelist) {
          const title = 'Welcome';
          let description = 'Hello, Node.js';
          let list = template.List(filelist);
          const html = template.HTML(title, list, 
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href="/create">create</a>`
            );
          response.writeHead(200);
          response.end(html);
        }); 
      } else {
          fs.readdir('./data', function(error, filelist) {
            const filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
              const title = queryData.id;
              const sanitizedTitle = sanitizeHtml(title);
              const sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
              });
              let list = template.List(filelist);
              const html = template.HTML(sanitizedtitle, list, 
                `<h2>${sanitizedtitle}</h2><p>${sanitizeddescription}</p>`,
                `<a href="/create">create</a>
                 <a href="/update?id=${sanitizedtitle}">update</a>
                 <form action="delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?');">
                    <input type="hidden" name="id" value="${sanitizedtitle}">
                    <input type="submit" value="delete">
                 </form>`
                );
              response.writeHead(200);
              response.end(html);
          });
        });
      }
    } else if(pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
          const title = 'Welcome';
          let description = 'Hello, Node.js';
          let list = template.List(filelist);
          const html = template.HTML(title, list, `
            <form action="/create_process" method="post">
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
          response.end(html);
        });
    } else if(pathname === '/create_process') {
        let body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();      
            })
        });
    } else if(pathname === '/update') {
        fs.readdir('./data', function(error, filelist) {
          const filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            const title = queryData.id;
            let list = template.List(filelist);
            const html = template.HTML(title, list, 
              `<form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                      <textarea name="description" placeholder="description">${description}</textarea>
                  </p>
                  <p>
                      <input type="submit">
                  </p>
              </form>`,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
              );
            response.writeHead(200);
            response.end(html);
        });
      });
    } else if(pathname === '/update_process') {
      let body = '';
      request.on('data', function(data) {
          body += data;
      });
      request.on('end', function() {
          let post = qs.parse(body);
          let id = post.id;
          let title = post.title;
          let description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error) {
              fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                  response.writeHead(302, {Location: `/?id=${title}`});
                  response.end();      
              });
          });
      });
    } else if(pathname === '/delete_process') {
      let body = '';
      request.on('data', function(data) {
          body += data;
      });
      request.on('end', function() {
          let post = qs.parse(body);
          let id = post.id;
          const filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error) {
            response.writeHead(302, {Location: `/`});
            response.end();
          });
      });
    } else {
            response.writeHead(404);
            response.end('Not found');
        }
});
app.listen(3000);
