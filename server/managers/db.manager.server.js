/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const fs = require("fs");


module.exports.systemDB = {
    connectString: "mongodb://127.0.0.1:27017/test",


}