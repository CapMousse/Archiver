var fs          = require('fs'),
    db          = require(__dirname + '/../utils/mongodb.js'),
    models      = require(__dirname + '/../models'),
    stringUtil  = require(__dirname + '/../utils/string.js');

function render (res, total, page, tags) {
    search = "";

    res.render('tags/list', {
        numPages: Math.ceil(total/50),
        start: 1,
        curr: page,
        base: '/tags/page/',
        tags : tags,
        search : search
    });
}

module.exports = {
    list: (req, res) => {
        if (!!req.headers['x-read-only']) return res.redirect('/');
        
        var page = req.params.page || 1;

        req.session.search = "";

        models.Tag.find().limit(50).skip((page-1)*50).exec((err, tags) => {
            models.Tag.count((err, total) => {
                render(res, total, page, tags);
            });
        });
    },
    create:(req, res) => {
        if (!!req.headers['x-read-only']) return res.redirect('/');
        
        if (req.method == "POST") {
            models.Tag.create({
                name:       req.body.name,
                filter:     req.body.filter,
                isRegexp:   !!req.body.regexp
            }, () => {
                res.redirect(res.locals.rootUrl + '/tags');
            })
        } else  {
            res.render('tags/create');
        }
    },
    delete: (req, res) => {
        if (!!req.headers['x-read-only']) return res.redirect('/');
        
        var id = req.params.tag,
            backURL = req.header('Referer') || res.locals.rootUrl + '/';

        models.Tag.findById(id, (err, tag) => {
            models.Document.find({tags: { $in : [tag.name]}}, (err, documents) => {
                for (var i = 0; i < documents.length; i++) {
                    var index = documents[i].tags.indexOf(tag.name);
                    documents[i].tags.splice(index, 1);
                    documents[i].save();
                }

                tag.remove();
                res.redirect(backURL);
            });
        });
    },
    scan : (req, res) => {
        if (!!req.headers['x-read-only']) return res.redirect('/');
        
        var id = req.params.tag,
            backURL = req.header('Referer') || '/';

        models.Tag.findById(id, (err, tag) => {
            var regexp = new RegExp(stringUtil.escapeRegExp(tag.filter)),
                filters = {
                    content: regexp, 
                    tags: { $ne: tag.name }
                }

            if (tag.isRegexp) {
                regexp = tag.filter.match(/^\/(.*?)\/([gim]*)$/);
                if (!regexp) return;
                filters.content = new RegExp(regexp[1], regexp[2]);
            }

            models.Document.find(filters, (err, docs) => {
                docs.forEach( doc => {
                    doc.tags.push(tag.name);
                    doc.save();
                });

                res.redirect(backURL);
            })
        });
    }
}
