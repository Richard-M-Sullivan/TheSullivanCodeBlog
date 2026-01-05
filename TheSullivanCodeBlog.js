const express = require('express');
const handlebars = require('express-handlebars')
        .create({defaultLayout: 'main'});

const fs = require('fs');
// how to do an include
//let fortunes = require('./lib/fortunes.js');

// create applicaiton
const app = express();

// app settings
app.disable('x-powered-by');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

let autoViews = {};

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/blog', function(req, res) {
  res.render('blog');
});

app.get('/project', function(req, res) {
  res.render('project');
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

app.use(function (req, res, next) {
  let path = req.path.toLowerCase();
  // check cache; if it's there, render the view
  if (autoViews[path]) return res.render(autoViews[path]);
  // if it is not in the cache, see if there is a .handlebars file that
  // matches.
  if ( fs.existsSync(__dirname + '/views' + path + '.handlebars') ) {
    autoViews[path] = path.replace(/^\//, '');
    return res.render(autoViews[path]);
  }
  // no view found pass on to the next view
  next();
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

