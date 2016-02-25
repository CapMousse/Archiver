var fs          = require('fs'),
    config      = require(__dirname + '/../config.js'),
    express     = require('express'),
    session     = require('express-session'),
    bodyParser  = require('body-parser');
    app         = express(),
    documents   = require(__dirname + '/controllers/documents.js'),
    tags        = require(__dirname + '/controllers/tags.js');
 
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
app.locals.moment = require('moment');
app.locals.rootUrl = config.rootUrl.replace(/\/+$/, '') || '';

app.use(session({
    secret: 'archiver',
    resave: false,
    saveUninitialized: true
}));
app.use(function (req, res, next) {
    res.locals.rootUrl = app.locals.rootUrl;
    res.locals.readOnly = !!req.headers['x-read-only'];
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/download', express.static(config.archiveDir)); 

app.get('/', documents.list);
app.get('/page/:page', documents.list);
app.post('/search', documents.search);
app.get('/search', documents.search);
app.get('/search/page/:page', documents.search);
app.get('/delete/:file', documents.delete);

app.get('/tags', tags.list);
app.get('/tags/page/:page', tags.list);
app.get('/tags/create', tags.create);
app.post('/tags/create', tags.create);
app.get('/tags/delete/:tag', tags.delete);
app.get('/tags/scan/:tag', tags.scan);

app.listen(config.port, () => {
    console.log('Archiver server runing on port '+config.port);
});
