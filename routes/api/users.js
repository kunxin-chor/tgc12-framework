const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const generateAccessToken = (user) => {
    return jwt.sign({
        'username': user.get('username'),
        'id': user.get('id'),
        'email': user.get('email')
    }, process.env.TOKEN_SECRET, {
        'expiresIn': '1h'
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User } = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

// login the user
router.post('/login', async(req,res)=>{
    // get the user by their email address
    // assuming that we login via email
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        'require': false
    })

    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        // create the token
        let accessToken = generateAccessToken(user);
        res.json({
            accessToken
        })
    } else {
        res.status(401);
        res.json({
            'message': "Invalid credientials"
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.send(user);
})

module.exports = router;