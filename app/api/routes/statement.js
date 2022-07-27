const StatementController = require("../controllers/statement");

module.exports = (app) => {
  app.post("/api/uploadStatement", StatementController.upload);
  app.post("/api/saveStatement", StatementController.save);
};
