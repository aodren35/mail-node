
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


// Inversion of control, mount express routers by passing app to small modules
algo(app, loggerFile);

// Start the service
var server = http.createServer(app).listen(common.LOCAL_PORT, function () {
    loggerFile.info('started a http service on localhost: ' + common.LOCAL_PORT);
    loggerFile.info('PID is ' + process.pid);
});

// make the objects public (for unit testing)
module.exports = { server: server};


