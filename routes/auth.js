const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middleware/requireLogin');

const { JWT_SECRET } = require('../config/credentials');

const User = mongoose.model("User");

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