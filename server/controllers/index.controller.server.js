/**
 * 
 * 
 * 
 */
const { respond } = require("../utils");
const conf = require("../config/config");
const appTitle = conf.appTitle;

module.exports = index;


function index(res, req, next) {
    respond(res, "index", { title: appTitle });

};