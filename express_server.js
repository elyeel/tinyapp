const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let short = '';
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * 62);
    short += chars[random];
  }
  return short;
}
// console.log(generateRandomString());

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
  }
};

const checkEmail = function(email) {
  const usersKey = Object.keys(users);
  // const getEmail = users.find(emailFound => users[id].email === email);
  for (let user of usersKey) {
    if (users[user].email === email) {
      return true;
    } else {
      return false;
    }
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, 
   username: req.cookies["username"]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const char = generateRandomString();
  urlDatabase[char] = req.body.longURL;
  // res.send(res.statusCode = 302);         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls/" + char);
  console.log(urlDatabase);
  
});

app.post("/logout", (request, response) => { //post logout

  
  console.log("LOGout --->", request.body);
  response.clearCookie("username");
  response.redirect("/urls");
  // response.render("urls_index");
});

app.post("/urls/:url/delete", (request, response) => { //delete function
  delete urlDatabase[request.params.url];
  console.log(urlDatabase);
  response.redirect("/urls");
});

app.post("/urls/:id", (request, response) => {
  const nURL = request.body.newURL;
  const id = request.params.id;
  urlDatabase[id] = nURL;
  console.log(urlDatabase);
  response.redirect(`/urls/${id}`);
});

app.post("/login", (request, response) => { //set cookies
   
  console.log("Test ---> ",request.body);
  response.cookie("username",request.body.username);
  response.redirect("/urls");
  // response.render("urls_index", templateVars);
});

app.post("/register", (request, response) => { //append registry data, cookie
  // console.log("Register this ---> ", request.body);
  users[request.body.userID] = {};
  const user = request.body;
  // console.log("user data ---> ", user);
  console.log(users);
  if (request.body.emailID === '' || request.body.passwordID === '') {
    response.status(400).send("Either empty password or email!");
    // response.redirect("/register");
    console.log("Found either empty email or password");
    return;
  };
  if (checkEmail(request.body.emailID)) {
    console.log("Found Email existed on database!!!!");
    response.status(400).send("Found email entered existed on Database, Please register with new email");
    // response.redirect("/register");
    return;
  };
  
  response.cookie("username", request.body.userID);
  users[request.body.userID].id = user.userID;
  users[request.body.userID].email = user.emailID;
  users[request.body.userID].password = user.passwordID;
  // console.log(users);
  response.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/register", (request, response) => {
  response.render("user_reg");
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});