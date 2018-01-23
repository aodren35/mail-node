

const fs         = require('fs');
const urlLib     = require('url');
const jwt        = require('jsonwebtoken');
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
    },

    /**
     * Middleware to check token provided
     * @param logger {Object} the logger
     */
    checkToken: function ( logger ) {
        return function (req, res, next) {

            // check url parameters for token
            const token = req.query.token;

            // check the presence of the token
            if ( token ) {
                logger.debug('token provided');
                logger.debug('decryption starting');
                jwt.verify( token, exports.SUPER_SECRET, function ( err_decode, decoded ) {
                    // parse errors
                    if ( err_decode ) {
                        if ( err_decode.name === 'TokenExpiredError' ) {
                            logger.debug('token expired');
                            const error = exports.ERROR_401_EXPIRED;
                            error.expiredAt = err_decode.expiredAt;
                            logger.debug('sending expired to front with timestamp expiration');
                            res.status(401).send(error);
                            res.end();
                        } else {
                            logger.debug('error trying to decrypt token');
                            logger.debug('sending bad credentials to front');
                            res.status(403).send(exports.ERROR_403);
                            res.end();
                        }
                    }
                    else { // no errors
                        logger.debug('good token is provided');
                        logger.debug('userRequestingId', decoded.userId);
                        req.userRequestingId = decoded.userId;
                        next();
                    }
                });

            } else {
                logger.debug('token is missing in request');
                logger.debug('sending 403 to front');
                res.status(403).send(exports.ERROR_403);
                res.end();
            }
        }
    },


    /**
     * Add a refresh token to the res locals
     * @returns {Function}
     */
    regenerateToken: function ( logger ) {
        return function ( req, res, next ) {

            const payload = {
                exp: (Date.now() / 1000 | 0) + exports.EXPIRATION_TIME, // the expiration timestamp
                userId: req.userRequestingId
            };
            jwt.sign(payload, exports.SUPER_SECRET, {algorithm: exports.ENCRYPTION_ALGORITHM}, function (err, token) {
                if ( err ) {
                    logger.error('error when trying to generate token');
                    res.locals.token = 0;
                } else {
                    logger.debug('sending the refresh token to front');
                    res.locals.token = token;
                }
                next();
            });
        }
    },

    /**
     * Middleware to catch 404, url not found
     * @param logger
     * @returns {Function}
     */
    catch404: function ( logger ) {
        return function (req, res, next) {
            logger.info("someone tried to access a non existing route : ", urlLib.parse(req.originalUrl || req.url).pathname);
            res.status(404).send(exports.ERROR_404);
            res.end();
        }
    },

    catch500: function() {
        return function (err, req, res, next) {
            console.error(err.stack);
            res.status(500).send(exports.ERROR_500);
            res.end();
        }
    }

};

// SQL Requests

// get
// getUserByID
exports.GET_USER_BY_ID = 'SELECT * FROM USER WHERE UserId=?1;';
// getUsers
exports.GET_USERS = 'SELECT * FROM USER';
// getUserByLogin
exports.GET_USER_BY_LOGIN = 'SELECT * FROM UTILISATEUR WHERE Username=?1;';
// getUserByRightInsert
exports.GET_USER_BY_RIGHT_INSERT= 'SELECT * FROM UTILISATEUR WHERE id_utilisateur=?1 AND right_insert = 1;';

// getVideos
exports.GET_VIDEOS = 'SELECT * FROM videos';
//getVideoByUrl
exports.GET_VIDEO_BY_URL = 'SELECT * FROM videos WHERE url = ?1';
//getVideosByLanguage
exports.GET_VIDEOS_BY_LANGUAGE = 'SELECT * FROM videos WHERE fk_id_language IN (SELECT id_language FROM language WHERE language = ?1)';
//getVideoByUrl
exports.GET_VIDEO_BY_ID = 'SELECT * FROM videos WHERE id = ?1';


// getArticles
exports.GET_ARTICLES = 'SELECT * FROM articles';
//getArticlesByUrl
exports.GET_ARTICLES_BY_URL = 'SELECT * FROM articles WHERE url = ?1';
//getArticlesByUrl
exports.GET_ARTICLES_BY_ID = 'SELECT * FROM articles WHERE id = ?1';
//getArticlesByLanguage
exports.GET_ARTICLES_BY_LANGUAGE = 'SELECT * FROM articles WHERE fk_id_language IN (SELECT id_language FROM language WHERE language = ?1)';

// get advert
exports.GET_ADVERT = 'SELECT * FROM advert';
//get advert ByUrl
exports.GET_ADVERT_BY_URL = 'SELECT * FROM advert WHERE url = ?1';
//get  advert ByLanguage
exports.GET_ADVERT_BY_LANGUAGE_AND_IMAGE = 'SELECT advert.*, image.imagedata FROM advert, image WHERE advert.fk_id_language IN (SELECT id_language FROM language WHERE language = ?1) AND image.fk_id = advert.id';
exports.GET_ADVERT_BY_LANGUAGE = 'SELECT * FROM advert WHERE fk_id_language IN (SELECT id_language FROM language WHERE language = ?1)';
//get advert ByUrl
exports.GET_ADVERT_BY_ID = 'SELECT * FROM advert WHERE id = ?1';

// get image
exports.GET_IMAGE_BY_ID_AD = 'SELECT imagedata FROM image WHERE fk_id = ?1';

//getLanguage
exports.GET_LANGUAGE = 'SELECT * FROM language WHERE language = ?1';
//getContentByKind
exports.GET_CONTENT_BY_KIND = 'SELECT * FROM categorie WHERE kind = ?1';

// post
// postUserInformation
// adresse, login/username, password
// exports.POST_USER_INFO = 'INSERT INTO UTILISATEUR(mail, username, password) VALUES (?1, ?2, ?3)';
// mail, last_name, first_name, birthdate, login, password
exports.POST_USER_INFO = 'INSERT INTO UTILISATEUR(mail, last_name, first_name, birthdate, login, password, right_insertion) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)';
// postUserSocial
exports.POST_USER_SOCIAL = 'INSERT INTO UTILISATEUR(username,mail,last_name,first_name) VALUES (?,?,?,?)';

// postContent
exports.POST_CONTENT = 'INSERT INTO categorie(kind)' +
    'VALUES(?1)';
// postContent if not exists
exports.POST_CONTENT_IGNORE = 'INSERT OR IGNORE INTO categorie(kind)' +
    'VALUES ($kind)';
// postLanguage
exports.POST_LANGUAGE = 'INSERT INTO language(language)' +
    'VALUES(?1)';
// postLanguage if not exists
exports.POST_LANGUAGE_IGNORE = 'INSERT OR IGNORE INTO language(language)' +
    'VALUES (?1)';

// postVideo
exports.POST_VIDEO = 'INSERT INTO videos' +
    '( fk_id_kind, id_video, publishedAt, title, description, summary, url, url_image, popularity, fk_id_language, rating)' +
    'VALUES((SELECT id_kind FROM categorie WHERE kind = ?1),' +
    '?2,?3,?4,?5,?6,?7,?8,0,' +
    '(SELECT id_language FROM language WHERE language = ?9),0)';
// postVideoByPopularity
exports.POST_VIDEO_BY_POPULARITY = 'UPDATE videos SET popularity = (popularity + ?2) WHERE id = ?1';
// postVideoUpdateNbRating
exports.POST_VIDEO_UPDATE_NB_RATING = 'UPDATE videos SET nb_rating = (nb_rating + 1) WHERE id = ?1';
// postVideoByRating
exports.POST_VIDEO_BY_RATING = 'UPDATE videos SET rating = (SELECT (((rating * (nb_rating - 1)) + ?2)/nb_rating) as newrate FROM videos WHERE id = ?1) WHERE id = ?1';

// postArticle
exports.POST_ARTICLE = 'INSERT INTO articles' +
    '( fk_id_source, publishedAt, author, title, description, summary, url, url_image, popularity, rating, fk_id_language)' +
    'VALUES((SELECT id_kind FROM categorie WHERE kind = ?1),' +
    '?2,?3,?4,?5,?6,?7,?8,0,' +
    '(SELECT id_language FROM language WHERE language = ?9),0)';
// postArticleByPopularity
exports.POST_ARTICLE_BY_POPULARITY = 'UPDATE articles SET popularity = (popularity + ?2) WHERE id = ?1';
// postArticleUpdateNbRating
exports.POST_ARTICLE_UPDATE_NB_RATING = 'UPDATE articles SET nb_rating = (nb_rating + 1) WHERE id = ?1';
// postArticleByRating
exports.POST_ARTICLE_BY_RATING = 'UPDATE articles SET rating = (SELECT (((rating * (nb_rating - 1)) + ?2)/nb_rating) as newrate FROM articles WHERE id = ?1) WHERE id = ?1';

// post advert
exports.POST_ADVERT = 'INSERT INTO advert' +
    '( fk_id_source, publishedAt, author, title, description, url, popularity,  rating, fk_id_language, nb_rating)' +
    'VALUES((SELECT id_kind FROM categorie WHERE kind = ?1),' +
    '?2,?3,?4,?5,?6,0,0,' +
    '(SELECT id_language FROM language WHERE language = ?7),0)';
// post advert ByPopularity
exports.POST_ADVERT_BY_POPULARITY = 'UPDATE advert SET popularity = (popularity + ?2) WHERE id = ?1';
// post  advert UpdateNbRating
exports.POST_ADVERT_UPDATE_NB_RATING = 'UPDATE advert SET nb_rating = (nb_rating + 1) WHERE id = ?1';
// post advert ByRating
exports.POST_ADVERT_BY_RATING = 'UPDATE advert SET rating = (SELECT (((rating * (nb_rating - 1)) + ?2)/nb_rating) as newrate FROM videos WHERE id = ?1) WHERE id = ?1';

//POST IMAGE
exports.POST_IMAGE = 'INSERT INTO image (fk_id, filename, imagedata) VALUES (' +
    '?1,' +
    '?2, ?3)';