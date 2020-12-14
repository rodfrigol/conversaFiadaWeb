const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        if (user.password === null){
          return done(null, false, { message: 'This email is registered with Google' })
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use(new GoogleStrategy({
      clientID:     '77508320355-cghkms9dv14jasunauu5p67kv6885kg2.apps.googleusercontent.com',
      clientSecret: '7xmWrUW9_kluJHLdgEdLloFe',
      callbackURL: "http://localhost:5000/users/auth/google/callback",
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
      User.findOne({email: profile.email}).then((user) => {
        if (!user){
          new User({
            name: profile.displayName,
            email: profile.email,
            googleId: profile.id
          }).save((err,room) => {
            return done(null, room);
          })
        }else{
          if(user.googleId === profile.id){
            return done(null, user);
          }else{
            return done(null, false, { message: 'This email is already in use' })
          }
        }
      })
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

};
