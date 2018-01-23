const express = require('express');
const common = require('../common/common');

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var emlformat = require('eml-format');


module.exports = function (app, loggerFile) {
    console.log("running");
    var dataObj = [];
    var obj = {};
    var counter = 0;
    function readFiles(dirname, onFileContent, callBackRead, onError) {
        fs.readdir(dirname, function(err, filenames) {
            if (err) {
                onError(err);
                return;
            }
            obj = JSON.parse(fs.readFileSync('common/grammaire.json', 'utf8'));
                filenames.forEach(function(filename) {
                    fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                        if (err) {
                            onError(err);
                            return;
                        }
                        onFileContent(filename, content);

                        callBackRead(filenames.length);
                    });
                });
        });

    }
    readFiles('./EML/', function(filename, content) {
        emlformat.read(content, function(error, data) {
            if (error) return console.log(error);
            else {
                // fs.appendFileSync("sample.json", JSON.stringify(data, ",", 2));
                if (isOk(data)){
                    var temp = {
                        filename: data
                    };
                    dataObj.push(temp);
                }
                else {
                    // console.log(data);
                }

                counter ++;
            }
        });

    },
        function(l) {
        if (counter === l) {
            fs.writeFile('sample.json', '', function () {
                console.log('done ', dataObj.length);
            });

        }
            },
        function(err) {
        throw err;
    });


    function isOk(data) {
        if (data.text) {

        }
        else {
            if (data.html) {

            }
            else {
                return false;
            }
        }
    }
};