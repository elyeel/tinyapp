const getUserByEmail = function(email, users, select) { //gets pass or userid by email
  const userKeys = Object.keys(users);
  let usr = undefined;
  let pass = undefined;
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

function generateRandomString(n) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let short = '';
  for (let i = 0; i < n; i++) {
    const random = Math.floor(Math.random() * 62);
    short += chars[random];
  }
  return short;
};

module.exports = { getUserByEmail, generateRandomString }