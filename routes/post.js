const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');

const Post = mongoose.model("Post");

router.get('/allPosts', requireLogin, (req,res) => {
    Post.find()
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')                             // '-' is added to sort the post in descending order
    .then(posts => {
        res.json({posts});
    })
    .catch(err => {
        console.log(err);
    })
});

router.get('/mysubposts', requireLogin, (req,res) => {
    Post.find({postedBy: {$in: req.user.following}})
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')                         
    .then(posts => {
        res.json({posts});
    })
    .catch(err => {
        console.log(err);
    })
});

router.post('/createPost', requireLogin, (req,res) => {
    const {title, body, pic} = req.body;
    if(!title || !body || !pic){
        return res.status(401).json({error: "Please add all the fields"});
    }

    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy: req.user
    })

    post.save()
     .then(result => {
         res.json({post: result});
     })
     .catch(err => {
         console.log(err);
     })
});

router.get('/myposts', requireLogin, (req,res)=>{
    //requireLogin will give the field req.user
    Post.find({postedBy: req.user.id})
        .populate("postedBy","_id name")
        .then(myposts => {
            res.json({myposts});
        })
        .catch(err => {
            console.log(err);
        })
});

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push:{likes: req.user._id}
    },{
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        }else{
            res.json(result);
        }
    });
});

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull:{likes: req.user._id}
    },{
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        }else{

            res.json(result);
        }
    });
});

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push:{comments: comment}
    },{
        new: true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        }else{

            res.json(result);
        }
    });
});

router.delete('/deletepost/:postId', requireLogin, (req,res)=>{
    Post.findOne({_id: req.params.postId})
    .populate("postedBy","_id")
    .exec((err, post)=>{
        if(err || !post){
            return res.status(422).json({error : err});
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                console.log(err);
            })
        }
    });
});

router.delete('/deletecomment/', requireLogin, (req,res)=>{
    const {commentId, postId} = req.query;
    Post.findOne({_id:postId})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .then(result => {
        result.comments = result.comments.filter(comment=>{
            return comment._id.toString() !== commentId.toString();
        });
        result.save();
        res.json(result);
    })
    .catch(err => console.log(err));
});

module.exports = router;