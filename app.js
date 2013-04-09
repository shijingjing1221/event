
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , oauth_client = require('./lib/oauth_client');

var app = express();

// Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/event');

var ejs = require('ejs');
ejs.open = '{%';
ejs.close = '%}';

app.configure(function(){
  app.set('port', process.env.PORT || 3100);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(oauth_client.auth);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// englishclass
var englishclassRouter = require('./routes/englishclass');
app.get('/englishclass', englishclassRouter.index);
app.post('/api/classes', englishclassRouter.createClass);
app.get('/api/classes', englishclassRouter.getClasses);
app.get('/api/classes/:id', englishclassRouter.getClass)
app.put('/api/classes/:id', englishclassRouter.updateClass);
app.del('/api/classes/:id', englishclassRouter.deleteClass);

// session
app.get('/api/sessions/:id', routes.getSession);
app.del('/api/sessions/:id', routes.deleteSession);
app.post('/api/sessions', routes.createSession);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
