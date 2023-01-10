
const {sequelize} = require('../startup/database')
const {  DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken')
const config = require('config')


const RegisteredUser = sequelize.define('RegisteredUser', {
    regId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },

    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            len: [10,11]
        }
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull:false
    }
},{tableName: 'registeredusers'})

const generateAuthToken = function(object){
    const token = jwt.sign({regId: object.regId,phoneNumber:object.phoneNumber}, config.get('jwtPrivateKey'))
    return token;
}

exports.RegisteredUser = RegisteredUser;
exports.generateAuthToken = generateAuthToken;