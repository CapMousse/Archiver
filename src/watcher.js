var os           = require('os'),
    fs           = require('fs'),
    path         = require('path'),
    childProcess = require('child_process')
    glob         = require('glob'),
    chokidar     = require('chokidar'),
    db           = require(__dirname + '/utils/mongodb.js'),
    models       = require(__dirname + '/models'),
    config       = require(__dirname + '/../config.js'),
    stringUtil   = require(__dirname + "/utils/string.js"),
    watcher      = chokidar.watch(config.scanDir + "/*.pdf", { awaitWriteFinish : true });

var tmpDir = os.tmpdir() + '/archiver'
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
}

watcher.on('add', (filePath, infos) => {
    var date = +(new Date),
        format   = path.parse(filePath),
        filename = date + '-' + format.base,
        newPath  = config.archiveDir + '/' + filename,
        tmp = tmpDir + "/" + date + '-' + format.name

    console.log("Consuming "+format.base);

    childProcess.exec("convert -density 300 -depth 8 -type grayscale " + filePath + " " + tmp + ".png", (error, stdout, stderr) => {
        if (error) { return console.log(stderr); }

        glob(tmpDir + "/**/" + date + '-' + format.name + "*", { nodir: true }, (err, files) => {
            var data = "", docTags = [];

            files.forEach(file => {
                data += childProcess.execSync("tesseract " + file + " stdout");
            });

            models.Tag.find({}, (err, tags) => {
                tags.forEach(tag => {
                    var regexp = new RegExp(stringUtil.escapeRegExp(tag.filter))

                    if (tag.isRegexp) {
                        regexp = tag.filter.match(/^\/(.*?)\/([gim]*)$/);
                        regexp = new RegExp(regexp[1], regexp[2]);
                    }

                    if (data.match(regexp)) {
                        docTags.push(tag.name);
                    }
                });

                models.Document.create({
                    name: format.name,
                    fileName: filename,
                    content: data,
                    tags: docTags
                }, err => {
                    files.forEach(file => {
                        fs.unlink(file);
                    });

                    if (err) {
                        console.log(err);
                        return;
                    }

                    fs.renameSync(filePath, newPath);
                });
            });
        });
    });
});