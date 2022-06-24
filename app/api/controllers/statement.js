const { createJob } = require("../helpers/queue");
const { uploadFile } = require("../helpers/statement");

let dirPath = `C:/Users/Administrator/Downloads/`;

module.exports = {
  upload: async (req, res, next) => {
    try {
      const token = req.body.token;
      const bank = JSON.parse(req.body.bank);
      const statementFiles = Array.isArray(req.files.file)
        ? req.files.file
        : [req.files.file];
      const statementFileNames = [];

      for (const statementFile of statementFiles) {
        const randomString = getRandomToken();
        const statementFileName = `${randomString}${statementFile.name}`;

        await uploadFile(statementFile, `${dirPath}${statementFileName}`);
        statementFileNames.push(statementFileName);
      }

      const job = await createJob(statementFileNames, bank, token);
      try {
        const result = await job.finished();
        res.json(result);
      } catch (error) {
        console.log("error while processing job", error);
        res.status(400).json({ success: false, message: error.message });
      }
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

getRandomToken = () => {
  return Math.random().toString(36).slice(2);
};
