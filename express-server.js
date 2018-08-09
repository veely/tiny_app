const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

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

const users = {
  "coffeeman": {
    id: "coffeeman",
    email: "ilovestarbucks@coffee.com",
    password: "ilovestarbucks"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "ihatestarbucks@coffee.com",
    password: "dishwasher-funk"
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

// function checkIfOwner(userID) {
//   for (key in urlDatabase) {
//     if (urlDatabase[key].userID === userID) {
//       return true;
//     }
//   }
//   return false;
// }

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/urls", (req, res) => {
  let userID = req.cookies.user_id;
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
  let userID = req.cookies.user_id;
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
  let userID = req.cookies.user_id;
  shortURL = req.params.id;
  if (userID && urlDatabase[shortURL].userID === userID) {
    longURL = urlDatabase[shortURL].url;
    let userID = req.cookies.user_id;
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
  let longURL = urlDatabase[shortURL].url;
  res.redirect(longURL);
});

app.post("/urls/new", (req, res) => {
  let userID = req.cookies.user_id;
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].url = longURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect("/urls/" + shortURL);

});

app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies.user_id;
  let shortURL = req.body.delete;
  console.log(userID);
  console.log(shortURL);
  if (urlDatabase[shortURL].userID === userID){
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls/:id/edit", (req, res) => {
  let userID = req.cookies.user_id;
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
  if (user && user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let emailExists = checkExistingEmail(email);
  if (emailExists || !(req.body.password && req.body.email)) {
    // res.status(400).send('400: Bad Request!');
    res.sendStatus(400);
  }
  let userID = generateRandomString();
  let password = req.body.password;
  let passwordConfirm = req.body.password_confirm;
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});