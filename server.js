import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import dotenv from "dotenv";
// import {Sequelize,Op} from "sequelize";
// import Users from "../Backend/src/models/users.model.js";





dotenv.config({
  path: "./env"
});

const app = express();


app.use(cors({
  origin : "*"
}));

app.use(express.json({limit:'100kb'}))
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// const db={};

// URL : https://imagekit.io/
// ImageKit
// user : social@surpriseking.com	
// Pass : eEz=m*L4xZSG
// Imagekit ID*. :    gr9gvq8ow


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});



// console.log(conn,"===");
// db.connect(async(err,connection) => {
//   if (err) {
//     console.error("Error connecting to database:", err);
//     return;
//   }
//  console.log("Connected to database!");
// });

// console.log(db);

// const {sqlDB} = require("./app/models");
import {sqlDB,Users} from "../Backend/src/database/database.js";
// sqlDB.sequelize.sync();

let User= sqlDB.Users

let UserData = {
  // name:"kamal",
  email:"demo@gmail.com",
  mobile:"12121212"
}

// sqlDB.sequelize.sync()
//   .then(() => {
//     console.log('Database & tables created!');
//   });
Users.create(UserData)
  .then(data => {
    console.log('User created:', data);
  })
  .catch(err => {
   console.log(err.message);
  });

 


app.get('/', async (req, res) => {
 res.send('server is running!',)
});

import adminRoutes from "./src/routes/admin.route.js";
app.use("/admin", adminRoutes);
// app.use("/users", adminRoutes);

app.listen(8082, () => {
  console.log(`Example app listening on port http://localhost:8082/`);
});

export  {db};