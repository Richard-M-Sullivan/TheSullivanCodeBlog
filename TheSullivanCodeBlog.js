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
  res.render('home');
});

app.get('/blog', function(req, res) {
  res.render('blog');
});

app.get('/project', function(req, res) {
  res.render('project');
});

app.get('/project/homebrew-computer/introduction', function(req, res) {
  res.render('project/homebrew-computer/introduction');
});

app.get('/project/homebrew-computer/logic-gates', function(req, res) {
  res.render('project/homebrew-computer/logic-gates');
});

app.get('/project/homebrew-computer/logisim', function(req, res) {
  res.render('project/homebrew-computer/logisim');
});

app.get('/project/homebrew-computer/chips', function(req, res) {
  res.render('project/homebrew-computer/chips');
});

app.get('/project/homebrew-computer/prototype', function(req, res) {
  res.render('project/homebrew-computer/prototype');
});

app.get('/project/homebrew-computer/final-design', function(req, res) {
  res.render('project/homebrew-computer/final-design');
});

app.get('/project/homebrew-computer/parts', function(req, res) {
  res.render('project/homebrew-computer/parts');
});

app.get('/project/homebrew-computer/final-assembly', function(req, res) {
  res.render('project/homebrew-computer/final-assembly');
});

app.get('/project/homebrew-computer/next-steps', function(req, res) {
  res.render('project/homebrew-computer/next-steps');
});

app.get('/tutorial', function(req, res) {
  res.render('tutorial');
});

app.get('/note', function(req, res) {
  res.render('note');
});

app.get('/resume', function(req, res) {
  res.render('resume');
});

app.get('/support', function(req, res) {
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

