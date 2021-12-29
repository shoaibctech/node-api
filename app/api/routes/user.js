const UserController = require('../controllers/user');

module.exports = (app) => {
    app.get('/api/user', UserController.getUser);
    app.get('/', UserController.getUser);
};
