const { assert } = require("chai");

const { getUsersByEmail, findUsersByEmail } = require("../helpers/userHelpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUsersByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUsersByEmail("user@example.com", testUsers);
    console.log(user);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user === expectedUserID, true);
  });
  it("should return null with valid email", function () {
    const user = getUsersByEmail("user12@example.com", testUsers);
    console.log(user);
    const expectedUserID = null;
    // Write your assert statement here
    assert.equal(user === expectedUserID, true);
  });
});
