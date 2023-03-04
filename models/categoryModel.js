

const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const Objectid = mongoose.Types.ObjectId

const categorySchema = new mongoose.Schema({
    categoryName :{
        type :String,
        required : true,
        unique:true,
        set: value => value.toUpperCase()
    },
    Description :{
        type :String,
        required:true
    },
    Status:{
        type:String,
        required:true
    },
    image:{
        type:[String],
        required:true
    }

})



module.exports = CategoryModel = mongoose.model('CategoryData',categorySchema);