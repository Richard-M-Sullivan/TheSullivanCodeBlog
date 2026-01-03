const express = require('express');
const handlebars = require('express-handlebars')
        .create({defaultLayout: 'main'});

// how to do an include
//let fortunes = require('./lib/fortunes.js');

// create applicaiton
const app = express();

// app settings
app.disable('x-powered-by');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8080);

// static files
// css dir "./styles/"
// media dir "./media/"
// htmx dir "./htmx"
// js dir "./javascript"
app.use(express.static(__dirname + '/public'));

// routes - with a template
//app.get('/', function(req, res) {
//  res.render('home');
//});
//
//app.get('/about', function(req, res) {
//  res.render('about',
//    { fortune: fortunes.getFortune() }
//  );
//});

app.get('/', function (req, res) {
  // http.HandlerFunc(handlers.IndexHandler)
  // this one is simple, just need to render a single template
  res.render('home');
});

app.get('/blog', function(req, res) {
  // http.HandlerFunc(handlers.BlogHandler)
  // this one is simple, just need to render a single template
  res.render('blog');
});

app.get('/project', function(req, res) {
  // http.StripPrefix('/project', handlers.ProjectHandlers()
  // this one is more complicated. I will need to write some ajax requests for
  // this one
  res.render('project');
});

app.get('/tutorial', function(req, res) {
  // http.HandlerFunc(handlers.TutorialHandler)
  // this one is more complicated. I will need to write some ajax requests for
  // this one
  res.render('tutorial');
});

app.get('/note', function(req, res) {
  // http.StripPrefix('/note', handlers.NotesHandlers()
  // this one is more complicated. I will need to write some ajax requests for
  // this one
  res.render('note');
});

app.get('/resume', function(req, res) {
  // http.HandlerFunc(handlers.ResumeHandler)
  // this one is simple, just need to render a single template
  res.render('resume');
});

app.get('/support', function(req, res) {
  // http.HandlerFunc(handlers.SupportHandler)
  // this one is simple, just need to render a single template
  res.render('support');
});

//custom 404 page
app.use(function(req, res) {
  res.status(404)
  //res.render('404');
  res.send('404: Page not found.');
});

// custom 505 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(505);
  //res.render('505');
  res.send('505: Internal server error.');
});

// launch application
app.listen(app.get('port'), function() {
  console.log(
    'Express started on http://localhost:' +
    app.get('port') + '; serving The Sullivan Code Blog.\n\n' +
    'Press Ctrl-C to terminate.'
  );
});

