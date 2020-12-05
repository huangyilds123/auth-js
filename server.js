

const express = require("express");
const path = require('path');
const bcrypt = require("bcrypt");
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override');


const initializePassport = require('./passport-config');

let users = [];

initializePassport(
    passport,
    (email) => users.find(user => user.email === email),
    (id) => users.find(user => user.id === id)
);

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());




app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
})



app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'))
})

app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'content', 'index.html'));
});

app.get('/content', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'content', 'index.html'));
});

app.get('/content/c1', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'content', 'amazing.html'));
});


app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login')
})


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/content',
    failureRedirect: '/login/?valid=incorrect'
}))

app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, 'content', '404.html'));
});


app.get('*', (req, res) => {
    res.redirect('/404')
})

app.post('/register', (req, res) => {
    // console.log(req.body.name)

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            req.body.password = hash;
            const newUser = {
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            users.push(newUser);
        });
    });
    res.redirect('/login/?valid=successfullyRegistered')

    // res.json({ msg: 'hi' });
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/content')
    }
    return next();
}

// function checkNotAuth

const PORT = 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));