const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const path = require('path');
const user = require('./api/user.js');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/user', user);

const port = process.env.PORT || 4001;

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});