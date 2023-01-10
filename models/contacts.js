const {sequelize} = require('../startup/database')
const {  DataTypes } = require('sequelize');
const { User } = require('./user');
const { RegisteredUser } = require('./registeredUser')

const Contact = sequelize.define('Contacts', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'userId'
        }
    },

    contactOf:{
        type: DataTypes.INTEGER,
        references: {
          model: RegisteredUser,
          key: 'regId'
        }
    }

 },{tableName: 'contacts'})

 exports.Contact = Contact