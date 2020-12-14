const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
    res.render("register")
);

// Register
router.post("/register", (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please enter all fields" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
        });
    } else {
        User.findOne({ email: email }).then((user) => {
            if (user) {
                errors.push({ msg: "Email already exists" });
                res.render("register", {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then((user) => {
                                req.flash(
                                    "success_msg",
                                    "You are now registered and can log in"
                                );
                                res.redirect("/users/login");
                            })
                            .catch((err) => console.log(err));
                    });
                });
            }
        });
    }
});

router.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email' , 'profile'] }
));

router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
});

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true,
    })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
});

router.post("/changeicon", (req, res) => {
    User.findById(req.user._id).then((user) => {
        var newIcon = (user.icon + parseInt(req.body.data))
        newIcon = (newIcon == 9) ? 1 : ((newIcon == 0)? 8 : newIcon)
        user.icon = newIcon
        user.save()
        res.end(newIcon.toString())
    })
});

module.exports = router;