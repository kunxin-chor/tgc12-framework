const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// bodyparser for processing webhooks
const bodyParser = require('body-parser');

const session = require('express-session')
const flash = require('connect-flash')

// session file store
const FileStore = require('session-file-store')(session);

// include in csurf
const csurf = require('csurf')


// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);


// load in our route files
const landingRoutes = require('./routes/landing'); 
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const cloudinaryRoutes = require('./routes/cloudinary');
const shoppingCartRoutes = require('./routes/shoppingCart')
const checkoutRoutes = require('./routes/checkout')

const api = {
  products: require('./routes/api/products')
}

// set up sessions
app.use(session({
  'store': new FileStore(),
  'secret': process.env.SESSION_SECRET,
  'resave': false,
  saveUninitialized: true
}))

// setup flash
app.use(flash());

// flash middleware
app.use(function(req,res,next){
  // res.locals refers to an object which keys are available in HBS files
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
})

// put the user data from the session into res.locals (any variables
// inside res.locals is available to the HBS file)
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  next();
})

// note: replaced app.use(csrf()) with the following:
const csurfInstance = csurf();
app.use(function(req,res,next){
  console.log("checking for csrf exclusion")
  // exclude whatever url we want from CSRF protection
  if (req.url === "/checkout/process_payment" || req.url.slice(0,5)==="/api/") {
    return next();
  }
  csurfInstance(req,res,next);
})

// app.use(function (err, req, res, next) {
//   if (err && err.code == "EBADCSRFTOKEN") {
//       req.flash('error_messages', 'The form has expired. Please try again');
//       res.redirect('back');
//   } else {
//       console.log("going next");
//       next()
//   }
// });

app.use(function(req,res,next){
  console.log("attempting to add csrf token")
  // check if CSRF is enabled for the current route
  if (req.csrfToken) {
    // if so, add to the hbs variables
    console.log("Adding csrf token")
    res.locals.csrfToken = req.csrfToken()
  }

  next();
})

async function main() {
 
  app.use('/', landingRoutes);
  app.use('/products', productRoutes)
  app.use('/users', userRoutes)
  app.use('/cloudinary', cloudinaryRoutes)
  app.use('/shoppingCart', shoppingCartRoutes)
  app.use('/checkout', checkoutRoutes)

  // all routes that are part of API must specify to use express.json middleware
  app.use('/api/products', express.json(), api.products);
  // app.use('/api/users', express.json(), api.users);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});