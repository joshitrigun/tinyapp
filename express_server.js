const express = require("express");
const app = express();
const PORT = 9090;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};

const urlDatabase = {
  bz24: "http://www.megtechsoft.com",
  bbox: "http://bboxtech.com",
  par212: "http://google.com",
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
