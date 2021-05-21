'use strict';
require('dotenv').config();
const routes = require('./routes.js')

const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport')
const session = require('express-session')
const {ObjectID} = require('mongodb')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt');
const auth = require('./auth.js');


const app = express();

app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());



// has a password

myDB(async (client)=>{
  const myDatabase = await client.db('database').collection('users');
  routes(app, myDatabase)
  auth(app, myDatabase)
})

.catch((e) =>{
  app.route('/').get((req,res) => {
    res.render('pug', {title: e, message:"Unable to login"})
  })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port http://localhost:' + PORT);
});
