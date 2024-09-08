import Sequelize  from "sequelize";



const sequelizeInstance = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    operatorsAliases: false,
  
    pool: {//pool configuration
        max: 5,//maximum number of connection in pool
        min: 0,//minimum number of connection in pool
        acquire: 30000,//maximum time in ms that pool will try to get connection before throwing error
        idle: 10000//maximum time in ms, that a connection can be idle before being released
    }
});

    const db ={};
    db.Sequelize = Sequelize;
    db.sequelize = sequelizeInstance;
    // db.students = require("./student.js")(sequelizeInstance, Sequelize);

export {db};