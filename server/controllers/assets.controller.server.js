/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");

module.exports.getJS = function(req, res, next) {
    var fileName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app", "scripts/", fileName + ".js");
    res.sendFile(absoluteFileName);

};
module.exports.getCSS = function(req, res, next) {
    var fileName = req.params[0];
    var absoluteFileName = path.join(__dirname, "../app", "styles/", fileName + ".css");
    res.sendFile(absoluteFileName);

};