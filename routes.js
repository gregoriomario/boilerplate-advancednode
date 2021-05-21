require('dotenv').config();

const passport = require('passport');
const bcrypt = require('bcrypt');
const { Passport } = require('passport');

module.exports = (app, myDatabase) => {
    app.route('/').get((req, res) => {
        res.render('pug', {title: "Connected to Database", message:'Please Login', showLogin: true, showRegistration: true, showSocialAuth: true});
    });

    app.route('/auth/github').get(passport.authenticate('github'))

    app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect: '/'}), (req,res) => {
        res.redirect('/profile')
    })

    app.route('/register').post((req,res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDatabase.findOne({username: req.body.username}, (err,user) => {
        if(err){
            next(err)
        }
        else if (user){
            console.log('username is already been used')
            res.redirect('/')
        }
        else{
            myDatabase.insertOne({
            username: req.body.username,
            password: hash
            }, (err, doc) => {
            if(err){
                res.redirect('/')
            }
            else{
                next(null, doc.ops[0])
            }
            })
        }
        })
    }, passport.authenticate('local', {failureRedirect: '/'}), (req,res) => {
        res.redirect('/profile')
    })

    app.route('/login').post(passport.authenticate('local', {failureRedirect: '/'}), (req,res) => {
        res.redirect('/profile')
    })

    app.route('/profile').get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
    })

    app.route('/logout').get((req,res) => {
        req.logout();
        res.redirect('/')
    })

    app.use((req,res,next)=>{
        res.status(404)
        .type('text')
        .send('Not Found')
    })

    // middleware function
    function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/');
    }
}