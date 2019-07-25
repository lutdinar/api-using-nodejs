var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Index',
        active: 'home',
        page: 'route: index.js',
        locate: 'Find me on routes/index.js and view/index.ejs'
    });
});

module.exports = router;
