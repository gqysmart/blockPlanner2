var express = require('express');
var router = express.Router();

//middleware specific to index/
router.use(function(req, res, next) {
    console.log(req.url);
    next();
});
//home page
router.get('/', function(req, res, next) {
    res.send("this is main page!");
    next();

});

//about page
router.get("/about",
    function(req, res, next) {
        res.send("this is about page");
    }

);
module.exports = router;