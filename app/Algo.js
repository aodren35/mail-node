const express = require('express');
const common = require('../common/common');

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var emlformat = require('eml-format');


module.exports = function (app, loggerFile) {
    console.log("running");
    var dataObj = {};
    fs.writeFile('sample.json', '', function(){console.log('done')});
    function readFiles(dirname, onFileContent, onError) {
        fs.readdir(dirname, function(err, filenames) {
            if (err) {
                onError(err);
                return;
            }
            filenames.forEach(function(filename) {
                fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    onFileContent(filename, content);
                });
            });
        });
    }
    readFiles('./test/', function(filename, content) {
        dataObj[filename] = content;
        emlformat.read(content, function(error, data) {
            if (error) return console.log(error);
            fs.appendFileSync("sample.json", JSON.stringify(data, " ", 2));
        });

    }, function(err) {
        throw err;
    });
};