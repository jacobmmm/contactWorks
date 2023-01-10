const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { RegisteredUser, generateAuthToken } = require('../models/registeredUser')
const { User } = require('../models/user')
const { Op, Sequelize } = require('sequelize');
const auth  = require('../middleware/auth')

const readline = require("readline");
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

router.post('/register', async(req,res) => {

    const salt = await bcrypt.genSalt(18);
    const password = await bcrypt.hash(req.body.password, salt)

    const rUser = await RegisteredUser.findOne({ where: { phoneNumber: req.body.phoneNumber } });

    if(rUser) return res.status(400).send('User already registered')

    const regUser = {
        
        phoneNumber: req.body.phoneNumber,
        password: password,
        
    };
    
    await RegisteredUser.create(regUser)
    
    console.log('registered user created')

    const regstUser = await RegisteredUser.findOne({where: { phoneNumber: req.body.phoneNumber }})
    console.log(regstUser.regId)
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email
    }

    const userContacts = req.body.contacts
    
    const gUser = await createGlobalUser(userData, regstUser.regId)
    const cUsers = await createContactUser(userContacts, regstUser.regId)
    console.log(gUser)
    const userTypes = {
        registeredUser: regUser,
        globalUser: gUser,
        contactUsers: cUsers
    }

    res.send(userTypes)
    
})

router.get('/login', async(req,res) => {

    const rUser = await RegisteredUser.findOne({where: {phoneNumber: req.body.phoneNumber}})

    if(!rUser)return res.status(400).send('Invalid phone or password')

    const validPassword = await bcrypt.compare(req.body.password, rUser.password)
    if(!validPassword) return res.status(400).send('Invalid  password')

    const token = generateAuthToken(rUser)
    
    
    res.header('x-auth-token', token).send(_.pick(rUser,['regId','phoneNumber']))

})

router.post('/incall/:phNum', auth, async(req,res) => {

const userId = req.rUser.regId
console.log(userId)

var incNumber = req.params.phNum

const contactUser = await User.findOne({ where: { contactOf:userId, phoneNumber:incNumber}})
const globalUserSpam = await User.findOne({ where: { phoneNumber:incNumber, spam: true, firstName: null, lastName: null }})

if(contactUser){
    
    return res.status(200).send(_.pick(contactUser,['firstName','lastName','phoneNumber','spam']))
} 

else if(globalUserSpam){

    return res.send(_.pick(globalUserSpam,['firstName','lastName','phoneNumber','spam']))
} 

else{
    
    res.send({firstName:'Unknown',lastName:'Unknown','phoneNumber':incNumber,'spam':false})

}

})

router.post('/spam/:phNum', auth, async(req, res) => {

    var incNumber = req.params.phNum
    console.log(incNumber)
    const spam = req.body.choice == 'yes' 

    const spamUser = await User.findOne({where: {phoneNumber:incNumber}})

    if(spamUser)
    {
        console.log('Number present')
        await User.update({spam:spam},{where:{phoneNumber:incNumber}})
        res.send({phoneNumber: incNumber, spam:spam})
    }
    
    else
    {
        console.log('Number not present')
        await User.create({phoneNumber: incNumber, spam:spam})
        res.send({phoneNumber: incNumber, spam:spam})
    }
        
})

router.get('/searchName/:name',auth, async(req, res) => {

    const searchName = req.params.name
    
    console.log(searchName)
    const usersFName = await User.findAll({ attributes:['firstName','lastName','phoneNumber','spam'], where: { firstName: searchName  } })
    const usersLName = await User.findAll({ attributes:['firstName','lastName','phoneNumber','spam'], where: { lastName: { [Op.like]:`%${searchName}%` }  } })
    const users = await Promise.all([usersFName,usersLName])
    const cUsers=combineUsers(users)
    res.send(cUsers)

})

router.get('/searchPhoneNo/:phNum',auth, async(req, res) => {

    const logUserRegId = req.rUser.regId;
    const logUserNumber = req.rUser.phoneNumber
    const phNum = req.params.phNum

    console.log(logUserNumber)
    
    const registrPerson = await User.findOne({where: { phoneNumber:phNum, regId:{ [Op.not]: null } }})
    
    if(registrPerson){
        const loginUser = await User.findOne({where: {  regId:logUserRegId, phoneNumber:logUserNumber, contactOf:registrPerson.regId }})

        if(loginUser){ 
            res.send({user:(_.pick(registrPerson,['firstName','lastName','phoneNumber','spam','email'])),allUsers:[],isRegistered:true})
        }

        else{
        
            res.send({user:(_.pick(registrPerson,['firstName','lastName','phoneNumber','spam'])),allUsers:[],isRegistered:true})
            
        }
    }
    
    else {
        const users = await User.findAll({ attributes:['firstName','lastName','phoneNumber','spam'],  where: { phoneNumber:phNum  } })
        res.send({user:{},allUsers:users,isRegistered:false})
    }

})

router.get('/click', auth, async(req,res) => {
   const userRegId = req.rUser.regId;
   const userNumber = req.rUser.phoneNumber;
   console.log('regId on clicking',userRegId)
   const { firstName, lastName, phoneNumber } = req.query

   const registrPerson = await User.findOne({where: { firstName:firstName, lastName:lastName, phoneNumber:phoneNumber, regId:{ [Op.not]: null } }})

   if(registrPerson){
    const user = await User.findOne({where: {  regId:userRegId, phoneNumber:userNumber, contactOf:registrPerson.regId }})

    if(user) return res.send(_.pick(registrPerson,['firstName','lastName','phoneNumber','spam','email']))

    else return res.send(_.pick(registrPerson,['firstName','lastName','phoneNumber','spam']))
    }
   
   else {
    const person = await User.findOne({ where: { firstName:firstName, lastName:lastName, phoneNumber:phoneNumber } })
    return res.send(_.pick(person,['firstName','lastName','phoneNumber','spam']))
   } 

   } )

const createGlobalUser = async function(userData,userId){
    
    const flag=0;

    const user = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        regId: userId 
    }

    console.log('user.firstName',user.firstName)

    const existingUser = await User.findOne({where:{phoneNumber: user.phoneNumber}})

    if(existingUser){

    await User.update({regId:user.regId, email:user.email, firstName: user.firstName, lastName: user.lastName },
        {where:{phoneNumber: user.phoneNumber}})

    console.log('Reg user already present in DB')
    return user
    
    }
        
    else{ 

       await User.create(user)
       return user;
    
    }

    return undefined

}

const createContactUser = async function(userContacts,userId){

    const cUsers = []
    let contactLength = userContacts.length;
    let i = 0;
    
    while(i<contactLength){

    const regstUser = await User.findOne({ where: { phoneNumber:userContacts[i].phoneNumber, regId:{ [Op.not]: null }  } })

    if(regstUser){

        const user = {
            firstName: userContacts[i].firstName,
            lastName: userContacts[i].lastName,
            phoneNumber: regstUser.phoneNumber,
            email: userContacts[i].email,
            contactOf: userId,
            regId: regstUser.regId
        }

        console.log('Contact user is registeredUser')
        await User.create(user)
        cUsers.push(user)

    }
    
    else{
    const user = {
        firstName: userContacts[i].firstName,
        lastName: userContacts[i].lastName,
        phoneNumber: userContacts[i].phoneNumber,
        email: userContacts[i].email,
        contactOf: userId
    }

    console.log("User",(i),": ",user)
    await User.create(user)
    cUsers.push(user)
   }
    
   i++;

    }

    return cUsers

  }

  const combineUsers = function(users){
    const cUsers = []
    const length = users.length
    const combined = [...users[0], ...users[1]]
    return combined;
}

module.exports = router
