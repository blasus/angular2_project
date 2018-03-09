const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      jwt = require('jsonwebtoken'),
      User = require('../models/user'),
      config = require('../config/database');

// Register
router.post('/register', (req, res, next) => {
    // error happened because jsonParser dependency was written after the body acquisition (:-P):
    if(!req.body){
        console.error('Error: request body is undefined');
        return res.status(400).send('Invalid body on request');
    }

    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg: 
                err.errors['email'] ? err.errors['email'].message :
                err.errors['username'] ? err.errors['username'].message : 
                'User registration failed!'});
        }else{
            res.json({success: true, msg: 'User registered correctly!'});
        }
    })
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, msg: 'User not found!'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign({data: user}, config.secret, {
                    expiresIn: 604800 // 1 week
                });

                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                })
            }else{
                return res.json({success: false, msg: 'Wrong password!'});
            }
        })
    })
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});

module.exports = router;