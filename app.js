const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('./configuration/connection');
const bcrypt = require ('bcrypt')
const logger = require ('morgan')
const session = require ('express-session')
const cookieParser = require ('cookie-parser')
const nocache= require ('nocache')
const multer = require('multer')


const userRoute = require("./routers/user")
const adminRoute = require("./routers/admin")



const morgan = require('morgan')
const ejs = require ('ejs')

const app = express();


// set view engine
app.set('views', path.join(__dirname, '/views'))  //or
// app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs');

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
// disable the use of express.urlencoded() middleware
 app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.urlencoded({ extended: false }));

app.use(express.json())

// Multer (file upload setup)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/admin/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
        console.log(file.fieldname + Date.now() + path.extname(file.originalname));
    },
});
// const upload = multer({ storage: storage})

app.use(multer({ storage: storage }).array("image", 10))


//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
}
))
app.use(nocache())


app.use((req,res,next)=>{
    res.locals.message =req.session.message
    delete req.session.message
    next()
  })

//main routes
app.use("/", userRoute)
app.use("/admin",adminRoute)






//error route
app.use(function(err,req,res,next){
    console.log(err)
    res.status( err.status || 500)
  
    res.render('error/error');
    
    
});

//start server
app.listen(3000, () => {
console.log('server started at port 3000');
})