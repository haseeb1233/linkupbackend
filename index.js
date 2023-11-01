const express =require("express")
const helmet=require("helmet")
const morgan=require("morgan")
const {connection}=require("./db/db")
require("dotenv").config()
const cors=require("cors")
const app=express()
const{userRouter}=require("./routes/user.router")
const {postRouter}=require("./routes/post.router")
const multer = require("multer")
const path = require("path")

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(morgan("common")) 

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, "public/images");
   },
   filename: (req, file, cb) => {
     cb(null, req.body.name);
   },
 });
const upload = multer({storage});
app.post("/backend/upload",upload.single("file"),(req,res)=>{
   try {
      res.status(200).json("File Uploaded successfully")

   } catch (error) {
      console.log(error);
   }  
})
app.use("/user",userRouter)
app.use("/post",postRouter)

app.listen(process.env.port,async()=>{
     try {
        await connection
        console.log("connected to db");

     } catch (error) {
        
     }
    console.log("connected to server")
})