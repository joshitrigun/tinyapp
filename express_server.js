const express = require("express");
const app = express();
const PORT = 9090;

app.set("view engine", "ejs");

const urlDatabase = {
  bz24: "http://www.megtechsoft.com",
  bbox: "http://bboxtech.com",
  par212: "http://google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
