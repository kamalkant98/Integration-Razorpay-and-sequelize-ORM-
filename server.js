import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import dotenv from "dotenv";
// import Sequelize  from "sequelize";
// import {db}  from "./src/database/database.js";
// const { QueryTypes } = require('sequelize');
// import {QueryTypes} from "sequelize"
// import Sequelize from "sequelize";


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
db.connect(async(err,connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
 console.log("Connected to database!");
});

// console.log(db);

// const sequelizeConn = new Sequelize(process.env.DB_DATABASE,process.env.DB_USER, process.env.DB_PASSWORD, {
//   host:  process.env.DB_HOST,
//   dialect:'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
// });

// try {
//   await sequelizeConn.authenticate();
//   console.log('Connection has been established successfully asdasd.');
// } catch (error) {
//   console.error('Unable to connect to the database:', error);
// }

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