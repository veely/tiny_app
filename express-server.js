const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "coffeeman"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const password1 = "starbucks";
const hashedHardcode1 = bcrypt.hashSync(password1, 10);
const password2 = "asdfasdf";
const hashedHardcode2 = bcrypt.hashSync(password2, 10);

const users = {
  "coffeeman": {
    id: "coffeeman",
    email: "ilovestarbucks@coffee.com",
    password: hashedHardcode1
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "ihatestarbucks@coffee.com",
    password: hashedHardcode2
  }
}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function checkExistingEmail(email) {
  for (user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
}

function findUser(email) {
  for (user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  signed: false,
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render('register');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.end("You are not logged in!");
  }
  let templateVars = {
    user: users[userID],
    urlDb: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    let templateVars = {
      user: users[userID]
    };
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    res.end("Short URL doesn't exist!");
  }
  let userID = req.session.user_id;
  if (userID && urlDatabase[shortURL].userID === userID) {
    longURL = urlDatabase[shortURL].url;
    let userID = req.session.user_id;
    let templateVars = {
      user: users[userID],
      shortURL: shortURL,
      longURL: longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.end("Either this URL doesn't belong to you, or you must log in!")
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.end("Short URL doesn't exist!");
  }
  let longURL = urlDatabase[shortURL].url;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].url = longURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect("/urls/" + shortURL);

});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.body.delete;
  if (urlDatabase[shortURL].userID === userID){
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls/:id/edit", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.body.edit;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.body.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].url = longURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = findUser(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect login information!");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let emailExists = checkExistingEmail(email);
  if (emailExists) {
    res.status(400).send("This email is already registered!");
  }
  if (!(req.body.password && req.body.email)) {
    res.status(400).send("You must enter an email and a password to register!");
  }
  let userID = generateRandomString();
  let password = req.body.password;
  let passwordConfirm = req.body.password_confirm;
  if (password === passwordConfirm) {
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.end("Passwords don't match!");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});