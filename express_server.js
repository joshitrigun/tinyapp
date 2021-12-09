const express = require("express");
const app = express();
const PORT = 9090;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW",
//   },
// };
const urlDatabase = {
  bz24: "http://www.megtechsoft.com",
  bbox: "http://bboxtech.com",
  par212: "http://google.com",
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const userID = req.cookies["userID"];
  console.log(users[userID]);
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//EDIT

app.post("/urls/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

// login endpoint that responds with the new login
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies.username };
  res.render("urls_login", templateVars);
});

//login to express server
// app.post("/login", (req, res) => {
//   const userID = req.cookies["userID"];
//   if (userID) {
//     res.redirect("/urls");
//   } else {
//     res.status(403).send("Invalid User");
//   }
// });

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const user = findUsersByEmail(email);
  if (!user) {
    return res
      .status(403)
      .send("User with such email does not exist in database");
  }
  if (user.password !== password) {
    return res.status(403).send("password does not match");
  }
  res.cookie("userID", user.id);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

//registration
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies.username };
  res.render("urls_registration", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const user = findUsersByEmail(email);
  if (user) {
    return res.status(400).send("a user already exists with that email");
  }
  const userID = generateRandomString();
  users[userID] = {
    userID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log("users", users);
  res.cookie("userID", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
