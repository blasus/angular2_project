const mongoose = require('mongoose'),
      bcrypt = require('bcryptjs'),
      config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        index: true,
        required: true,
        validate: {
            isAsync: true,
            validator: function(v, cb){
                User.find({email: v}, (err, docs) => {
                    cb(docs.length == 0);
                });
            },
            message: 'Email already used!'
        }
    },
    username: {
        type: String,
        required: true,
        validate: {
            isAsync: true,
            validator: function(v, cb){
                User.find({username: v}, (err, docs) => {
                    cb(docs.length == 0);
                });
            },
            message: 'Username already used!'
        }
    },
    password: {
        type: String,
        required: true
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
    const query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserByEmail = function(email, callback){
    const query = {email: email};
    User.findOne(query, callback);
};

module.exports.addUser = function(newUser, callback){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
};
