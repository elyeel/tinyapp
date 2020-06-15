const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const { getUserByEmail, generateRandomString, checkEmail, urlsForUser } = require("./helpers");


let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "abc@abc.com",
    password: "abc"
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};


// All Routes start from here
// homepage
app.get("/", (req, res) => {
  if (users[req.session.emailID]) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

// going to urls that exist in database
app.get("/urls", (req, res) => {
  const emailID = req.session.emailID;
  if (!emailID) {
    res.status(403).send("Please Log-in before continuing!");
    return res.redirect("/login");
  }

  const userID = getUserByEmail(emailID, users, 1);
  const urlDB = urlsForUser(userID, urlDatabase);
  console.log(urlDB);

  let templateVars = { urls: urlDB,
    userID: userID,
    emailID: req.session.emailID
  };
  
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// create new url page
app.get("/urls/new", (request, response) => {
  if (!request.session.emailID) {
    response.redirect("/login");
    return;
  }
  const templateVars = { emailID: request.session.emailID};
  response.render("urls_new", templateVars);
});

// post new url
app.post("/urls", (req, res) => {
  if (req.session.emailID) {
    const char = generateRandomString(6);
    const userID = getUserByEmail(req.session.emailID, users, 1);
    urlDatabase[char] = {};
    urlDatabase[char].longURL = req.body.longURL;
    urlDatabase[char].userID = userID;
    // res.send(res.statusCode = 302);         // Respond with 'Ok' (we will replace this)
    res.redirect("/urls/" + char);
  } else {
    res.send("Please Login");
  }
});

// logout process, post logout
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/urls");
});

// delete an url, delete  url function
app.post("/urls/:url/delete", (request, response) => {
  const email = request.session.emailID;
  const user = getUserByEmail(email, users, 1);
  if (email && users[user] && email === users[user].email) {
    delete urlDatabase[request.params.url];
  }
  response.redirect("/urls");
});

// add new url route
app.post("/urls/:id", (request, response) => {
  const email = request.session.emailID;
  const user = getUserByEmail(email, users, 1);
  const nURL = request.body.newURL;
  const id = request.params.id;
  if (email && users[user] && email === users[user].email) {
    urlDatabase[id].longURL = nURL;
    urlDatabase[id].userID = user;
  }
  response.redirect(`/urls`);
});

// login process and login verification
app.post("/login", (request, response) => { //set cookies
  if (!checkEmail(request.body.emailID, users)) {
    response.redirect('/register');
    return;
  }
  const tempPass = getUserByEmail(request.body.emailID, users, 2);
  console.log(request.body.passwordID,tempPass);
  if (!bcrypt.compareSync(request.body.passwordID, tempPass)) {
    response.status(403).send("Password doesn't match, please re-login");
    return;
  }
  const emailID = request.body.emailID;
  request.session.emailID = emailID;
  response.redirect("/urls");
});

// registration process, set cookie, append registry data, cookie
app.post("/register", (request, response) => {
  const user = request.body;
  if (request.body.emailID === '' || request.body.passwordID === '') {
    response.status(400).send("Empty password and/or email!");
    console.log("Found either empty email or password");
    return;
  }
  if (checkEmail(request.body.emailID, users)) {
    console.log("Found Email existed on database!!!!");
    response.status(400).send("Found email entered existed on Database, Please register with new email");
    return;
  }
  const userID = generateRandomString(4);
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = user.emailID;
  users[userID].password = bcrypt.hashSync(user.passwordID, 10);

  request.session.emailID = user.emailID;  //go back to this if wrong ,userID
  response.redirect("/urls");
});

// link to shortened URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    console.log(req.params.short);
    res.redirect(longURL.longURL);
  } else {
    res.send("The URL does not exist");
  }
});

// display longURL/shortURL page
app.get("/urls/:shortURL", (req, res) => { //add the verification
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

// get registration page, if logged in redirect to urls otherwise register
app.get("/register", (request, response) => {
  if (request.session.emailID) {
    response.redirect('/urls');
  } else {
    response.render("user_reg");
  }
});

app.get("/login", (request, response) => {
  const templateVars = {
    user: request.session.userID,
    email: request.session.emailID
  }
  response.render("user_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});