const express = require('express')
const app = express();
const mysql = require('mysql2')
const { Sequelize, DataTypes } = require('sequelize');
const _ = require('lodash');
const Joi = require('joi')
const bcrypt = require('bcrypt');
const config = require('config')
const jwt = require('jsonwebtoken')


const {sequelize, authenticate} = require('./startup/database')
authenticate()
const {RegisteredUser, generateAuthToken} = require('./models/registeredUser')
const { User } = require('./models/user')
const { Contact } = require('./models/contacts')

sequelize.sync(/*{force:true}*/).then((result) => {
    console.log(result)
}).catch((error) => {
    console.log(error.message)
})

require('./startup/routes')(app)





/*app.use(express.json());

app.post('/api/register', async(req,res) => {

    const salt = await bcrypt.genSalt(18);
    const password = await bcrypt.hash(req.body.password, salt)

    const rUser = await RegisteredUser.findOne({ where: { phoneNumber: req.body.phoneNumber } });

    if(rUser) return res.status(400).send('User already registered')

    const regUser = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        password: password,
        contacts: req.body.contacts,
    };
    
    RegisteredUser.create(regUser).then( async(result) => {
        console.log(result)
        const rUser = await RegisteredUser.findOne({where: { phoneNumber: req.body.phoneNumber }})
        console.log(rUser.regId)
        createGlobalUser(req, res, rUser.regId)
        createContactUser(req,res)
        
        

        
        
    }).catch((error) => {
        console.log(error.message)
    })

    const token = generateAuthToken(regUser)

    res.header('x-auth-token', token).send(_.pick(regUser, ['regId','name','phoneNumber']))

})

app.post('/api/login', async(req,res) => {

    const rUser = await RegisteredUser.findOne({where: {phoneNumber: req.body.phoneNumber}})

    if(!rUser)return res.status(400).send('Invalid email or password')

    const validPassword = await bcrypt.compare(req.body.password, rUser.password)
    if(!validPassword) return res.status(400).send('Invalid  password')

    const token = generateAuthToken(rUser)
    
    res.header('x-auth-token', token).send('Login successful')

    

})



const createGlobalUser = async function(req,res,userId){
    const rUser = await RegisteredUser.findOne({where: { phoneNumber: req.body.phoneNumber }})
    console.log(rUser.regId)

    const user = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        regId: userId 
    }

    User.create(user).then( async(result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error.message)
    })



}

const createContactUser = async function(req,res){

    let contactNames = req.body.contacts.name
    let contactNumbers = req.body.contacts.phoneNumber
    let contactEmail = req.body.contacts.email

    let contactLength = contactNames.length;

    console.log("contactLength",contactLength)
    console.log('Users contacts: ')
    console.log('Names: ',contactNames)
    console.log('Numbers: ',contactNumbers)
    console.log('Email: ',contactEmail)

    let i = 0;

    while(i<contactLength){
     
    const user = {
        name: contactNames[i],
        phoneNumber: contactNumbers[i],
        email: contactEmail[i],
    }

    console.log("User",(i),": ",user)

  

    pushUser(user)
    
    i++;

    }

}

const pushUser = async function(u){

    await User.create(u)

}*/


const port = process.env.PORT || 3000
app.listen(port,() => console.log(`Listening on port ${port}....`));