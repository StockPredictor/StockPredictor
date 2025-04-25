const express = require('express');

const router = express.Router();

// Route for the home page
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// Route for the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Route for the signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' });
});

// Route for the account page
router.get('/account', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('account', { title: 'Account' , userID: req.session.user });
});

// Route for the stocks page
router.get('/stocks', (req, res) => {
    res.render('stocks', { title: 'Stocks' , userID: req.session.user });
});

module.exports = router;