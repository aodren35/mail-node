
// load dependencies
const express    = require('express');
const bodyParser = require('body-parser');
const busboy     = require('connect-busboy');
const multer     = require('multer');
const common     = require('../common/common');
const http       = require('http');
const logger     = require('morgan');
const cliArgs    = require('command-line-args');
const helmet     = require('helmet');
const urlLib     = require('url');
const winston    = require('winston');

var algo = require('./Algo.js');

// create the app (the secure one)
const app = express();

// setting command line options to parse
const cliOptions = [
    { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false},
    { name: 'level', alias: 'l', type: String, defaultValue: 'info'}
];
const options = cliArgs(cliOptions);

// create a file logger
var loggerFile = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: 'trace.log',
            level: options.level
        })
    ]
});


// we say the app to use our customs middlewares
app.use(common.middlewares.methodReceivedLogMiddleware(loggerFile));

// if verbosity is set to true we use a logger middleware
if ( options.verbose ) {
    logger.token('shortURL', function (req, res) {
        return urlLib.parse(req.originalUrl || req.url).pathname;
    });
    // we use the predefined tokens of morgan which are good enough
    app.use(logger(':method :shortURL - Remote addr :  :remote-addr - :date[clf] - Status : :status - :response-time ms - :res[content-length] bytes'));
}

// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: false } ));
// parse application/json
app.use(bodyParser.json());
// parse multipart
app.use(busboy());

// add some security headers
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.hsts({
    maxAge: 15552000
}));
// disable powered by header
app.disable('x-powered-by');

// Inversion of control, mount express routers by passing app to small modules
algo(app, loggerFile);

// middleware which catch 404
app.use(common.middlewares.catch404(loggerFile));

// middleware which catch 500
app.use(common.middlewares.catch500());

// Start the service
var server = http.createServer(app).listen(common.LOCAL_PORT, function () {
    loggerFile.info('started a http service on localhost: ' + common.LOCAL_PORT);
    loggerFile.info('PID is ' + process.pid);
});

// make the objects public (for unit testing)
module.exports = { server: server};


