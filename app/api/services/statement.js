const util = require("util");
const moment = require("moment");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
let fs = require("fs");
let FormData = require("form-data");
const { uploadFile } = require("../helpers/statement");
const { notifyFileStatus, pusher, notifyStatus } = require('./pusher');
const axios = require("axios");
const fsPromises = require("fs/promises");

let parentDir = path.resolve(process.cwd(), "..");
let dirPath = `C:/Users/Administrator/Downloads/`;
// let dirPath = `/Users/macbook/lucie/`;

const getFromText = (text, name) => {
  let line = text.split('\n')
    .filter(l => l.startsWith(name))
  line = line[0] ? line[0] : null;

  if(!line) return;

  return line.split("=")[1].trim();
}

statementProcess = async (job, done) => {
  const { statementFileNames, bank, userId, token } = job.data;
  const templateName = bank['SRKey'] || bank['displayName'] || bank['name'];
  const dates = [];
  try {
    let form = new FormData();
    for (let index = 0; index < statementFileNames.length; index++) {
      await notifyFileStatus("processing", index, job);

      let statementFileName = statementFileNames[index];

      let fileNameWithOutExtension = path.parse(statementFileName).name;

      // await uploadFile(statementFile[index], `${dirPath}${statementFileName}`);

      // const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
      const command = `sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath ${statementFileName} --rtemplate UK::${templateName} --opath ${fileNameWithOutExtension}.csv`;

      const result = await runCommand(command);
      console.log("_result", result);

      let accuracy = parseInt(
        result.match(new RegExp("accuracy" + "\\s(\\w+)"))[1]
      );

      let error = result.includes("error");

      // if (accuracy < 90 || error) {
      //   return done({
      //     code: "low-accuracy",
      //     message: "Result is not accurate enough",
      //     fileIndex: index
      //   });
      // }

      const text = await fsPromises.readFile(dirPath + fileNameWithOutExtension + '.txt', 'utf8');
      
      const createDate = getFromText(text, "pdf_CreationDate");
      const modDate = getFromText(text, "pdf_ModDate");

      if((createDate && modDate) && (createDate !== modDate)) {
        return done({
          code: "wrong-dates",
          fileIndex: index
        });
      }

      const firstDate = getFromText(text, "First_date");
      const lastDate = getFromText(text, "Last_date");
      
      if(firstDate && lastDate) {
        dates.push({
          firstDate: moment(firstDate),
          lastDate: moment(lastDate)
        })
      }

      console.log(createDate, modDate);

      let csvStatement = fs.createReadStream(
        `${dirPath}${fileNameWithOutExtension}.csv`
      );

      form.append("statement", csvStatement, `${fileNameWithOutExtension}.csv`);

      await deleteFile(`${dirPath}${statementFileName}`);

      await notifyFileStatus("completed", index, job);
    }

    // after loop validations
    // dates = [
      // {
      //   firstDate: moment("1 Feb 2020"),
      //   lastDate: moment("22 Feb 2020")
      // },
      // {
      //   firstDate: moment("1 Jan 2020"),
      //   lastDate: moment("22 Jan 2020")
      // },
      // {
      //   firstDate: moment("1 Mar 2020"),
      //   lastDate: moment("22 Apr 2020")
      // },
    // ]

    dates.sort((a,b) => a.firstDate.format('YYYYMMDD') - b.firstDate.format('YYYYMMDD'))

    const firstDate = dates[0].firstDate;
    const lastDate = dates[dates.length - 1].lastDate;

    let numberOfMonths = Math.ceil(lastDate.diff(firstDate, "days") / 30.417);

    if(numberOfMonths < 3) {
      notifyStatus({
        status: "incomplete-statement",
        message: "Statement(s) doesn't contain data for minimum three months"
      }, job);

      // TODO: use this one in prod
      // return done({
      //   code: "not-complete",
      //   message: "Files doesn't contain data for minimum three months"
      // });
    }

    console.log(numberOfMonths);

    form.append("firstDate", firstDate.toISOString());
    form.append("lastDate", lastDate.toISOString());
    form.append("token", token);
    form.append("userId", userId);
    form.append("bank", JSON.stringify(bank));

    try {
      const result = await axios.post(
        "https://beta-api.clearstake.com/api/statement/read",
        form,
        {
          headers: form.getHeaders(),
        }
      );
      console.log(result.data);
      done();
    } catch (error) {
      console.log("error posting statement info", error);
      return done({
        code: "posting-failed"
      });
    }

    // await deleteFile(`${dirPath}statement.csv`);
  } catch (error) {
    console.log("error", error);
    done(error);
  }
};

runCommand = async (command) => {
  const { stdout, stderr, error } = await exec(command, {
    cwd: parentDir,
  });
  if (stderr) {
    console.error("stderr:", stderr);
    throw stderr;
  }
  if (error) {
    console.error("error:", error);
    throw error;
  }
  return stdout;
};

deleteFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    console.log("Successfully removed file!");
  } catch (err) {
    throw err;
  }
};

module.exports = {
  statementProcess,
};
