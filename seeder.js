const sqlite3 = require('sqlite3');
const crypto = require('crypto');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS Users");
    db.run("CREATE TABLE Users (id INTEGER PRIMARY KEY NOT NULL, firstname TEXT NOT NULL, lastname TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, img TEXT DEFAULT 'avatar-anonymous.png' NOT NULL)");
    db.run("INSERT INTO Users (firstname, lastname, email, password, img) VALUES ($firstname, $lastname, $email, $password, $img)", {
        $firstname: 'Micaela',
        $lastname: 'Milano',
        $email: 'micaela.example@gmail.com',
        $password: crypto.createHash('sha256').update('Password1!').digest('hex'),
        $img: crypto.createHash('sha256').update('profilepicture').digest('hex') + '.jpg'
    });
    db.run("INSERT INTO Users (firstname, lastname, email, password) VALUES ($firstname, $lastname, $email, $password)", {
        $firstname: 'Marilisa',
        $lastname: 'Milano',
        $email: 'marilisa.example@gmail.com',
        $password: crypto.createHash('sha256').update('Password2!').digest('hex')
    });
    db.run("INSERT INTO Users (firstname, lastname, email, password) VALUES ($firstname, $lastname, $email, $password)", {
        $firstname: 'Mariachiara',
        $lastname: 'Milano',
        $email: 'mariachiara.example@gmail.com',
        $password: crypto.createHash('sha256').update('Password3!').digest('hex')
    });
});