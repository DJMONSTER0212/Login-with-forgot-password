const generateToken = require("../gentoken/generateToken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const registerUser = async(req,res)=>{
    const {name,email,password} = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please enter all the Fields");
    }
    const exiUser = await User.findOne({email});
    if(exiUser){
        res.status(400);
        throw new Error("user already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    const user = await User.create({
        name,
        email,
        password:hashedPassword
    });
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Failed to create a new user ")
    }

};
const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    // console.log("hello")
    if(!email||!password){
        res.status(400);
        throw new Error("Enter all the Fields");
    }
    const user = await User.findOne({email});
    if(!user){
        res.status(404);
        throw new Error("User Not Found");
    }
    const result = await bcrypt.compare(password, user.password);
    // console.log(result)
    if(user&& result){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }
}

module.exports = {registerUser,loginUser}