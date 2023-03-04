const mongoose = require('mongoose');

const bannerSchema =new mongoose.Schema({
  
    bannerName:{
        type:String,
        required:true,
        unique:true,
        set: value => value.toUpperCase()
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        // default:"Inactive"
    },
    image:{
        type:[String],
        required:true
    }

})

module.exports = BannerModel = mongoose.model('BannerData',bannerSchema);