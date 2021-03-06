const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const path = require('path');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const hbs = require('hbs');
const helmet = require('helmet');
const SQLiteStore = require('connect-sqlite3')(sessions);

// express routers
const user = require('./api/routes/user.js');
const app = express();
const oneDay = 1000 * 60 * 60 * 24; // cookie expires after 24h in milliseconds
const csrfMiddleware = csurf({
    cookie: {
        maxAge: oneDay
    }

});

// sets handlebars as template engine
app.set('view engine', 'hbs');

// allows communication between client and server
app.use(cors());

// http request logger
app.use(morgan('dev'));

// parse incoming data
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// serves static files
app.use(express.static(path.join(__dirname, 'public')));

// sessions config
app.use(sessions({
    store: new SQLiteStore,
    secret: "keyboard cat",
    saveUninitialized: true,
    cookie: { 
        maxAge: oneDay,
        httpOnly: true,
        secure: true
    },
    resave: false 
}));

// cookie parser
app.use(cookieParser());

app.use(csrfMiddleware);

app.use(helmet());

app.use('/api/user', user);

// renders index page with handlebars template engine
app.get('/', (req, res)=>{
    res.render('index', { csrfToken: req.csrfToken() });
});

// starts the server on port 4001 if no process.env.PORT is set
const port = process.env.PORT || 4001;

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});

// exports app to be tested
module.exports = app;