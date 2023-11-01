const express=require("express")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {UserModel}=require("../models/user.model")
const {auth}=require("../middleware/auth.middleware")
const userRouter=express.Router()


// register



userRouter.post("/register",async(req,res)=>{

    try {
        
        let {username,email,password}=req.body

           console.log(username,email,password)
        const userexist= await UserModel.findOne({email})
        console.log(userexist)

        if(userexist){
            res.status(200).json({ message: "email already exists" });
        }else{
            bcrypt.hash(password, 5, async function(err, hash) {
                console.log(hash)
                req.body.password=hash
                const user =new UserModel(req.body)

                await user.save()
                res.status(200).json({ message: "user successfully registered" });
            });

           
        }
    
       

    } catch (error) {
        res.status(400).send({ message: error.message });
    }

})

// Login

userRouter.post("/login",async(req,res)=>{
       try {
        const {email,password}=req.body

        const user=await UserModel.findOne({email})
        if(user){
            bcrypt.compare(password,user.password, function(err, result) {
                if(result){
                    const token = jwt.sign(
                        { userId: user._id, user: user.email },
                        process.env.JWT_SECRET,
                        {
                          expiresIn: "3d",
                        }
                      );
                      const refreshtoken = jwt.sign(
                        { userId: user._id, user: user.email },
                        process.env.REFRESH_SECRET,
                        {
                          expiresIn: "7d",
                        }
                      );

                      res.send({
                        msg: "login successfully",
                        token: token,
                        refreshtoken: refreshtoken,
                        user: user,
                      });
                }else{
                    res.status(200).json({ msg: "Invalid  password" });
                }
            });
        }else{
            res.status(200).send({ msg: "User not found, Please Register" });
          return;
        }

       } catch (error) {
        res.status(401).json({ msg: error.message });
       }


})


// get friends

userRouter.get("/friends/:id",auth, async(req,res)=>{
  try {
    
    const user = await UserModel.findById(req.params.id);
    const friends = await Promise.all(
      user.following.map((friendId) => {
        return UserModel.findById(friendId);
      })
    );

    let friendList = [];
  friends.map((friend) => {
    const { _id, username, profilePicture } = friend;
    friendList.push({ _id, username, profilePicture });
  });
  console.log(friendList)
  res.status(200).json(friendList)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
    
  }
})
// update 

userRouter.put("/update",auth,async(req,res)=>{
      
      if(req.user._id==req.body.id||req.user.isAdmin){
        if(req.body.password){
          bcrypt.hash(req.body.password, 5, async function(err, hash) {
            console.log(hash,"hi")
            req.body.password=hash
            await UserModel.findByIdAndUpdate(req.body.userId,{$set:req.body})
          res.send({msg:"Account has been updated"})
        });
        }else{
          try {
            await UserModel.findByIdAndUpdate(req.body.userId,{$set:req.body})
            res.send({msg:"Account has been updated"})
          } catch (error) {
            res.send({msg:error.message})
          }
        }
      }else{
        res.json("you cannot update others account")
      }
})

// delete user

userRouter.delete("/delete",auth,async(req,res)=>{
  if(req.user._id==req.body.id||req.user.isAdmin){
    try {
      await UserModel.findByIdAndDelete(req.body.userId)
      res.send({msg:"Account has been deleted"})
    } catch (error) {
      res.send({msg:error.message})
    }
  }else{
    res.json("pls login first")
  }
        
})


// get a user
   
   userRouter.get("/",auth,async(req,res)=>{
    const username=req.query.username;
    const userid=req.query.userid
    console.log(userid)
    try {
      if(username){
        const user =await UserModel.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
       res.status(200).json(other);

      }else if(userid){
        const user =await UserModel.findById(userid);
        const { password, updatedAt, ...other } = user._doc;
       res.status(200).json(other);
      }
      
      else{
        res.status(200).json(req.user)
      }
        
      
    } catch (error) {
      res.status(500).json(error)
    }
   })

  //  get friends

 //get all user
userRouter.get("/search",async(req,res)=>{
  res.send("")
})

 userRouter.get("/search/:value",async(req,res)=>{
  console.log(req.params.value)
 
  try {
    let resp= await UserModel.find({ username: { $regex: `^${req.params.value}`, $options: 'i' } })

  if(resp){
    resp=resp.map((item)=>(
      item.username
    ))
    res.send(resp)
  }else{
    res.send("not found any user")
  }
  } catch (error) {
    console.log(error)
  }

})

  // follow a user 
  userRouter.put("/follow",auth,async(req,res)=>{
            if(req.user._id !== req.body.id){
                   try {
                     const user =await UserModel.findById(req.body.id)
                    const currentuser=await UserModel.findById(req.user._id)
                     if(!user.followers.includes(req.user._id) && !currentuser.following.includes(req.body.id)){
                      await UserModel.findByIdAndUpdate(req.body.id, { $push: { followers: req.user._id } });
                      await UserModel.findByIdAndUpdate(req.user._id , { $push: { following:req.body.id } });
                      res.status(200).send({msg:"user has been followed",data:currentuser})
                     }else {
                      res.status(200).json("you already follow this user")
                     }
                   } catch (error) {
                    console.log(error)
                    res.status(500).json(error)
                   }
            }else{
              res.status(200).json("you cant follow yourself")
            }
  })
 

  // unfollow
  userRouter.put("/unfollow",auth,async(req,res)=>{
    if(req.user._id !== req.body.id){
           try {
             const user =await UserModel.findById(req.body.id)
             const currentuser=await UserModel.findById(req.user._id)
             if(user.followers.includes(req.user._id) && currentuser.following.includes(req.body.id) ){
              await UserModel.findByIdAndUpdate(req.body.id, { $pull: { followers: req.user._id } });
              await UserModel.findByIdAndUpdate(req.user._id , { $pull: { following:req.body.id } });
              res.status(200).send({msg:"user has been unfollowed",data:currentuser})
             }else {
              res.status(200).json("you dont follow this user anymore")
             }
           } catch (error) {
            console.log(error)
            res.status(500).json(error.message)
           }
    }else{
      res.status(403).json("you cant unfollow yourself")
    }
})




module.exports={userRouter}