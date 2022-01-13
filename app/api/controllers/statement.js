const { createJob } = require("../helpers/queue");

module.exports = {
  upload: async (req, res, next) => {
    try {
      let bankName = req.body.bankName;
      let statementFile = req.files.file;
      let csvFileName = req.body.csvFileName;

      await createJob(
        statementFile,
        csvFileName,
        bankName,
      );

      res.status(200).send({ message: true, trans: "data.data" });
    } catch (e) {
      next(e);
    }
  },
  test: async (req, res) => {
    let statementFileName = req.files.file.name;
    let statementFile = req.files.file;
    res.status(200).send({ message: statementFileName });
  },
};
