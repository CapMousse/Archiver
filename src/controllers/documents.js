var fs          = require('fs'),
    fileType    = require('file-type'),
    config      = require(__dirname + '/../../config.js'),
    db          = require(__dirname + '/../utils/mongodb.js'),
    models      = require(__dirname + '/../models'),
    stringUtil  = require(__dirname + '/../utils/string.js');

function render (res, total, page, base, documents, search) {
    search = search || "";

    res.render('documents/list', {
        numPages: Math.ceil(total/50),
        start: 1,
        curr: page,
        base: base,
        documents : documents,
        search: search
    });
}

module.exports = {
    list: (req, res) => {
        var page = req.params.page || 1;

        req.session.search = "";

        models.Document.find().limit(50).skip((page-1)*50).exec((err, documents) => {
            models.Document.count((err, total) => {
                render(res, total, page, '/page/', documents);
            });
        });
    },
    search:(req, res) => {
        if (req.body.search) req.session.search = req.body.search;


        var search = req.session.search,
            page = req.params.page || 1,
            filters = {}, 
            i = 0, 
            match, placeholder;

        if (match = search.match(/([a-z]{1,}):"([a-zA-Z0-9-_ ]+)"/ig)) {
            for (; i < match.length; i++) {
                placeholder = match[i].split(":");

                if (placeholder[0] == "tag") placeholder[0] = "tags"; 
                if (placeholder[0] == "tags") placeholder[1] = placeholder[1].replace(",", "|");
                if (placeholder[0] == "type") {
                    if (placeholder[1].match(/img|images?/ig)) placeholder[1] = "jpg|jpeg|png|bmp|gif";
                    if (placeholder[1].match(/txt|md|text/ig)) placeholder[1] = "txt|md";
                } 
                filters[placeholder[0]] = new RegExp(stringUtil.escapeRegExp(placeholder[1]), "ig");
            }
        } else {
            filters = {
                $or : [
                    {content: new RegExp(stringUtil.escapeRegExp(search), "gi")},
                    {name: new RegExp(stringUtil.escapeRegExp(search), "gi")}
                ]
            }; 
        }

        models.Document.find(filters).limit(50).skip((page-1)*50).exec((err, documents) => {
            models.Document.count(filters, (err, total) => {
                render(res, total, page, '/search/page/', documents, search);
            });
        });
    },
    download: (req, res) => {
        var id = req.params.file;

        models.Document.findById(id, (err, document) => {
            fs.readFile(config.archiveDir + '/' + document.fileName, (err, data) => {
                if (err) return res.send('error');

                var type = fileType(data);

                if (type == null) {
                    res.contentType("text/plain");
                } else {
                    res.contentType(type.mime);
                }

                res.setHeader('Content-Disposition', 'attachement; filename="'+ document.fileName +'"');
                res.send(data);
            });
        });
    },
    delete: (req, res) => {
        var id = req.params.file,
            backURL = req.header('Referer') || '/';

        models.Document.findById(id, (err, document) => {
            document.remove();
            fs.unlinkSync(config.archiveDir + '/' + document.fileName);
            res.redirect(backURL);
        });
    }
}