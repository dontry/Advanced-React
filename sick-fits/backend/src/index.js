// let's go!
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//GRAPHQL Server
const server = createServer();
server.express.use(cookieParser());

// TODO: handle cookies(JWT)
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

// TODO: populate current user
server.express.use(async (req, res, next) => {
  if (req.userId) {
    const user = await db.query.user(
      { where: { id: req.userId } },
      `{id, permissions, email, name}`
    );
    req.user = user;
  }
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(
      `Server is now running on port  http://localhost:${deets.port}`
    );
  }
);
