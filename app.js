// --- Required Modules ---
// dotenv
// Use configuration entries in ".env" file
///////require("dotenv").config(); // results in Heroku errors
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');



if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Generic modules
const path = require("path");

// Express JS modules
const express = require("express");
const app = express();
const var_port = process.argv[2] || 5000;

// Express Layouts
const expressLayouts = require("express-ejs-layouts");

// passport config
require('./models/passport')(passport);


// Mongodb modules
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
const var_db = mongoose.connection;
var_db.on("error", (error) => {
    console.log(`Database error occured: ${error}`);
});
var_db.once("open", () => {
    console.log(`Successfully connected to database: ${var_db.name} on host: ${var_db.host}`);
});

// --- Settings ---
app.set("view engine", "ejs"); // Specify view engine to be EJS
app.set("views", path.join(__dirname, "views")); // Specify view directory
app.set("layout", path.join("layouts", "layout")); // Specify layout file to be used in project


//bodyparser
app.use(express.urlencoded({ extended: false }));

//express session
app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,

    }))
    //passport midleware  session
app.use(passport.initialize());
app.use(passport.session());

//connect-flsh here
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();

});


// --- Middleware ---
app.use(expressLayouts); // Explicitly indicate that expressLayouts will be used---express-ejs-layouts
app.use(express.static(path.join(__dirname, "public"))); // Configure public directory
app.use(express.static(__dirname + "/node_modules/bootstrap/dist")); // Configure Bootstrap

// --- Application Routers ---
const indexRouter = require("./routes/index");
const administrationRouter = require("./routes/administration");
const configRouter = require("./routes/config");
const etdsRouter = require("./routes/etds");
const syncRouter = require("./routes/sync");
const userRouter = require("./routes/user");

app.use("/", indexRouter);
app.use("/administration", administrationRouter);
app.use("/config", configRouter);
app.use("/etds", etdsRouter);
app.use("/sync", syncRouter);
app.use("/user", userRouter);

// --- Application ---
app.listen(var_port, () => {
    console.log(`smartirdeposit application running on port: ${var_port}`);
});