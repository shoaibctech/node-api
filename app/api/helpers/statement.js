const path = require('path');

uploadFile = async (file) => {

    let fileName = file.name;

    let uploadPath = path.join(`/Users/macbook/lucie/${fileName}`);

    await file.mv(uploadPath, function (err) {
        if (err)
            throw err;
    });
};

module.exports = {
    uploadFile,
};