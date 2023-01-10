const express = require('express')

const userRoutes = require('../appRoutes/userRoutes')

module.exports = function(app){

app.use(express.json());

app.use('/api/user',userRoutes)

}

