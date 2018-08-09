const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "asdf123": {
    id: "coffeeman",
    email: "ilovestarbucks@coffee.com",
    password: "ilovestarbucks"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "ihatebucks@coffee.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDb: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.body.delete;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:id/edit", (req, res) => {
  let shortURL = req.body.edit;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.body.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (req.body.password && req.body.email) {
    let userID = generateRandomString();
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirm = req.body.password_confirm;
    users[userID] = {
      id: username,
      email: email,
      password: password
    };
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else {
    // res.status(400).send('400: Bad Request!');
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});