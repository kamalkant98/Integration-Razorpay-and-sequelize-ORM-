import Sequelize  from "sequelize";



// const sequelizeInstance = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//     operatorsAliases: false,
  
//     pool: {//pool configuration
//         max: 5,//maximum number of connection in pool
//         min: 0,//minimum number of connection in pool
//         acquire: 30000,//maximum time in ms that pool will try to get connection before throwing error
//         idle: 10000//maximum time in ms, that a connection can be idle before being released
//     }
// });

//     const db ={};
//     db.Sequelize = Sequelize;
//     db.sequelize = sequelizeInstance;
//     // db.students = require("./student.js")(sequelizeInstance, Sequelize);


const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: "localhost",
    dialect: "mysql",
  });
  
  
  
  
  const sqlDB = {};
  
  sqlDB.Sequelize = Sequelize;
  sqlDB.sequelize = sequelize;
  
  import UsersModel from "../models/users.model.js";
  import PlanModel from "../models/plan.model.js";
  import SubscriptionModel from "../models/subscription.model.js";
//   sqlDB.Users = require("")(sequelize, Sequelize);
  const Users = UsersModel(sequelize, Sequelize);
  const Plan = PlanModel(sequelize, Sequelize);
  const Subscription = SubscriptionModel(sequelize, Sequelize);


export {sqlDB,Users,Subscription,Plan};