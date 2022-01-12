const path = require("path");

uploadFile = async (file, filePath) => {
  let uploadPath = path.join(filePath);

  await file.mv(uploadPath, function (err) {
    if (err) throw err;
  });
};

module.exports = {
  uploadFile,
};
