const express = require('express');
const handlebars = require('express-handlebars')
        .create({defaultLayout: 'main'});

const fs = require('fs');

// create applicaiton
const app = express();

// app settings
app.disable('x-powered-by');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));

const pages = new Set(
  fs.readdirSync('views', { recursive: true })
    .filter(f => f.endsWith('.handlebars'))
    .map(f => f.slice(0, -'.handlebars'.length))
    .filter(f => !f.startsWith('layouts/') && !f.startsWith('partials/'))
);

app.get('/', function (req, res) {
  res.render('home');
});

app.use(function (req, res, next) {
  let path = req.path.slice(1);
  if (pages.has(path)) return res.render(path);

  // no view found pass on to the next view
  next();
});


//custom 404 page
app.use(function(req, res) {
  res.status(404)
  res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// launch application
app.listen(app.get('port'), function() {
  console.log(
    'Express started on http://localhost:' +
    app.get('port') + '; serving The Sullivan Code Blog.\n\n' +
    'Press Ctrl-C to terminate.'
  );
});

