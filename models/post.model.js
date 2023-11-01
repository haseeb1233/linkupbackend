const mongoose=require("mongoose")


const PostSchema= mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    img:{
        type:String,
    },
    likes:{
        type:Array,
        default:[]
    }
},
{timestamps:true,
versionKey:false})

const PostModel=mongoose.model("posts",PostSchema)

module.exports={PostModel}