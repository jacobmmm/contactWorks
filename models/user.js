const {sequelize} = require('../startup/database')
const {  DataTypes } = require('sequelize');
const { RegisteredUser } = require('./registeredUser')

const User = sequelize.define('Users', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },

    regId: {
        type: DataTypes.INTEGER,
        references: {
          model: RegisteredUser,
          key: 'regId'
        }
      },

    firstName: {
        type: DataTypes.STRING,
       
        validate:{
            len: [0,30]
        }
    },

    lastName: {
        type: DataTypes.STRING,
       
        validate:{
            len: [0,30]
        },

        defaultValue: null
    },

    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            len: [10,11]
        }
    },
    
    email: {
        type: DataTypes.STRING,
        
        validate:{
            isEmail:true
        }
    },

    spam:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },

    contactOf:{
        type: DataTypes.INTEGER,
        references: {
          model: RegisteredUser,
          key: 'regId'
        }
    }

 },{tableName: 'users'})

 exports.User = User