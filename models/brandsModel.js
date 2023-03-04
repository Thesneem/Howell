const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        unique:true,
        set: value => value.toUpperCase()
    
    }
})

module.exports = BrandModel = mongoose.model('BrandData',brandSchema);