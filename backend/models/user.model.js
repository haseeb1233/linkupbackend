const mongoose=require("mongoose")


const UserSchema=mongoose.Schema({
        username:{
            type:String,
            required:true,
            min:3,
            max:20,
            unique:true
        },
        email:{
            type:String,
            required:true,
            max:50,
            unique:true,
        },
        password:{
            type:String,
            required:true,
            min:6
        },
        profilePicture:{
            type:String,
            default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
        },
        coverPicture:{
            type:String,
            default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
        },
        followers:{
            type:Array,
            default:[]
        },
        following:{
            type:Array,
            default:[]
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        desc:{
            type:String,
            max:50,
        },
        city:{
            type:String,
            max:50,
        },
        from:{
            type:String,
            max:50,
        },
        relationship:{
            type:Number,
            enum:[1,2,3]
        }
},
{
    timestamps:true,
    versionKey:false},
)


const UserModel=mongoose.model("users",UserSchema)

module.exports={UserModel}