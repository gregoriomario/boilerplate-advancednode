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
        myDatabase.findOneAndUpdate({id:profile.id},
            {$setOnInsert:{
                id: profile.id,
                me: profile.displayName || 'Greg Titan',
                photo: profile.photos[0].value || '',
                email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
                created_on: new Date(),
                provider: profile.provider || ''
            }, $set: {
                last_login: new Date()
            }, $inc: {
                login_count: 1
            }
        }, {upsert: true, new: true}, (err, doc) => {
            return cb(null, doc.value)
        });
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