var os           = require('os'),
    fs           = require('fs'),
    path         = require('path'),
    childProcess = require('child_process'),
    glob         = require('glob'),
    chokidar     = require('chokidar'),
    mv           = require('mv'),
    db           = require(__dirname + '/utils/mongodb.js'),
    models       = require(__dirname + '/models'),
    config       = require(__dirname + '/../config.js'),
    stringUtil   = require(__dirname + "/utils/string.js"),
    watcher      = chokidar.watch(config.scanDir + "/*.(pdf|jpg|jpeg|png|bmp|gif|txt|md)", { awaitWriteFinish : true });

var tmpDir = os.tmpdir() + '/archiver'
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
}

function createDocument (file, callback) {
    var docTags = [];

    models.Tag.find({}, (err, tags) => {
        tags.forEach(tag => {
            var regexp = new RegExp(stringUtil.escapeRegExp(tag.filter))

            if (tag.isRegexp) {
                regexp = tag.filter.match(/^\/(.*?)\/([gim]*)$/);
                
                if (!regexp) return;

                regexp = new RegExp(regexp[1], regexp[2]);
            }

            if (file.data.match(regexp)) {
                docTags.push(tag.name);
            }
        });

        models.Document.create({
            name: file.format.name,
            fileName: file.filename,
            content: file.data,
            tags: docTags,
            type: file.format.ext.replace('.', '')
        }, (err, document) => {
            if (file.images) {
                file.images.forEach(image => {
                    fs.unlink(image);
                });
            }

            if (err) {
                callback(err);
                return;
            }

            mv(file.tmp, file.newPath, function (err) {
                callback(null, document);
            });
        });
    });
}

function getDataFromIMG (file, callback) {
    childProcess.exec("tesseract " + file.tmp + " stdout", (error, stdout, stderr) => {
        if (error) { return callback(stderr); }

        file.data = stdout;
        createDocument(file, callback);
    });
}

function getDataFromTXT (file, callback) {
    fs.readFile(file.filePath, (err, data) => {
        if (err) { return callback(err); }

        file.data = data.toString('utf8');
        createDocument(file, callback);
    });
}

function getDataFromPDF (file, callback) {
    childProcess.exec("convert -density 300 -depth 8 -type grayscale " + file.tmp + " " + file.tmp + "-convert.png", (error, stdout, stderr) => {
        if (error) { return callback(stderr); }

        glob(tmpDir + "/**/" + file.filename + "-convert*", { nodir: true }, (err, files) => {
            var data = "", docTags = [];

            file.images = files;

            file.images.forEach(image => {
                data += childProcess.execSync("tesseract " + image + " stdout");
            });

            file.data = data;
            createDocument(file, callback);
        });
    });
}

watcher.on('add', (filePath, infos) => {
    var date = +(new Date),
        format = path.parse(filePath),
        file = {
            filePath:       filePath,
            date :          +(new Date),
            format:         format,
        },
        callback =  (err, document) => {
            if (err) {
                console.log(err);
                return;
            }

            console.log("Finish consuming "+file.format.base);
        };

    file.filename = date + '-' + format.base.replace(/ /g, '-');
    file.newPath  = config.archiveDir + '/' + file.filename;
    file.tmp      = tmpDir + "/" + file.filename;

    //rename file to prevent space crash
    mv(file.filePath, tmpDir + '/' + file.filename, function (err) {
        if (err) throw err;

        console.log("Consuming "+file.format.base);

        if (file.format.ext.indexOf("pdf") > -1) {
            getDataFromPDF(file, callback);
            return
        }

        if (file.format.ext.match(/jpg|jpeg|png|bmp|gif/gi)) {
            getDataFromIMG(file, callback);
            return
        }

        if (file.format.ext.match(/txt|md/gi)) {
            getDataFromTXT(file, callback);
            return
        }

        console.log(file.format.base+ " cannot be consumed. Check file type");
    });
});
