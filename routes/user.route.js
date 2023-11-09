const router = require('express').Router();
const controllers = require('../controllers/user.controller');


router.post('/register', controllers.register);
router.post('/login', controllers.login)

module.exports = router;