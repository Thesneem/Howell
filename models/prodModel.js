const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Objectid = mongoose.Types.ObjectId


const SizeAndStockSchema= {
    size:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    }
}

const prodSchema = new mongoose.Schema({
    ProductName :{
        type :String,
        required : true,
        unique:true,
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
    SizeAndStock:[SizeAndStockSchema],
    totalStock:{
        type:Number,
        required:true,

    },
    Specifications:{
        type:String,
        required:true
    },
    
    Price:{
        type:Number,
        required:true
    },
    Discount:{
        type:Number,
        
    },
    Status:{
        type:String,
        required:true,
        default:'In-Stock'
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



module.exports = ProductModel = mongoose.model('ProdData',prodSchema);