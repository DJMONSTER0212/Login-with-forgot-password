const express = require("express");
const {registerUser, loginUser} = require("../controllers/userControllers")
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"devanshjain02122003@gmail.com",
        pass:"orjtxmsuvnbdsacz"
    }
})


router.post("/sign-up",registerUser);
router.post("/login",loginUser);
router.post("/forgot",async(req,res)=>{

    const {email} = req.body;    
    if(!email){
        res.status(401).json({status:401 ,message:"Enter your email"})
    }
    try {
        const user = await User.findOne({email});
        if(!user){
            res.status(404);
            throw new Error("User Not Found")
        }
        const token = jwt.sign({_id:user._id},process.env.SECRET,{
            expiresIn:"1d"
        })
        const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { verifyToken :token},{new:true})
        if(setUserToken){
            const mailOptions ={
                from :"devanshjain02122003@gmail.com",
                to:email,
                subject:"Password Reset Link",
                text:`This Link is valid for 2 min https://aquamarine-eclair-43a1a7.netlify.app/reset-password/${user._id}/${setUserToken.verifyToken}`
            }
            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log(error)
                    res.status(401).json({
                        status:401,
                        message:"Email not send"
                    })
                }else{
                    console.log("mail sent",info.response)
                    res.status(201).json({
                        status:201,
                        message:"Email send successfully"
                    })
                }
            })
        }
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: "Email not send"
        })
    }
})

router.get("/forgot/:id/:token",async(req,res)=>{
    const {id,token} = req.params;
    try {
        const validUser = await User.findOne({_id:id,verifyToken : token});
        const verifyToken = jwt.verify(token,process.env.SECRET)
        if(verifyToken._id&&validUser){
            res.status(201).json({
                status:201,
                validUser
            })
        }else{
            res.status(401).json({
                status: 401,
                message:"User Doesnot exist" 
            })
        }
    } catch (error) {
        res.status(401).json({
            status: 401,
            error
        })
    }
})


router.post("/reset/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const {password} = req.body;
    try {
        const validUser = await User.findOne({ _id: id, verifyToken: token });
        const verifyToken = await jwt.verify(token, process.env.SECRET)
        if (verifyToken._id && validUser) {
            const salt = await bcrypt.genSalt(10);
            const newpassword = await bcrypt.hash(password,salt)
            const setNewUser = await User.findByIdAndUpdate({_id:id},{password:newpassword});
            await setNewUser.save();
            res.status(201).json({
                status: 201,
                setNewUser,
                message: "Password changed successfully"
            })
        } else {
            res.status(401).json({
                status: 401,
                message: "User Doesnot exist"
            })
        }
    } catch (error) {
        res.status(401).json({
            status: 401,
            error
        })
    }
})
    


module.exports = router