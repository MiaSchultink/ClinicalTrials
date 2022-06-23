require('dotenv').config()
const fetch = require('node-fetch')
const fs = require('fs');


const path = require('path');

const mongoose = require('mongoose')
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');


const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
});

const csrfProtection = csrf();


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.set('views', 'views')

// const favicon = require('serve-favicon');


//  const errorController = require('./controllers/error.js')
// const adminController = require('./controllers/admin')
const trialsController = require('./controllers/trials');

const trialsRoutes = require('./routes/trials');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isAdmin = req.session.isAdmin;
    next();
});


//   app.use('/admin', adminRoutes);

app.use('/trials', trialsRoutes);

app.get('/', async (req, res, next) => {
    // const url = 'https://ClinicalTrials.gov/api/query/full_studies?expr=Duchenne+Muscular+Dystrophy&fmt=JSON&max_rnk=100'
    // const response = await fetch(url);
    // const json = await response.json();
    
    // // res.send(json)
 
    // const data = JSON.stringify(json);
    // console.log(JSON.parse(data).length)

    // write JSON string to a file
    // fs.writeFile('user.json', data, (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log("JSON data is saved.");
    // });


    res.render('home');
})

//app.use(errorController.get404);

module.exports = app