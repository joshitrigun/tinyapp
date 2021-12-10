const bcrypt = require("bcryptjs");

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

module.exports = {
  authenticateUser,
};
 