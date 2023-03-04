const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addressSchema = {
    addressName: {
        type:String
    },
    
    House: {
        type:String
    },
    city: {
        type:String
    },
    district: {
        type:String
    },
    state: {
        type:String
    },
    Pin: {
        type:Number
  }
}

  
const userSchema= new mongoose.Schema ({
    fullName : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type : String,
        required: true,   
    },
    phoneNumber : {
        type: Number,
        required :true
    },
   
    status :{
        type:String,
        default:'unblocked'
    },
    wallet:{
        type: Number,
        default:0}
        ,
    addresses:[addressSchema]
    ,
    
    wishlist:[{
            productid:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
            ,ref:"ProductData"
            // ,unique:true
             }
    }
    ],
    cart:[{
        productid:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'ProductData',
            // unique:true
        },
        quantity:{
            type:Number,
            required:true
            
        },
        // cartTotal:{//---this needs to be removed
        //      type:Number
            
        //  }

    },
    
]
},
    {timestamps:{
        createdAt:'created_At',
        updatedAt:'updated_At',
        type: Date

    }
})

module.exports = UserModel = mongoose.model('UserData',userSchema);