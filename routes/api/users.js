const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'username': user.get('username'),
        'id': user.get('id'),
        'email': user.get('email')
    }, secret, {
        'expiresIn': expiresIn
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User, BlacklistedToken } = require('../../models');
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
        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        let refreshToken = generateAccessToken(user, process.env.REFRESH_TOKEN_SECRET,"1d");
        res.json({
            accessToken, refreshToken
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

router.post('/refresh', async(req,res)=>{
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }

    // check if the provided token has been black listed
    const blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        'require': false
    })

    if (blacklistedToken) {
        res.status(401);
        return res.send("The provided refresh token has expired")
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err,user)=>{
        if (err) {
            return res.sendStatus(403);
        }
        // reload the user information from the database
        let userModel = await User.where({
            'email': user.email
        }).fetch({
            'require': false
        })
    

        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '15m')
        res.json({
            accessToken
        })
    })
})

router.post("/logout", async(req,res)=>{
    let refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        res.sendStatus(401);
    }
    else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const token = new BlacklistedToken();
                token.set('token', refreshToken);
                token.set('date_created', new Date());
                await token.save();
                res.json({
                    'message': 'Logged out'
                })
            }
        })
    }
})

module.exports = router;