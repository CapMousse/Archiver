var fs          = require('fs'),
    config      = require(__dirname + '/../../config.js'),
    db          = require(__dirname + '/../utils/mongodb.js'),
    models      = require(__dirname + '/../models');

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function render (res, total, page, base, documents, search) {
    search = search || "";

    res.render('index', {
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
            filters = {
                $or : [
                    {content: new RegExp(escapeRegExp(search))},
                    {name: new RegExp(escapeRegExp(search))}
                ]
            };

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

                res.contentType("application/pdf");
                res.setHeader('Content-Disposition', 'attachement; filename="'+ document.fileName +'"');
                res.send(data);
            });
        });
    }
}

