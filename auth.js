const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const {ObjectID} = require('mongodb');

module.exports = (app, myDatabase) => {
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