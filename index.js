const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

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

async function main() {
 
  app.use('/', landingRoutes);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});