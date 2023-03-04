const mongoose = require('mongoose');

const coupnSchema =new mongoose.Schema({
  
    couponName:{
        type:String,
        required:true,

    },
    couponCode:{
        type:String,
        required:true,
        unique:true,
        set: value => value.toUpperCase()

    },
    
    minAmount:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    }, 
    couponUser:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:'UserData'}
    ]

})

module.exports = couponModel = mongoose.model('couponData',coupnSchema);