const express = require("express")

const postRouter=express.Router()
const {auth}=require("../middleware/auth.middleware")
const {PostModel} = require("../models/post.model")
const {UserModel}=require("../models/user.model")


// create post

postRouter.post("/",auth,async(req,res)=>{
        let post ={
            userId:req.user._id,
            desc:req.body.desc,
            img:req.body.img

        }
        try {
            const newPost= new PostModel(post)
            await newPost.save()
            res.status(200).json("post sucessfully posted")
        } catch (error) {
            res.status(500).json(error.message)
        }
     
      })

    //  update post
    postRouter.put("/update/:id",auth,async(req,res)=>{
        try {
            const post=await PostModel.findById(req.params.id)
        if(post.userId===req.user._id){
           await PostModel.updateOne({$set:req.body})
           res.status(200).json("post updated successfully")

        }else{
            res.status(403).json("you can update only your post")
        }

        } catch (error) {
            res.status(500).json(error.message)
        }
    }) 

    // delete post

    postRouter.delete("/delete/:id",auth,async(req,res)=>{
        try {
            const post=await PostModel.findById(req.params.id)
        if(post.userId===req.user._id){
           await PostModel.findByIdAndDelete(req.params.id)
           res.status(200).json("post deleted successfully")

        }else{
            res.status(403).json("you can delete only your post")
        }

        } catch (error) {
            res.status(500).json(error.message)
        }
    }) 

    // like post and dislike post

    postRouter.put("/like/:id", auth, async (req, res) => {
        try {
            const postId = req.params.id;
            const userId = req.user._id;
    
            // Check if the post exists
            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json("Post not found");
            }
    
            // Check if the user has already liked the post
            const hasLiked = post.likes.includes(userId);
    
            if (hasLiked) {
                // User has already liked the post, so remove the like
                await PostModel.findByIdAndUpdate(postId, { $pull: { likes: userId } });
                res.status(200).json("The post has been disliked");
            } else {
                // User hasn't liked the post, so add the like
                await PostModel.findByIdAndUpdate(postId, { $push: { likes: userId } });
                res.status(200).json("The post has been liked");
            }
        } catch (error) {
            res.status(500).json(error.message);
        }
    });
    

    // get  a post
    postRouter.get("/:id",auth,async(req,res)=>{
        try {
            const post = await PostModel.findById(req.params.id)
            res.status(200).json(post)
        } catch (error) {
            console.log(error.message)
            res.status(500).json(error)
        }
    })


    // get all post

   postRouter.get("/all/timeline",auth,async(req,res)=>{
             
            try {
               console.log(req.user.following)
                const userPosts=await PostModel.find({userId:req.user._id})
                const friendPosts=await Promise.all(
                    req.user.following.map((friendId)=>{
                        return PostModel.find({userId: friendId})
                    })
                )
                console.log(userPosts,friendPosts)
                  
                res.status(200).json(userPosts.concat(...friendPosts))
            
            } catch (error) {
                console.log(error.message)
                res.status(500).json(error.message)
            }
   })


// get user post only
   postRouter.get("/profile/:username",auth,async(req,res)=>{
             
    try {
        const user = await UserModel.findOne({ username: req.params.username });
        const posts = await PostModel.find({ userId: user._id });
        res.status(200).json(posts);
    
    } catch (error) {
        console.log(error.message)
        res.status(500).json(error.message)
    }
})











module.exports={postRouter}