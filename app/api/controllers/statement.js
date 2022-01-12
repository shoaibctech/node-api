const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
let fs = require('fs');
let FormData = require('form-data');
const {uploadFile} = require("../helpers/statement");
const opts = require('../helpers/redisConnection');
const axios = require("axios");
const fsPromises = require("fs/promises");
const bull = require('bull');


let parentDir = path.resolve(process.cwd(), '..');

module.exports = {
    upload: async (req, res, next) => {
        try {

            let bankName = req.body.bankName;
            let statementFileName = req.files.file.name;
            let statementFile = req.files.file;
            let csvFileName = req.body.csvFileName;
            let path = `C:/Users/Administrator/Downloads/`;

            await createJobs(statementFile, statementFileName, csvFileName, bankName, path, res);

            // } else {
            //     res.status(400).send({success: false, message: "Result is not accurate enough"})
            // }
            // res.status(200).send({message: true, trans: 'data.data'});
        } catch (e) {
            next(e);
        }
    },
    test: async (req, res) => {
        let statementFileName = req.files.file.name;
        let statementFile = req.files.file;
        res.status(200).send({message: statementFileName})
    }
}

processPdf = async (statementFile, statementFileName, csvFileName, bankName, path, res) => {

    // await uploadFile(statementFile, `${path}${statementFileName}`);

    // const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
    const command = `sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath Statement_2021_12.pdf --rtemplate UK::${bankName} --opath ${csvFileName}`;

    const result = await runCommand(command);
    console.log("_result", result);
    
    let accuracy = parseInt(result.match(new RegExp("accuracy" + '\\s(\\w+)'))[1]);

    console.log("{}{}{}}{}{}", accuracy, typeof(accuracy));

    if (accuracy >= 70) {

    let form = new FormData();
    let csvStatement = fs.createReadStream(`${path}${csvFileName}`);

    console.log("DDDDDDD");
    form.append('statement', csvStatement, 'statement.csv');
    return await axios.post(
        'https://dev-api-clearstake.herokuapp.com/api/statement/read', form, {
        headers: form.getHeaders(),
    });
    
    // await deleteFile(`${path}${statementFileName}`);
    // await deleteFile(`${path}statement.csv`);

    // res.status(200).send({message: true, trans: data.data});
}
}

runCommand = async (command) => {
    const {stdout, stderr, error} = await exec(command, {
        cwd: parentDir
    },);
    if (stderr) {
        console.error('stderr:', stderr);
    }
    if (error) {
        console.error('error:', error);
    }
    return stdout;
};

deleteFile = async (filePath) => {
    try {
        await fsPromises.unlink(filePath);
        console.log('Successfully removed file!');
    } catch (err) {
        throw err;
    }
};

createJobs = async (statementFile, statementFileName, csvFileName, bankName, path, res) => {
    console.log('1111111111', csvFileName);
    const queue = new bull("ocrQueue", opts);
    console.log('xxxxxxx');
    await queue.add({
        statementFile, statementFileName, csvFileName, bankName, path
    });

    console.log('222222222');


    await queue.process(async (job, done) => {
        console.log('3333333333');
        /*  /*
            Sometimes, you might need to report the jobs progress, you can easily use the     job.progress() function to track the progress
             */
        let progress = 0;

        // for(let i = 0; i < 80; i++){
            // await doSomething(job.data);
            console.log("[][[][][]", job.data);
            const {statementFile, statementFileName, csvFileName, bankName, path} = job.data;
            const das = await processPdf(statementFile, statementFileName, csvFileName, bankName, path, res);

            progress += 10;
        //     job.progress(progress);
        // }
        // call done when finished
        done();
        console.log('returnnnnnnnnnnnnnnn!...!!!!!!');
    });
    console.log('&&&&&&&&&&&&&&&&&&&&!...!!!!!!');

};
