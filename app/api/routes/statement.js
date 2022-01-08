const StatementController = require('../controllers/statement');

module.exports = (app) => {
    app.get('/api/uploadStatement', StatementController.upload);
};
