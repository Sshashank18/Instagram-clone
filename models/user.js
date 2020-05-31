const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/deucalion/image/upload/v1590866283/user_male_circle_filled1600_anhd9v.png"
    },
    followers:[{type:ObjectId, ref: "User"}],
    following:[{type:ObjectId, ref: "User"}]
})

mongoose.model("User", userSchema);