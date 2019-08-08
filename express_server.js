const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString(n) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let short = '';
  for (let i = 0; i < n; i++) {
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

const getUserID = function(email,select) {
  const userKeys = Object.keys(users);
  let usr = '';
  let pass = "";
  for (let user of userKeys) {
    if (users[user].email === email) {
      usr = users[user].id;
      pass = users[user].password;
    }
  }
  switch (select) {
    case 1:
      return usr;
      break;
    case 2:
      return pass;
      break;
    default:
      return usr;
  }
};



const checkEmail = function(email) {
  const usersKey = Object.keys(users);
  // console.log(usersKey," <---> ",email);
  // const getEmail = users.find(emailFound => users[id].email === email);
  for (let user of usersKey) {
    // console.log(user, " email = ", users[user].email);
    if (users[user].email === email) {
      return true;
    } else {
      // console.log('content user[user].email = ', users[user].email);
      // return false;
    }
  } 
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const email = req.cookies.emailID;
  const userKeys = Object.keys(users);
  let usr = '';
  let pass = "";
  for (let user of userKeys) {
    if (users[user].email === req.cookies.emailID) {
      usr = users[user].id;
      pass = users[user].password;
    }
  };
  console.log("Found user = ", usr, " == ", pass);
  let templateVars = { urls: urlDatabase, 
   userID: usr,
   emailID: req.cookies.emailID,
   passwordID: pass
  };
  if (req.cookies.emailID) {
    res.cookie("userID", usr);
    res.cookie("passwordID", pass);
    res.cookie("emailID", email);
  }
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
  // console.log(req.body);  // Log the POST request body to the console
  const char = generateRandomString(6);
  urlDatabase[char] = req.body.longURL;
  // res.send(res.statusCode = 302);         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls/" + char);
  // console.log(urlDatabase);
  
});

app.post("/logout", (request, response) => { //post logout

  
  // console.log("LOGout --->", request.body);
  response.clearCookie("emailID");
  response.clearCookie("userID");
  response.clearCookie("passwordID");
  response.redirect("/urls");
  // response.render("urls_index");
});

app.post("/urls/:url/delete", (request, response) => { //delete function
  delete urlDatabase[request.params.url];
  // console.log(urlDatabase);
  response.redirect("/urls");
});

app.post("/urls/:id", (request, response) => {
  const nURL = request.body.newURL;
  const id = request.params.id;
  urlDatabase[id] = nURL;
  // console.log(urlDatabase);
  response.redirect(`/urls/${id}`);
});

app.post("/login", (request, response) => { //set cookies
  if (!checkEmail(request.body.emailID)) {
    response.status(403).send("Can't find your email on DB, Please register");
    return;
  }
  const tempPass = getUserID(request.body.emailID, 2);
  if (tempPass !== request.body.passwordID) {
    response.status(403).send("Password doesn't match, please re-login");
    return;
  }
  // console.log("Test ---> ",request.body);
  response.cookie("userID", (getUserID(request.body.emailID, 1))); //passing userid to cookie
  response.cookie("emailID",request.body.emailID);
  response.cookie("passwordID", (getUserID(request.body.emailID, 2))); //passing password to cookie 
  response.redirect("/urls");
  // response.render("urls_index", templateVars);
});

app.post("/register", (request, response) => { //append registry data, cookie
  // console.log("Register this ---> ", request.body);
  
  const user = request.body;
  // console.log("user data ---> ", user);
  // console.log("before checking for email ---> ", users);
  if (request.body.emailID === '' || request.body.passwordID === '') {
    response.status(400).send("Either empty password or email!");
    // response.redirect("/register");
    console.log("Found either empty email or password");
    return;
  };    
  // console.log("Current users db befor checking email : ", users); // check for users database before checking existing email
  // const found = checkEmail(request.body.emailID);
  if (checkEmail(request.body.emailID)) {
    console.log("Found Email existed on database!!!!");
    response.status(400).send("Found email entered existed on Database, Please register with new email");
    // response.redirect("/register");
    return;
  } else {
    console.log("not found",request.body.emailID);
  };
  users[request.body.userID] = {};
  response.cookie("emailID", request.body.emailID);  //go back to this if wrong ,request.body.userID
  users[request.body.userID].id = generateRandomString(4);
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

app.get("/login", (request, response) => {
  response.render("user_login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});