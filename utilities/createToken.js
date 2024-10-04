const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;
const maxAge = "1y";

const createToken = (payload) => {
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: maxAge,
  });
  return token;
};

module.exports = createToken;
