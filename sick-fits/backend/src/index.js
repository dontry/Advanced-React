// let's go!
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

//GRAPHQL Server
const server = createServer();

// TODO: handle cookies(JWT)
// TODO: populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(
      `Server is now running on port  https://localhost:${deets.port}`
    );
  }
);
