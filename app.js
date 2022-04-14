const express = require("express");
const session = require("express-session");
const app = express();
const MongoStore = require("connect-mongo");
//The router variable will hold any exported code from the 'router.js' file.
const router = require("./router");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const { urlencoded } = require("express");
const flash = require("connect-flash");
const User = require("./models/User");

app.use(
  session({
    secret: process.env.SECRET_CODE,
    store: MongoStore.create({
      mongoUrl: process.env.CONNECTIONSTRING,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
    //1000ms = 1 sec * 60 (1 min) * 60 min (1 hr) * 24 (1 day)
  })
);

app.use(flash());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Set express static files for public consumption as root folders.
app.use(express.static("public"));

//Set the express views property to folder views
app.set("views", "views");

//Set the express view engine setting.
app.set("view engine", "ejs");

app.use("/", router);

//Set the listening port for the server.
//app.listen(3000, () => console.log("Server started."));
const server = require("http").createServer(app);
new User().checkDefaultUser();

module.exports = server;
