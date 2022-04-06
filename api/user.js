const express = require('express');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3');
const Validator = require('validatorjs');
const { hashFileName, hashPassword } = require('./utils/hashingFunctions');
const { setCustomValidationMessages, checkIfUserAlreadyExists } = require('./utils/validations');
const User = require('./models/User');
const user = express.Router();

// uploads files in existing directory
user.use(fileUpload({
    createParentPath: false
}));

// registers new user
user.post('/register', async (req, res, next) => {

    let firstName = req.body.firstname,
        lastName = req.body.lastname,
        email = req.body.email,
        password = req.body.password;
    
    // input validation
    const validationRules = {
        'firstname': 'required|string',
        'lastname': 'required|string',
        'email': 'required|email',
        'password': 'required|string|min:8'
    }

    let validator = new Validator(req.body, validationRules);

    // sets custom validation error messages in italian
    setCustomValidationMessages();

    // sends validation errors back if validation fails
    if (validator.fails()) {
        return res.status(412)
        .send({
            success: false,
            message: 'Validation failed',
            data: validator.errors.all()
        });

    }

    const userAlreadyRegistered = await checkIfUserAlreadyExists(email);

    // checks if email is available and sends back errors if email is already taken
    if (userAlreadyRegistered) {
        return res.status(412)
        .send({ 
            success: false,
            message: 'Email già registrata'
        });
    }

    // hashes file name and saves it in ./public/storage/img/
    let hashedFileName = '';

    if (req.files && req.files.file.mimetype.includes('image')) {
        let img = req.files.file;
        hashedFileName = hashFileName(img);
        img.mv(`./public/storage/img/${hashedFileName}`);
    } else if (req.files && !req.files.file.mimetype.includes('image')) {
        res.status(412).json({ errors: 'Formato file non valido'});
    } else {
        hashedFileName = 'avatar-anonymous.png';
    }

    // saves new user data into database.sqlite
    try {

        const newUser = await User.create({
            firstname: firstName,
            lastname: lastName,
            email,
            password: hashPassword(password),
            img: hashedFileName
        });

        if (newUser) {

            req.session.user = {
                email: newUser.email,
                password: newUser.password
            }

            return res.status(201).json({ newUser });
        }

    } catch(err) {
        next(err);
    }    
        
});

// logs in user
user.post('/login', async (req, res, next) => {
    let email = req.body.email,
        password = req.body.password;

    // validates input data
    let validationRules = {
        'email': 'required|string',
        'password': 'required|string|min:8'
    }

    let validator = new Validator(req.body, validationRules);

    // sets custom validation error messages in italian
    setCustomValidationMessages();

    // sends validation errors back if validation fails
    if (validator.fails()) {

        return res.status(412)
        .send({
            success: false,
            message: 'Validation failed',
            data: validator.errors.all()
        });

    }
    
    try {

        const authenticatedUser = await User.findOne({
            where: {
                email,
                password: hashPassword(password)
            }
        });
    
        if (authenticatedUser) {
    
            req.session.user = {
                email: authenticatedUser.email,
                password: authenticatedUser.password
            }
    
            return res.status(200).json({ authenticatedUser });
        }

        return res.status(404).send({ error: 'Credenziali non valide o utente non registrato' });

    } catch(err) {
        next(err);
    }
    
});

user.get('/logout', (req, res, next) => {
    if (req.session.user) {
        delete req.session.user;
        res.status(200)
            .send({ 
                success: true,
                message: 'User logged out'
            });
    }
});

user.get('/', async (req, res, next) => {
    try {

        const allUsers = await User.findAll();

        if (allUsers) {
            return res.status(200).json({ allUsers });
        }

    } catch(err) {
        next(err);
    }

})

module.exports = user;