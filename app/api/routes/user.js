const UserController = require('../controllers/user');

module.exports = (app) => {
    app.get('api/runApiCaller', UserController.runApiCaller);
};
