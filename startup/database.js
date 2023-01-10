const mysql = require('mysql2')
const { Sequelize } = require('sequelize');


 //async function(){
    const sequelize = new Sequelize("sakila","root","jacMastRoot@#145",{
        dialect: 'mysql',
        host: 'localhost'
    
    });
    
    async function authenticate(){
      
      try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error.message);
      }
    }
    
    //authenticate()

exports.sequelize = sequelize;
exports.authenticate = authenticate
//}