const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "user.db");
const bcrypt = require("bcrypt");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

/*API 1 CREATE A NEW 
REGISTER IN THE DATABASE
 */
app.post("/api/signup/", async (request, response) => {
  const { name, email, id } = request.body;

  const selectUserQuery = `SELECT * FROM user WHERE email = '${email}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (email.endsWith("@gmail.com") === false) {
      response.status(400);
      response.send("Invalid email format");
    } else {
      const insertNewUser = `INSERT INTO user
      (id, name, email)
      VALUES (${id},'${name}','${email}');`;
      const newUser = await db.run(insertNewUser);
      response.status(200);
      response.send("Successful user sign-up");
    }
  } else {
    response.status(400);
    response.send("Email already registered");
  }
});

// API 2 CREATE USER POSTS
app.post("/api/posts/", async (req, res) => {
  const { id, content } = req.body;
  const getUserDetails = `SELECT * FROM user WHERE id = ${id};`;
  const response = await db.get(getUserDetails);
  if (response === undefined) {
    res.status(404);
    res.send("User ID not found");
  } else if (content === "") {
    res.status(400);
    res.send("Content cannot be empty");
  } else {
    const createPost = `
  INSERT INTO POSTS(content,id)
  VALUES ('${content}', ${id});
  `;
    const getResponse = await db.run(createPost);
    const lastid = getResponse.lastID;
    res.status(200);
    res.send("Successfully created");
  }
});

// API 3 DELETE USER POSTS BASED ON POST ID

app.delete("/api/deletepost/:postId/", async (req, res) => {
  const { postId } = req.params;
  const getPostId = `SELECT post_id FROM POSTS WHERE post_id = ${postId};`;
  const getResponse = await db.get(getPostId);
  console.log(getResponse);
  if (getResponse === undefined) {
    res.status(404);
    res.send("Post ID not found");
  } else {
    const deletePost = `DELETE FROM POSTS WHERE post_id = ${postId};`;
    const getDeleteResponse = await db.run(deletePost);
    res.status(200);
    res.send("Successful post deletion");
  }
});

//Fetch User's Posts API

app.get("/api/:userId/posts", async (request, response) => {
  const { userId } = request.params;
  const getPostQuery = `
    SELECT
      *
    FROM
      posts
    WHERE
      id = ${userId};`;
  const query = await db.get(getPostQuery);
  response.send(query);
});

module.exports = app;
