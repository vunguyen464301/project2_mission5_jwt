var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt= require('jsonwebtoken');
const config = require('../config');
//set time code_jwt 5m
var CODE_TOKEN = "";

router.get('/profile', isLoggedIn, (req, res, next) => {
  res.render('user/profile');
});

router.get('/signout', isLoggedIn, (req, res, next) => {
  // res.redirect('/');
});

router.get('/signup',function(req,res,next){
  res.render('user/signup');
});

router.post('/signup',(req,res,next)=>{
  if( req.body.email.length==0 || req.body.password.length==0){
    res.render('user/signup',{message:'Please input email or password !'});
  }
  else{
    User.findOne({'email':req.body.email},(err,user)=>{
      // if(err){
      //     return done(err);
      // }
      if(user){
          res.render('user/signup',{message:'Email is already in use !'});
      }else{
          var newUser = new User();
          newUser.email= req.body.email;
          newUser.password=newUser.encrpytPassword(req.body.password);
          newUser.save((err,task)=>{
              if(err){
                res.render('user/signup',{message:err});
              }
              res.redirect('/user/profile');
          });
      }
  });
  }
});


router.get('/signin',function(req,res,next){
  res.render('user/signin');
});

router.post('/signin',(req,res,next)=>{
  if( req.body.email.length==0 || req.body.password.length==0){
    res.render('user/signin',{message:'Please input email or password !'});
  }
  else{
    User.findOne({'email':req.body.email},(err,user)=>{
      if(user){
        if(!user.validPassword(req.body.password)){
          res.render('user/signin',{message:'Password is wrong !'});
        }else{
          var token =jwt.sign({
            email:user.email,
            userID:user._id
          },config.secret,{algorithm:'HS256',expiresIn:config.tokenLife});
          CODE_TOKEN=token;
        console.log(CODE_TOKEN)
          res.redirect('./profile'); 
        }
      }else{
          res.render('user/signin',{message:'Email is already in use !'});
      }
  })
  }
});

function isLoggedIn(req, res, next) {
  console.log(CODE_TOKEN)
    var token = CODE_TOKEN;
    // decode token
    if (token.length!=0) {
    jwt.verify(token,config.secret,(err,decode)=>{
        if(err){
          CODE_TOKEN="";
          res.redirect('./signin');
        }else{
            return next();
        }
    });
    } else {
      res.redirect('./signin');
    }
}

module.exports = router;
