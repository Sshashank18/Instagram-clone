const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const { MONGOURI } = require('./config/credentials');

const PORT = process.env.port || 4400;

mongoose.connect(MONGOURI,{                           //connect with the cloud mongo DB
    useNewUrlParser: true,
    useUnifiedTopology: true  
});           
mongoose.connection.on('connected',() => {
    console.log('Connected to Mongoose.');
});
mongoose.connection.on('error',(err) => {
    console.log('Error connecting', err);
});
mongoose.set('useFindAndModify', false);

require('./models/user');
require('./models/post');

app.use(express.json());
app.use(cors());

app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

if(process.env.NODE_ENV === "production"){
    app.use(express.static('client/build'));                //added client in server folder as deployment needs only 1 main folder
    const path = require('path');
    app.get("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));
    })
}

app.listen(PORT, () => {
    console.log('Server up and running at http://localhost:'+PORT);
});