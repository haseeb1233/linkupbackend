const jwt=require("jsonwebtoken");
require("dotenv").config();

const {UserModel}=require("../models/user.model")

const auth = async(req,res,next)=>{
    const token = req.headers.authorization;
    console.log(token)
    try {
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const {userId}=decoded
            if(decoded){
                 const user= await UserModel.findById(userId)
                req.user=user;
                next()
            }else{
                res.send({ msg: "pls login first token is incorrect" });
            }

        }else{
            res.send({ msg: "please login first" });
        }


    } catch (error) {
        console.log(error.message);
        res.send({ msg: error.message });
    }
}


module.exports={
    auth
}