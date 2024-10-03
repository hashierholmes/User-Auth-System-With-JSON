const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));

app.use(express.static('views'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

app.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/views/signin.html');
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    if (users.find(user => user.username === username)) {
        return res.send('User already exists. Try another username.');
    }

    users.push({ username, password });

    fs.writeFileSync('users.json', JSON.stringify(users));

    res.send('Sign-up successful. Please <a href="/signin">Sign In</a>.');
});

app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        req.session.user = user;
        res.redirect('/main');
    } else {
        res.send('Invalid credentials. Try again or <a href="/signup">Sign Up</a>.');
    }
});

app.get('/main', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/views/main.html');
    } else {
        res.redirect('/signin');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/views/dashboard.html');
    } else {
        res.redirect('/signin');
    }
});

app.get('/get-session', (req, res) => {
    const sessionKey = req.sessionID;
    res.send(`Your session key is: ${sessionKey}`);
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log(`nag run na ang app`);
});