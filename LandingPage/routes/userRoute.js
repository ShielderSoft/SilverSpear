const express = require('express');
const user = require('../models/user');

const userRouter = express.Router();

userRouter.post("/login", async(req, res)=>{
    try{
        const newUser = new user(req.body);
        await newUser.save();
        res.send({success: true, message: "user created"});
        console.log(newUser);
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Error happened")
    }
})

userRouter.get("/getusers", async(req,res)=>{
    try{
        const users = await user.find();
        res.send(users);
    }
    catch(err){
        res.send.status(500).send("error")
    }
})

module.exports = userRouter;