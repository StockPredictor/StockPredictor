const express = require('express');

const router = express.Router();

// Route for the home page
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' , userID: req.session.user });
});

// Route for the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});
// Route for the logout page
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/'); // Redirect to home on error
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/'); // Redirect to home after logout
    });
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
// ROUTES FOR ACCOUNT MANAGEMENT=======================================
router.get('/changeuser', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }       
    res.render('changeuser', { title: 'Change User' , userID: req.session.user });
});
router.get('/changepass', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('changepass', { title: 'Change Password' , userID: req.session.user });
});
router.get('/deleteaccount', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('deleteaccount', { title: 'Delete Account' , userID: req.session.user });
});

// Route for the stocks page
router.get('/stocks', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('stocks', { title: 'Stocks' , userID: req.session.user });
});

// Route for the stock lookup page
router.get('/stocklookup', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('stocklookup', { title: 'Stock Lookup' , userID: req.session.user });
});


module.exports = router;