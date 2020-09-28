const http = require('http')
const port = 3000

const handlers = require('./handlers')

http.createServer((req, res) => {
    console.log('running')
    for(let handler of handlers) {
        if(!handler(req, res)) {
            break;
        }
    }
}).listen(port, () => console.log('running at port', port))

