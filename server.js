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
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

const MongoStore = require('connect-mongo');
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI});

// Session Config
app.use(
  session({
      secret: process.env.SUPER_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
          mongoUrl: URI
      })
  })
);


const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
}));

app.use(passport.initialize());
app.use(passport.session());

// middleware
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
)



myDB(async (client)=>{
  const myDatabase = await client.db('database').collection('users');
  routes(app, myDatabase)
  auth(app, myDatabase)


  let currentUsers = 0;
  io.on('connection', socket =>{
    console.log(`User ${socket.request.user.name} connected`);
    ++currentUsers;
    io.emit('user count', currentUsers);

    socket.on('disconnect', () => {
      console.log('A user has disconnect');
      --currentUsers;
      io.emit('user count', currentUsers);
    })
  });
})

.catch((e) =>{
  app.route('/').get((req,res) => {
    res.render('pug', {title: e, message:"Unable to login"})
  })
})

function onAuthorizeSuccess(data, accept){
  console.log('successfully connect');
  accept(null,true)
}
function onAuthorizeFail(data, message, error, accept){
  if(error) throw new Error(message);
  console.log('failed to connect to server', message);
  accept(null, false)
}


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port http://localhost:' + PORT);
});
