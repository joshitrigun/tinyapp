const bcrypt = require("bcryptjs");
const { users, urlDatabase } = require("./userData");
const authenticateUser = (email, password, db) => {
  const potentialUser = db[email];
  // Check if user exists, if not eject
  if (!potentialUser) {
    return { err: "No user with that email", data: null };
  }
  // Check if password matches, if not eject
  const passwordMatching = bcrypt.compareSync(password, potentialUser.password);
  if (!passwordMatching) {
    return { err: "Password not matching", data: null };
  }
  return { err: null, data: potentialUser };
};

const urlsForUser = function (id, urlDatabase) {
  const result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }

  return result;
};

const generateRandomString = function () {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 6);
};

//this function is added to pass test requirement
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
const getUsersByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user.id;
    }
  }
  return null;
};
module.exports = {
  urlsForUser,
  generateRandomString,
  findUsersByEmail,
  getUsersByEmail,
  fetchUsersURLsObj,
  fetchUrlsDatabase,
};
