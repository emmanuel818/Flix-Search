
// Declaring all my const variables that are requiered for my modules
const http = require('http'),
  fs = require('fs'),
  url = require('url');

// Creating a server with the http module passes to arguments request and rsponse
http.createServer((request, response) => {
    //allows server to get url from users request
    let addr = request.url,
        //parses the url
        q = url.parse(addr, true),
        // This stores the path of the file
        filePath = '';

    /*Keeps a log of recent request made to the server by using the appendFile method*/
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log ('Added to log.');
        }
    });

    /* If statement checks the exact pathname of the entered URL. Uses dot notation to acces variable q (pathname).
    New Function includes () checks wether the pathname of q includes the words documentation. If it does it pieces together __dirname
    and documentation.html adding them as a complete path name to the currently empt filePath. If it doesnt it returns user to index.html page.*/
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    // fs module uses this function via dot notation to grab appropriate file from server. Grabs the file under the first argument variable filePath
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }    

        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write(data);
        response.end();
    });

}).listen (8080);

console.log('My first Node test server is running on Port 8080');