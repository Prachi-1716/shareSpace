const multer = require("multer");
const ExpressError = require("../ExpressError");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024, files: 5},
    fileFilter: (req, file, cb)=>{
        if(['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)){
            cb(null, true);
        }else{
            cb(new ExpressError(400, "Only JPG, PNG, WEBP images are allowed"));
        }
    }
});

module.exports = upload;