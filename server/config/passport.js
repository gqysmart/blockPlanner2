/**
 * 
 * 
 */

const mongoose = require("mongoose");
const User = mongoose.model("User");

const local = require("./passports/local");

/** expose */
module.exports = function(passport) {
    //serialize sessions
    passport.serializeUser((user, cb) => cb(null, user.id));
    passport.deserializeUser((id, cb) => User.load({ criteria: { _id: id } }, cb));

    passport.use(local);
}