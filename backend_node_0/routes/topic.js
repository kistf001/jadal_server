const router = require('express').Router();

router.get('/view', (req, res) => {
    res.send('This is view page');
});
router.get('/add', (req, res) =>{
    res.send('This is add page');
});
router.get('/edit', (req, res) =>{
    res.send('This is edit page');
});
router.get('/delete', (req, res) =>{
    res.send('This is delete page');
});

module.exports = router;
