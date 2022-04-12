const { createJob } = require("../helpers/queue");
const { uploadFile } = require("../helpers/statement");

let dirPath = `C:/Users/Administrator/Downloads/`;
// let dirPath = `/Users/macbook/lucie/`;

module.exports = {
  upload: async (req, res, next) => {
    try {
      const userId = req.body.userId;
      const token = req.body.token;
      const bank = JSON.parse(req.body.bank);
      let statementFile = req.files.file;
      let statementFileNames = [];
      let randomString;

      if (statementFile.constructor === Array) {
        for (let index = 0; index < statementFile.length; index++) {
          randomString = getRandomToken();
          let statementFileName = `${randomString}${statementFile[index].name}`;

          await uploadFile(
            statementFile[index],
            `${dirPath}${statementFileName}`
          );
          statementFileNames.push(statementFileName);
        }
      } else {
        randomString = getRandomToken();
        let statementFileName = `${randomString}${statementFile.name}`;

        await uploadFile(statementFile, `${dirPath}${statementFileName}`);

        statementFileNames.push(statementFileName);
      }

      await createJob(statementFileNames, bank, userId, token);

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

getRandomToken = () => {
  return Math.random().toString(36).slice(2);
};
