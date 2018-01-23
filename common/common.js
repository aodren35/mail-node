

const fs         = require('fs');
const urlLib     = require('url');
const request    = require('request');
const path       = require('path');

// The Secret to hash token
exports.SUPER_SECRET = 'MoBsATSEcRET';

// The encryption Algorithm for the token generation
exports.ENCRYPTION_ALGORITHM = 'HS256';

// Expiration time of the tokens in seconds
exports.EXPIRATION_TIME = 900; // 15 mins


// Concerning Localhost
exports.LOCAL_PORT = 3000;
exports.BASE_LOCAL_URL = '/api/';


// DataBase path in VM
// exports.DATABASE_PATH = '/root/Documents/Mobsat/database/MobSat.db';
// exports.DATABASE_PATH = '/volume1/homes/grandesalle/Mobsat/MobSat/database/MobSat.db';
// DataBase path in local
//exports.DATABASE_PATH = 'C:/Users/kilia/Documents/Projet_MobSat/MobSat/database/MobSat.db';
exports.DATABASE_PATH = 'C:/Users/aodre/Documents/Cours/M2/Project/MobSat/database/MobSat.db';
// exports.DATABASE_PATH = 'C:/Users/Quang LE/Documents/GitHub/MobSat/database/MobSat.db';


// current version of the API
exports.API_VERSION =  'v1';

// Custom JSON object/message when 404 error
exports.ERROR_404 = {
    status: 404,
    error: "Not found"
};

// Custom JSON object/message when 500 error
exports.ERROR_500 = {
    status: 500,
    error: "Internal error, server rebooting..."
};

// Custom JSON object/message when 403 error
exports.ERROR_403 = {
    status: 403,
    error: "Bad credentials"
};

// Custom JSON object/message when 401/unauthorized/token expired
exports.ERROR_401_EXPIRED = {
    status: 401,
    error: "Unauthorized, token expired. You may relog"
};

// Custom JSON object/message when 400 error
exports.ERROR_400 = {
    status: 400,
    error: "Bad Request"
};

// Custom JSON object message when rights are not sufficient
exports.ERROR_401_BAD_RIGHTS = {
    status: 401,
    error: "insufficient rights"
};

// Custom JSON object/message when there is a state  conflict between client and DB
exports.ERROR_409 = {
    status: 409,
    error: "Conflict error"
};


exports.middlewares = {

    /**
     * This function add headers to allow cross domain requests (between front-end and back-end)
     * @param req
     * @param res
     * @param next
     */
    allowCrossDomain: function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Cache-Control, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
        // catch the preflights requests
        if ('OPTIONS' === req.method) {
            res.status(200);
            res.end();
        } else {
            next();
        }
    },

    /**
     * Middleware to put in trace the method received on which url
     * @param logger
     * @returns {Function}
     */
    methodReceivedLogMiddleware: function (logger) {
        return function (req, res, next) {
            logger.debug(req.method, 'on', urlLib.parse(req.originalUrl || req.url).pathname);
            next();
        }
    }
}
