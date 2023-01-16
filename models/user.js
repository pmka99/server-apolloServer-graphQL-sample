const mongoose= require("mongoose");
const mongoosePaginate= require("mongoose-paginate");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const e = require("express");

const userSchema= new mongoose.Schema({
    name : {type : String ,required : false},
    phone : {type : String , required :false},
    email : {type : String , required :true},
    address : {type : String ,required :false},
    country  : {type : String ,required :false},
    numberrange : {type : Number ,required :false},
    password : {type : String , required :true}
},{timestamps:true})

userSchema.plugin(mongoosePaginate)

userSchema.statics.createToken= async function(user,secret,expiresIn){
    let {email,id}=user;
    return await jwt.sign({email,id},secret,{expiresIn})
}

userSchema.statics.checkToken= async(req,api_secret_key)=>{
    let token= req.headers['x-token'];
    if(token){
        try {
            return await jwt.verify(token,api_secret_key)
        } catch (err) {
            throw new Error("Your token is expired , login again")
        }
    }
    else{
        return undefined;
    }
    
}

userSchema.statics.hashPassword= function(password){
    let salt= bcrypt.genSaltSync(17);
    let hash= bcrypt.hashSync(password,salt);
    return hash;
}

userSchema.methods.comparePassword= function(password){
    return bcrypt.compareSync(password,this.password)
}

module.exports= mongoose.model('user',userSchema,'user')



