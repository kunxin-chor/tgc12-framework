const express = require('express');

// create a router
// a router matches a URL to a function --> i.e, create a route
const router = express.Router();

router.get('/', (req,res)=>{
    res.render('landing/index')
})

router.get('/about', (req,res)=>{
    res.render('landing/about')
})

router.get('/contact-us', (req,res)=>{
    res.render('landing/contact-us')
})

// remember to export out router
module.exports = router;