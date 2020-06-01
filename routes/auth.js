const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middleware/requireLogin');
const nodemailer = require('nodemailer');
const sparkpostTransport = require('nodemailer-sparkpost-transport');


const { JWT_SECRET } = require('../config/credentials');

const User = mongoose.model("User");


const transporter = nodemailer.createTransport(sparkpostTransport({
    auth:{
        api_key:"18c9a254fa4ef4bb6de607ac5f2e78c965e53d6c"
    }
}));


router.get('/protected',requireLogin,(req,res)=>{
    res.send("Hello");
});

router.post('/signup',(req,res)=>{
    const {name, email, password, pic} = req.body;
    if(!name || !email || !password){
        return res.status(422).json({error: "Please add all the fields"});
    }

    User.findOne({email: email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error: "Email Already Exists"});
        }
        bcrypt.hash(password, 10)
            .then(hashedPassword => {
                const user = new User({
                    email,
                    password: hashedPassword,
                    name,
                    pic
                });
        
                user.save()
                    .then(user => {
                        transporter.sendMail({
                            to: user.email,
                            from: "no-reply@insta.com",
                            subject: "Signup Success",
                            html:"<h1>Welcome to Instagram</h1>"
                        });

                        res.json({message: "saved successfully"})
                    })
                    .catch(err => {
                        console.log(err);
                    })
            })
    })
    .catch(err => {
        console.log(err);
    })
});

router.post('/reset-password',(req, res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
        }
        const token = buffer.toStringify('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(422).json({error: "User don't exist with that email"});
            }
            user.resetToken = token;
            user.expireToken = Date.now() + 3600000;    //Token will be valid for 1 hr
            user.save().then(result => {
                transporter.sendMail({
                    to:user.email,
                    from:"no-reply@insta.com",
                    subject: "Password Reset",
                    html: `
                    <p>You requested for password reset</p>
                    <h5>Click on this <a href="http://localhost:3000/reset/${token}">Link</a> to reset password.</h5>
                    `
                });
                res.json({message: "Check your Email"});
            })
        });
    });
});

router.post('/signin',(req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(422).json({error: "Please add email or password"});
    }
    User.findOne({email: email})
        .then(savedUser => {
            if(!savedUser){
                return res.status(422).json({error: "Invalid Email or Password"});
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if(doMatch){
                        const token = jwt.sign({_id: savedUser._id}, JWT_SECRET);
                        const {_id, name, email, followers, following, pic} = savedUser;
                        res.json({token,user: {_id, name, email, followers, following, pic}});
                    }
                    else{
                        return res.status(422).json({error: "Invalid Email or Password"});
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
});

module.exports = router;