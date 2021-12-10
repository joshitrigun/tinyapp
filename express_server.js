const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
const { authenticateUser } = require("./helpers/userHelpers");

const PORT = 9090;
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};
// curl -X POST -i localhost:9090/urls/b6UTxQ/delete
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  user1ID: {
    id: "user1ID",
    email: "user@gmail.com",
    password: "123456",
  },
  user2ID: {
    id: "user2ID",
    email: "user2@example.com",
    password: "123465",
  },
};
const findUsersByEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
const fetchUsersURLsObj = (urlDatabase, id) => {
  const urlsObject = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID == id) {
      urlsObject[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlsObject;
};
const fetchUrlsDatabase = () => {
  const urlsObject = {};
  for (let urls in urlDatabase) {
    urlsObject[urls] = urlDatabase[urls].longURL;
  }
  return urlsObject;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//additional end point
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//urls index page -GET
//shows urls that belong to the user

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  //console.log(users[userID]);

  let urlsObject = {};
  if (userID != null) {
    urlsObject = fetchUsersURLsObj(urlDatabase, userID);
  } else {
    urlsObject = fetchUrlsDatabase(urlDatabase);
  }
  const templateVars = { urls: urlsObject, user: users[userID] };
  res.render("urls_index", templateVars);
});

// new url creation - POST
// adds new url to database, redirects to short url page
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID === undefined) {
    return res.redirect("/login");
  }

  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: userID };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// new url creation page - GET
// validates if the user is logged in before displaying page
app.get("/urls/new", (req, res) => {
  // console.log("userID", req.cookies.userID);

  const userID = req.cookies["user_id"];
  if (userID === undefined) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

// short url page - GET
// shows details about the url if it belongs to user
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[req.params.shortURL];
  const userID = req.cookies["user_id"];
  const templateVars = {
    shortURL,
    url,
    user: users[userID],
  };
  res.render("urls_show", templateVars);
});

// redirecting - GET
// redirects to the long (actual) url
app.get("/u/:shortURL", (req, res) => {
  let tempV = req.cookies.user_id;
  let urlsObject;
  if (tempV) {
    urlsObject = fetchUsersURLsObj(urlDatabase, tempV);
  } else {
    urlsObject = fetchUrlsDatabase(urlDatabase);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  console.log("longURL", longURL);

  console.log(urlsObject);
  res.redirect(longURL);
});

// app.get("/u/:shortURL", (req, res) => {
//   const id = req.cookies.user_id;
//   let urlsObj;
//   if (id) {
//     urlsObj = fetchUrlsObj(urlDatabase, id);
//   } else {
//     urlsObj = fetchUrlDatabase(urlDatabase);   }   const longURL = urlsObj[req.params.shortURL];   //console.log(urlsObj, longURL);   res.redirect(longURL); });

//EDIT
// updates longURL if url belongs to user
app.post("/urls/:shortUrl", (req, res) => {
  let cookieVal = req.cookies.user_id;
  if (cookieVal == null) {
    return res.redirect("/login");
  }
  const shortUrl = req.params.shortUrl;
  const longURL = req.body.longURL;
  const userURL = fetchUsersURLsObj(urlDatabase, cookieVal);
  for (let shorturl in userURL) {
    if (shorturl == shortUrl) {
      urlDatabase = {
        ...urlDatabase,
        [shortUrl]: { longURL: longURL, userID: cookieVal },
      };
      return res.redirect("/urls");
    }
  }
  res.redirect("longURL");
});

app.post("/urls/:id/delete", (req, res) => {
  let cookieVal = req.cookies.user_id;
  if (cookieVal == null) {
    return res.redirect("/login");
  }
  const idToDelete = req.params.id;
  const userURL = fetchUsersURLsObj(urlDatabase, cookieVal);
  for (let shortUrl in userURL) {
    if (shortUrl == idToDelete) {
      delete urlDatabase[idToDelete];
    }
  }

  res.redirect("/urls");
});

// login endpoint that responds with the new login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
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
  const user = findUsersByEmail(email);
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
  res.cookie("user_id", user.id);
  //redirect to the appropiate page
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//registration
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  res.render("urls_registration", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password);
  if (!email || !hashedPassword) {
    return res.status(400).send("email and password cannot be blank");
  }
  const user = findUsersByEmail(email);
  if (user) {
    return res.status(400).send("a user already exists with that email");
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    hashedPassword,
  };
  // console.log("users", users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
