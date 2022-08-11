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

const adminController = require('./controllers/admin')
const trialsController = require('./controllers/trials');

const trialsRoutes = require('./routes/trials');
const adminRoutes =require('./routes/admin')
const userRoutes= require('./routes/user');

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
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    next();
});


app.use('/admin', adminRoutes);
app.use('/trials', trialsRoutes);
app.use('/user', userRoutes)

app.get('/', async (req, res, next) => {

    res.render('home');
})

//app.use(errorController.get404);

module.exports = app