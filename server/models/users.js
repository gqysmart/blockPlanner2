/**
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;
const oAuthTypes = [
    "github", "google"
];

/**
 * user schema
 */

const UserSchema = new Schema({
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    username: { type: String, default: "" },
    provider: { type: String, default: "" },
    hashed_password: { type: String, default: "" },
    salt: { type: String, default: "" },
    authToken: { type: String, default: "" },
    github: {},
    google: {}

});

const validatePresenceOf = value => value && value.length;

UserSchema
    .virtual("password")
    .set(function(password) {

        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encrytPassword(password);
    })
    .get(function() {
        return this._password;
    });

/** */
UserSchema.path('name').validate(function(name) {
    if (this.skipValidation()) return true;
    return name.length;

}, "name cannot be blank.");

UserSchema.path('email').validate(function(email) {
    if (this.skipValidation()) return true;
    return email.length;

}, "email cannot be blank.");

UserSchema.path('email').validate(function(email, fn) {
    const User = mongoose.model('User');
    if (this.skipValidation()) return fn(true);

    //
    if (this.isNew || this.isModified("email")) {
        User.find({ email: email }).exec(function(err, users) {
            fn(!err && users.length === 0);
        });

    } else {
        fn(true);
    }

}, "email already exists.");

UserSchema.path('username').validate(function(username) {
    if (this.skipValidation()) return true;
    return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    if (this.skipValidation()) return true;
    return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

/** */
UserSchema.pre("save", function(next) {
    if (!this.isNew) return next();
    if (!validatePresenceOf(this.password) && !this.skipValidation()) {
        next(new Error('Invalid password'))
    } else {
        next();
    }

});

/**
 *  
 */

UserSchema.methods = {

    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    skipValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    }
};


UserSchema.statics = {

    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    load: function(options, cb) {
        options.select = options.select || 'name username';
        return this.findOne(options.criteria)
            .select(options.select)
            .exec(cb);
    }
};



mongoose.model('User', UserSchema);