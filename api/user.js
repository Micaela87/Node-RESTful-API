const express = require('express');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3');
const Validator = require('validatorjs');
const hashingFunctions = require('./utils/hashingFunctions');
const validations = require('./utils/validations');
const hashFileName = hashingFunctions.hashFileName;
const hashPassword = hashingFunctions.hashPassword;
const setCustomValidationMessages = validations.setCustomValidationMessages;
const user = express.Router();

user.use(fileUpload({
    createParentPath: false
}));

const db = new sqlite3.Database('database.sqlite');

user.post('/register', (req, res, next) => {

    let firstName = req.body.firstname,
        lastName = req.body.lastname,
        email = req.body.email,
        password = req.body.password;
    
    const validationRules = {
        'firstname': 'required|string',
        'lastname': 'required|string',
        'email': 'required|email',
        'password': 'required|string|min:8'
    }

    let validator = new Validator(req.body, validationRules);

    setCustomValidationMessages();

    if (validator.fails()) {
        res.status(412)
            .send({
                success: false,
                message: 'Validation failed',
                data: validator.errors.all()
            });

    } else {

        db.get('SELECT * FROM Users WHERE email = $email', {
            $email: email
        }, function(err, user) {
            if (user) {
                res.status(412).json({ errors: 'Email già registrata' });
            }

        });

        let hashedFileName = '';

        if (req.files.file && req.files.file.mimetype.includes('image')) {
            let img = req.files.file;
            hashedFileName = hashFileName(img);
            img.mv(`./public/storage/img/${hashedFileName}`);
        } else if (!req.files.file.mimetype.includes('image')) {
            res.status(400).json({ errors: 'Formato file non valido'});
        } else {
            hashedFileName = 'avatar-anonymous.png';
        }
        
        let hashedPassword = hashPassword(password);

        db.run('INSERT INTO Users (firstname, lastname, email, password, img) VALUES ($firstname, $lastname, $email, $password, $img)', {
            $firstname: firstName,
            $lastname: lastName,
            $email: email,
            $password: hashedPassword,
            $img: hashedFileName
        }, function(err) {
            if (err) {
                next(err);
            } else {
                db.get('SELECT * FROM Users ORDER BY id DESC LIMIT 1', function(err, newUser) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).json({newUser: newUser});
                    }
                });  
            }
        });
    }
        
});

user.post('/login', (req, res, next) => {
    let email = req.body.email,
        password = req.body.password;

    let validationRules = {
        'email': 'required|string',
        'password': 'required|string|min:8'
    }

    let validator = new Validator(req.body, validationRules);

    setCustomValidationMessages();

    if (validator.fails()) {

        res.status(412)
            .send({
                success: false,
                message: 'Validation failed',
                data: validator.errors.all()
            });

    } else {
        let hashedPassword = hashPassword(password);

        db.get('SELECT * FROM Users WHERE email = $email AND password = $password', {
            $email: email,
            $password: hashedPassword
        }, function(err, authenticatedUser) {
            if (err) {
                next(err);
            } else if (authenticatedUser) {
                res.status(200).json({ authenticatedUser: authenticatedUser });
            } else {
                res.status(404).json({ errors: 'Utente non registrato' });
            }
        });
    }
});

module.exports = user;