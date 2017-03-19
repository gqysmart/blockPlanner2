/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const fs = require("fs");

module.exports.getFont = function(req, res, next) {
    var fileName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app/assets", "fonts/", fileName);
    fs.exists(absoluteFileName, function(exists) {
        if (exists) {
            res.sendFile(absoluteFileName);
        } else {
            res.status(404);
            res.end();
        }
    });

};

module.exports.getJS = function(req, res, next) {
    var fileName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app/assets", "scripts/", fileName + ".js");
    fs.exists(absoluteFileName, function(exists) {
        if (exists) {
            res.sendFile(absoluteFileName);
        } else {
            res.status(404);
            res.end();
        }
    });

};
module.exports.getCSS = function(req, res, next) {
    var fileName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app/assets", "styles/", fileName + ".css");
    fs.exists(absoluteFileName, function(exists) {
        if (exists) {
            res.sendFile(absoluteFileName);
        } else {
            res.status(404);
            res.end();
        }
    });

};

module.exports.getAvanta = function(req, res, next) {
    //assume the profile picture was in fold
    var avantaName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app/assets", "images/avantas", avantaName);

    fs.exists(absoluteFileName, function(exists) {
        if (exists) {
            res.sendFile(absoluteFileName);
        } else {
            res.status(404);
            res.end();
        }
    });
};