const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middleware/requireLogin');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');


const { JWT_SECRET, MAILGUN_API, MAILGUN_DOMAIN, EMAIL } = require('../config/credentials');

const User = mongoose.model("User");

const auth = {
    auth: {
      api_key: MAILGUN_API,
      domain: MAILGUN_DOMAIN
    },
};

const transporter = nodemailer.createTransport(mailgunTransport(auth));

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
                            from: "no-reply@sandboxd6da0211f79640febc04d2f80d6eef86.mailgun.org",
                            subject: "Signup Success",
                            html:"<h1>Welcome to Instagram</h1>"
                        },(err,info) => {
                            if(err){
                                console.log(err);
                            }else{
                                console.log(info);
                            }
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
        const token = buffer.toString('hex');
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
                    from:"no-reply@sandboxd6da0211f79640febc04d2f80d6eef86.mailgun.org",
                    subject: "Password Reset",
                    html: `
                    <p>You requested for password reset</p>
                    <h5>Click on this <a href="${EMAIL}/reset/${token}">Link</a> to reset password.</h5>
                    `
                });
                res.json({message: "Check your Email"});
            })
        });
    });
});

router.post('/new-password',(req,res)=>{
    const newpassword = req.body.password;
    const sentToken = req.body.token;
    User.findOne({resetToken: sentToken, expireToken:{$gt: Date.now()}})
    .then(user => {
        if(!user){
            return res.status(422).json({error:"Try Again Session Expired"});
        }
        bcrypt.hash(newpassword,12).then(hashedPassword => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.expireToken = undefined;
            user.save().then(savedUser => {
                res.json({message: "Password Updated Successfully"});
            })
        })
    }).catch(err => {
        return res.status(422).json({error:err});
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