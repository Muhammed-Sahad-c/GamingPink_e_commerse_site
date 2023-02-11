/* MODULES */
const createError = require('http-errors');
const express = require('express');
const path = require('path');

const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
var Handlebars = require('handlebars');

// requiring session 
const session = require('express-session')

// DB  connection
const db = require('./config/connection')

const adminRouter = require('./routes/Admin');
const userRouter = require('./routes/User');
const { url } = require('inspector');


const app = express();

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//setting template engine
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/'
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//using session
app.use(session({
  secret: 'Keyboard cat',
  cookie: {
    maxAge: 6660000
  }
}))


//cookie code
app.use(function (req, res, next) {
  if (!req.user) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});


// de connection and status
db.connect((err) => {
  if (err) {
    console.log("db is not connectedd " + err);
  }
  else {
    console.log('db connected.....');

  }
});








app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/* temp  */
function sahad() {
  console.log('xxxxx  ******  *     *  ****** ******')
  console.log('x      *    *  *     *  *    * *    *')
  console.log('xxxxx  ******  *******  ****** *    *')
  console.log('    x  *    *  *     *  *    * *    *')
  console.log('xxxxx  *    *  *     *  *    * ******')
}


app.listen(3000, () => {
  console.log('Server Started....')
  console.log(`running on 3000......`)
})

