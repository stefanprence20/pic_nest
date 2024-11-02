const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');

const bodyParser = require('body-parser');
const errorHandlers = require('./handlers/errorHandlers');

const routes = require('./routes/index');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());
app.use(session({ cookie: { maxAge: 60000 },
    secret: 'secret',
    resave: false,
    saveUninitialized: false}));

app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
    /* Development Error Handler - Prints stack trace */
    app.use(errorHandlers.developmentErrors);
}

module.exports = app;