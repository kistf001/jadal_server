module.exports = (app) => {
    const router = require('express').Router();
    const redis = require('redis');

    const application = app;

    router.get('/login', (req, res) => {
        res.send('This is login page');
    })
    router.get('/logout', (req, res) => {
        res.send('This is logout page');
    });
    router.get('/register', (req, res) => {
        res.send('This is register page');
    });
    
    return router;
}