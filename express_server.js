const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {
  urlsForUser,
  generateRandomString,
  findUsersByEmail,
} = require("./helpers/userHelpers");
const { users, urlDatabase } = require("./helpers/userData");

const app = express();
const PORT = 8000;
app.set("view engine", "ejs");
app.use(logger("dev"));
//app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["I am Trigun, and I like apples"],
  })
);

//registration
app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  const templateVars = { user: users[userID] };
  res.render("urls_registration", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const user = findUsersByEmail(email);
  if (user) {
    return res.status(400).send("a user already exists with that email");
  }
  const newUser = {
    id: generateRandomString(),
    email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  // console.log("users", users);
  console.log(newUser.password);
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect("/urls");
});

// login endpoint that responds with the new login
app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  //fetch the values from the form(email, password)
  const { email, password } = req.body;
  //check if user and password exists
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  //check if user exists, if not eject
  const user = findUsersByEmail(email, users);
  if (!user) {
    return res
      .status(403)
      .send("User with such email does not exist in database");
  }
  //check if password matches, if not eject
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("password does not match");
  }
  //assign a cookies, with the values of the user email
  req.session.user_id = user.id;
  //redirect to the appropiate page
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// redirecting - GET
// redirects to the long (actual) url
app.get("/u/:shortURL", (req, res) => {
  let tempID = req.session.user_id;
  let urlsObject;
  if (tempID) {
    urlsObject = fetchUsersURLsObj(urlDatabase, tempID);
  } else {
    urlsObject = fetchUrlsDatabase(urlDatabase);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  console.log("longURL", longURL);

  console.log(urlsObject);
  res.redirect(longURL);
});

// new url creation - POST
// adds new url to database, redirects to short url page
app.post("/urls/new", (req, res) => {
  console.log("I am here");
  const userID = req.session.user_id;
  if (userID === undefined) {
    return res.redirect("/login");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//EDIT
// updates longURL if url belongs to user
app.post("/urls/:shortUrl", (req, res) => {
  let cookieVal = req.session.user_id;
  if (cookieVal == undefined) {
    return res.redirect("/login");
  }
  const shortUrl = req.params.shortUrl;
  const longURL = req.body.longURL;
  const capVar = urlDatabase[shortUrl];
  if (capVar.userID === cookieVal) {
    capVar.longURL = longURL;
  } else {
    return res.send("you cannot edit it");
  }

  res.redirect("/urls");
});

//urls index page -GET
//shows urls that belong to the user
app.get("/", (req, res) => {
  //console.log(req.cookies, req.headers.cookie);
  const user = req.session.user_id;
  //console.log(req.cookies.user_id);
  if (!user) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  //let urlsObject = {};
  // if (userID != undefined) {
  //   urlsObject = fetchUsersURLsObj(urlDatabase, userID);
  // } else {
  //   urlsObject = fetchUrlsDatabase(urlDatabase);
  // }
  const userUrls = urlsForUser(userID, urlDatabase);

  const templateVars = {
    urls: userUrls,
    user: users[userID],
    // user_id: req.cookies.user_id,
  };
  if (!userID) {
    res.statusCode = 401;
  }
  res.render("urls_index", templateVars);
});
// new url creation page - GET
// validates if the user is logged in before displaying page
app.get("/urls/new", (req, res) => {
  // // console.log("userID", req.cookies.userID);
  // const longURL = req.body.longURL;
  // res.cookie("longURL", longURL);
  // const userID = req.cookies["user_id"];
  // if (userID === undefined) {
  //   return res.redirect("/login");
  // }
  // const templateVars = {
  //   user_id: req.cookies.user_id,
  //   longURL: req.body.longURL,
  // };
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[req.params.shortURL];
  //const userID = req.cookies["user_id"];
  const userId = req.session.user_id;
  console.log(userId);

  const user = users[userId];
  const templateVars = {
    shortURL,
    url,
    user: user,
    longURL: url.longURL,
  };
  // const templateVars = {
  //   shortURL,
  //   url,
  //   user_id: req.cookies.user_id,
  //   longURL: req.cookies.longURL,
  // };
  res.render("urls_show", templateVars);
});

app.get("/urls/longURL", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    longURL: req.body.longURL,
  };

  res.render("urls_show", templateVars);
});

// short url page - GET
// shows details about the url if it belongs to user

app.post("/urls/:id/delete", (req, res) => {
  console.log("hey I am here");
  let cookieVal = req.session.user_id;
  if (cookieVal == undefined) {
    return res.redirect("/login");
  }
  const idToDelete = req.params.id;
  const capVar = urlDatabase[idToDelete];
  if (capVar.userID === cookieVal) {
    delete urlDatabase[idToDelete];
  } else {
    return res.send("you cannot delete it");
  }

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
