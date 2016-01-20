var fs          = require('fs'),
    config      = require(__dirname + '/../config.js'),
    express     = require('express'),
    session     = require('express-session'),
    bodyParser  = require('body-parser');
    app         = express(),
    documents   = require(__dirname + '/controllers/documents.js')

app.use(session({
    secret: 'archiver',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
app.locals.moment = require('moment');

app.get('/', documents.list);
app.get('/page/:page', documents.list)
app.post('/search', documents.search);
app.get('/search', documents.search);
app.get('/search/page/:page', documents.search);
app.get('/download/:file', documents.download);
app.get('/delete/:file', documents.delete);

app.listen(config.port, () => {
    console.log('Archiver server runing on port '+config.port);
});