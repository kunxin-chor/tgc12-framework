const express = require('express');
const router = express.Router();

// include in cryptography library
const crypto = require('crypto')

const {
    createRegistrationForm,
    bootstrapField,
    createLoginForm
} = require('../forms');

const {
    User
} = require('../models');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.get('/register', (req, res) => {
    const registrationForm = createRegistrationForm();
    res.render('users/register', {
        'form': registrationForm.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    const registrationForm = createRegistrationForm();
    registrationForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': getHashedPassword(form.data.password),
                'email': form.data.email
            })
            await user.save();
            req.flash("success_messages", "You have signed up successfully!");
            res.redirect('/login')
        }
    })
})

router.get('/login', (req, res) => {
    const form = createLoginForm();
    res.render('users/login', {
        'form': form.toHTML(bootstrapField)
    })
})

router.post('/login', async (req, res) => {

    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async function (form) {

            // 1. extract out the user by the provided email
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            })


            // 2. we check if the password given by the form matches the email in the user row
            if (user) {
                if (user.get('password') == getHashedPassword(form.data.password)) {
                    // 3. if the password matches, then it is a valid login, then save the user id
                    // to the session
                    req.session.user = {
                        'id': user.get('id'),
                        'username': user.get('username'),
                        'email': user.get('email')
                    }
                    req.flash('success_messages', "You have logged in successfully!")
                    res.redirect('/users/profile');

                } else {
                    // invalid password
                    req.flash("error_messages", "Invalid password");
                    res.redirect('/users/login')
                }
            } else {
                req.flash("error_messages", "User not found");
                res.redirect('/users/login');
            }
        }
    })
})

router.get('/profile', async (req, res) => {
    const user = req.session.user;
    if (user) {
        res.render('users/profile', {
            'user': user
        })
    } else {
        req.flash("error_messages", "You are not authorized to view this page");
        res.redirect('/users/login');
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null; // empty out the details of the logged in user
    req.flash("success_messages", "Goodbye");
    res.redirect('/users/login')
})

module.exports = router;