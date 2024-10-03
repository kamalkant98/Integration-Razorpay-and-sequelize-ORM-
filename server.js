import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
// import {sqlDB,Users,Plan,Subscription} from "../database/database.js";

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import {Sequelize,Op} from "sequelize";
// import Users from "../Backend/src/models/users.model.js";





dotenv.config({
  path: "./env"
});

const app = express();


app.use(cors({
  origin : "*"
}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit:'100kb'}))
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
// app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/public'));

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
import {sqlDB,Users,Plan,Subscription} from "../Backend/src/database/database.js";
// sqlDB.sequelize.sync();
// console.log(sqlDB);


// let UserData = {
//   // name:"kamal",
//   email:"demo@gmail.com",
//   mobile:"12121212"
// }

// sqlDB.sequelize.sync()
//   .then(() => {
//     console.log('Database & tables created!');
//   });

// create a user
// Users.create(UserData)
//   .then(data => {
//     console.log('User created:', data);
//   })
//   .catch(err => {
//    console.log(err.message);
//   });

 


app.get('/', async (req, res) => {
 res.send('server is running!',)
});

app.get('/payment/:id', async(req, res) => {
  // res.sendFile(path.join(__dirname, 'public', 'payment.html'));
  const paymentId = req.params.id; 
// console.log(paymentId,"[[[");
  
  let KEY_ID = process.env.KEY_ID
  let KEY_SECRET = process.env.KEY_SECRET

  let orderData = await Subscription.findOne({
    where: {id:paymentId}, // Filtering condition
  });
  
  let getPlan = await Plan.findOne({
    where: { status: 'active',id:orderData.planId}, // Filtering condition
  });

  res.render('payment', { KEY_ID,orderData,getPlan});
   
});

import adminRoutes from "./src/routes/admin.route.js";
app.use("/admin", adminRoutes);
// app.use("/users", adminRoutes);

app.listen(8082, () => {
  console.log(`Example app listening on port http://localhost:8082/`);
});

export  {db};