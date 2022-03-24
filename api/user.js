const express = require('express');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const path = require('path');
const Validator = require('validatorjs');
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

    let errorMessages = Validator.getMessages('en');

    errorMessages.required = 'Il campo :attribute è obbligatorio';
    errorMessages.min = 'Il campo :attribute deve contenere almeno 8 caratteri';
    errorMessages.email = 'Il campo :attribute deve contenere una email valida'; 
    
    Validator.setMessages('en', errorMessages);

    if (validator.fails()) {
        res.status(412)
            .send({
                success: false,
                message: 'Validation failed',
                data: validator.errors.all()
            });

    } else {

        if (req.files) {
            let img = req.files.file;
            let hashedFileName = crypto.createHash('sha256').update(img.name).digest('hex') + path.extname(img.name);
            img.mv(`./public/storage/img/${hashedFileName}`);
        } else {
            hashedFileName = 'avatar-anonymous.png';
        }
        
        let hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

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

module.exports = user;