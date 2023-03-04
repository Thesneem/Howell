const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new mongoose.Schema({
    ProductName :{
        type :String,
        required : true
    },
    Description :{
        type :String,
        required:true
    },
    categoryName:{
        type:String,
        required:true,
        ref:"CategoryData"
    },
    Brand:{
        type:String,
        required: true,
        ref:"BrandData"
    },
    // Size:{
    //     type:[String],
    //     required:true
    // },
    Specifications:{
        type:String,
        required:true
    },
    Stock:{
        type:Number,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    // Discount:{
    //     type:Number,
        
    // },
    Status:{
        type:String,
        required:true,
        default:'List'  
        // default should be list/unlist
    },
    image:{
        type:[String],
        required:true
    }
},
    {timestamps:{
        createdAt:'created_At',
        updatedAt:'updated_At',
        type: Date

    }
})



module.exports = ProductModel = mongoose.model('ProductData',productSchema);