require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const {ObjectID} = require('mongodb');

const GitHubStrategy = require('passport-github')

module.exports = (app, myDatabase) => {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    }, (accessToken, refreshToken, profile, cb) => {
        console.log(profile)
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        myDatabase.findOne({_id: new ObjectID(id)}, (err, doc) => {
        done(null, doc)
        })
    })

    passport.use(new LocalStrategy((username, password, done) => {
        myDatabase.findOne({username: username}, (err, user) => {
        console.log(`User ${username} is trying to login`);
        if(err){
            return done(err)
        }
        if(!user){
            console.log('username doesnt exist')
            return done(null, false)
        }
        if(!bcrypt.compareSync(password, user.password)){
            return done(null, false)
        }
        return done(null, user)
        })
    }))
}