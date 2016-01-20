var os           = require('os'),
    fs           = require('fs'),
    path         = require('path'),
    childProcess = require('child_process')
    glob         = require('glob'),
    chokidar     = require('chokidar'),
    db           = require(__dirname + '/utils/mongodb.js'),
    models       = require(__dirname + '/models'),
    config       = require(__dirname + '/../config.js'),
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
            var data = "";

            files.forEach(file => {
                data += childProcess.execSync("tesseract " + file + " stdout");
            });

            models.Document.create({
                name: format.name,
                fileName: filename,
                content: data
            }, function (err) {
                files.forEach(file => {
                    fs.unlink(file);
                });

                if (err) {
                    console.log(err);
                    return;
                }

                fs.renameSync(filePath, newPath);
            })
        });
    });
});