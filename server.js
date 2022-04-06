const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const path = require('path');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const SQLiteStore = require('connect-sqlite3')(sessions);

// express routers
const user = require('./api/routes/user.js');

const app = express();

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
const oneDay = 1000 * 60 * 60 * 24; // cookie expires after 24h in milliseconds
app.use(sessions({
    store: new SQLiteStore,
    secret: "keyboard cat",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

// cookie parser
app.use(cookieParser());

app.use('/api/user', user);

// starts the server on port 4001 if no process.env.PORT is set
const port = process.env.PORT || 4001;

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});

module.exports = app;