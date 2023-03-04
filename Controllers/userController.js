//const { estimatedDocumentCount } = require("../models/usermodel")
const usermodel = require("../models/userModel")
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const productmodel = require('../models/productModel')
const brandmodel = require("../models/brandsModel")
const bannermodel = require("../models/bannerModel")
const categorymodel = require("../models/categoryModel")
const ordermodel = require("../models/orderModel")
const couponmodel = require("../models/couponModel")
const createError = require("http-errors");
// const ObjectId=require('mongoose')
const mongoose = require('mongoose');


//razorpay
const Razorpay = require('razorpay')
const cypto = require('crypto')
require("dotenv").config();
const { RAZORPAY_KEYID, RAZORPAY_KEY_SECRET, mailId, password } = process.env;
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_KEY_SECRET })

//node mailer requirements
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: mailId,
    pass: password,
  }

});

var Name;
var Email;
var Phone;
var Password;

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);



module.exports = {
  //---------------------------------------User Home page----------------------------------------------------------------//
  Home: async (req, res) => {
    try {
      const product = await productmodel.find().sort({ Stock: -1 }).limit(4)
      const banner = await bannermodel.find({ status: 'Active' })
      const category = await categorymodel.find()
      const brands = await brandmodel.find()
      if (req.session.logIn) {

        res.render('user/index', { login: true, banner, brands, product, category, page: 'Home' })
      }
      else {
        res.render('user/index', { login: false, banner, brands, product, category, page: 'Home' })
      }

    }
    catch (err) {

      next(err)
    }
  },
  //----------------------------------------otp---------------------------------------------------------------//
  otp: async (req, res) => {
    try {
      req.session.message = {
        type: 'danger',
        message: 'Incorrect OTP'
      }
      // res.render('user/otp1',{errorMessage: null} )
      Name = req.body.name,
        Email = req.body.email,
        Password = req.body.password,
        Phone = req.body.phone



      const user = await usermodel.findOne({ email: Email })
      if (!user) {
        // send mail with defined transport object
        var mailOptions = {
          to: req.body.email,
          subject: "Otp for registration is: ",
          html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          res.render('user/otp1');
        });

      }
      else {

        const emailerror = "Email id exist!!"
        res.render('signUppage', { emailerror });
      }

    }
    catch (err) {

      next(err)
    }
  },
  verifyotp: (req, res) => {

    try {

      if (req.body.otp == otp) {
        const newUser = usermodel(
          {
            fullName: Name,
            email: Email,
            password: Password,
            phoneNumber: Phone,

          }
        )



        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(() => {

                res.redirect("/login");
              })
              .catch((err) => {

                res.redirect("/otp")
              })
          })
        })
      }
      else {
        req.session.message = {
          type: 'danger',
          message: 'Entered otp is incorrect'
        }
        // const message=req.session.message
        res.render('user/otp1')
      }
    }

    catch (err) {

      next(err)
    }

  },
  resendotp: (req, res) => {
    try {
      var mailOptions = {
        to: Email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('user/otp1', { message: "otp has been sent" });
      });

    } catch (err) {
      next(err)
    }

  },



  //-----------------------------------------------User/admin Login form------------------------------------------------------------//  
  Login: (req, res) => {
    try {

      if (req.session.logIn) {
        res.redirect('/')
      }
      else {
        res.render('Login', { loginerror: null })
      }
    } catch (err) {
      next(err)
    }
  },
  //-------------------------------------------------------User signup page-----------------------------------------------//  
  signUp: (req, res) => {
    try {
      res.render('signUppage')
    }
    catch (err) {
      next(err)
    }
  },
  //------------------------------------------------User Signup Action---------------------------------------------------//  
  doSignUp: async (req, res) => {
    try {
      const newUser = usermodel(
        {
          fullName: req.body.name,
          email: req.body.email,
          password: req.body.password,
          phoneNumber: req.body.phone

        }
      )


      const user = await usermodel.findOne({ email: newUser.email })

      if (!user) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            newUser
              .save()
              .then(() => {
                res.redirect("/login");
              })
              .catch((err) => {

                res.redirect("/signup")
              })
          })
        })
      }
      else {
        const emailerror = "Email id exist!!"
        res.render('signUppage', { emailerror });
      }
    }
    catch (err) {

      next(err)
    }

  },
  //----------------------------------------------------Checking Login and getting home page------------------------------// 
  doLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await usermodel.findOne({ $and: [{ email: email }, { status: "unblocked" }] });
      if (!user) {
        return res.render('Login', { loginerror: 'Invalid Credentials' });
      }

      const isUser = await bcrypt.compare(password, user.password);
      if (!isUser) {
        return res.render('Login', { loginerror: 'Invalid Credentials' });
      }
      else {
        req.session.logIn = true
        req.session.userid = user._id
        req.session.userlogged = true


        return res.redirect('/')

      }

    }
    catch (err) {
    }
  },
  //--------------------------------------------------------Single Product Details Page -----------------------------------//
  productDetails: async (req, res) => {
    try {
      const id = req.params.id
      const product = await productmodel.findById({ _id: id })
      if (req.session.logIn) {
        res.render('user/productDetails', { login: true, product, page: 'Shop' })
      }
      else {
        res.render('user/productDetails', { login: false, product, page: 'Shop' })
      }
    }
    catch (err) {
      next(err)
    }
  },
  //-------------------------------------Shop Page -----------------------------------------------------------------------//

  shoppage: async (req, res) => {
    try {

      let product = await productmodel.find({ Status: 'List' }).limit(8)
      let brand = await brandmodel.find({})
      let category = await categorymodel.find({})
      let ITEMS_PAGE = 8
      if (req.query.page) {

        const page = req.query.page;
        const product = await productmodel.find({ status: "List" })
          .skip((page - 1) * ITEMS_PAGE)
          .limit(ITEMS_PAGE);
        if (req.session.user) {
          res.render('user/shoppage', { login: true, product, brand, category, page: 'Shop' })
        }
        else {
          res.render('user/shoppage', { login: false, product, brand, category, page: 'Shop' })

        }
      }

      if (req.session.logIn) {
        res.render('user/shoppage', { login: true, product, brand, category, page: 'Shop' })
      }
      else {
        res.render('user/shoppage', { login: false, product, brand, category, page: 'Shop' })
      }
    }

    catch (err) {

      next(err)
    }
  },

  //-------------------------------------------------------wishlist------------------------------------------------------//
  addToWishlist: async (req, res) => {
    try {


      const productid = req.params.id


      const userid = req.session.userid


      let wishitem = await usermodel.find({ _id: userid, 'wishlist.productid': productid })

      if (wishitem.length > 0) {

        res.json("alreadyexit");
      }
      else {

        let up = await usermodel.updateOne({ _id: userid }, { $addToSet: { wishlist: { productid: productid } } })



        res.json({ key: "added" });

      }

    }

    catch (err) {

      next(err)
    }
  },

  wishlistpage: async (req, res) => {
    try {
      if (req.session.logIn) {
        const userid = req.session.userid
        let items = await usermodel.findOne({ _id: userid }).populate('wishlist.productid')


        res.render('user/wishlist', { login: true, items, page: 'Shop' })
      }
      else {
        res.redirect('/login')
      }
    }
    catch (err) {
      next(err)
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const id = req.params.id

      let userId = req.session.userid

      await usermodel.findOneAndUpdate({ _id: userId }, { $pull: { wishlist: { productid: id } } })
        .then(() => {
          res.json("removed");

        })
    }
    catch (err) {
      next(err)
    }
  },
  //-----------------------------------------------------Count---------------------------------------------------------//
  count: (req, res, next) => {
    try {
      usermodel.findOne({ _id: req.session.userid }).then((user) => {
        res.json(user);
      });
    } catch (error) {
      next(error);
    }

  },

  //---------------------------------------------------Cart----------------------------------------------------------------//

  cartpage: async (req, res) => {
    try {
      if (req.session.logIn) {
        const userid = req.session.userid

        let cart = await usermodel
          .findOne({ _id: userid })
          .populate("cart.productid");

        res.render("user/cartpage", { cart, login: true, page: 'Shop' });

      }
    }
    catch (err) {

      next(err)

    }
  },
  addtoCart: async (req, res) => {
    try {
      const productid = req.params.id
      const product = await productmodel.findOne({ _id: productid })

      const userid = req.session.userid

      if (!userid) {
        res.json("login")
      }
      else {
        let cart = await usermodel.find({ _id: userid, 'cart.productid': productid })

        if (cart.length > 0) {
          const addcart = await usermodel.updateOne({ _id: userid, "cart.productid": productid }, { $inc: { "cart.$.quantity": 1 } })

          await usermodel.findOneAndUpdate({ _id: userid }, { $pull: { wishlist: { productid: productid } } })

        }
        else {
          let addcart = await usermodel.updateOne({ _id: userid }, { $addToSet: { cart: { productid: productid, quantity: 1 } } })
          // testing

          await usermodel.findOneAndUpdate({ _id: userid }, { $pull: { wishlist: { productid: productid } } })


        }

        res.json("added")
      }

    }
    catch (err) {

      next(err)
    }
  },

  deleteFromCart: async (req, res) => {
    try {
      const id = req.params.id

      // const productid = mongoose.Types.ObjectId("id");
      //const productid = mongoose.Types.ObjectId(req.params.id.trim());
      const productid = mongoose.Types.ObjectId(id.trim())

      let userId = req.session.userid

      await usermodel.findOneAndUpdate({ _id: userId }, { $pull: { cart: { productid: productid } } })
        .then(() => {
          res.redirect("/cartpage")
        })
      //res.redirect('/cart')
    }
    catch (err) {

      next(err)
    }
  },
  incquantity: async (req, res, next) => {
    try {
      const userid = req.session.userid
      const id = req.body.id

      // const CART=await usermodel.findOne({ _id: userid, "cart._id": id })
      // console.log(CART)
      // let quantitycheck = await usermodel.findOne({
      //   _id: userid,
      //   "cart._id": id,
      // });
      // quantitycheck.cart.forEach(async (val, i) => {
      //   if (val._id.toString() == id.toString()) {
      //     if (val.quantity >=12) {

      //       res.json("maximum")
      //     }
      //     else{
      await usermodel.updateOne({ _id: userid, "cart._id": id }, { $inc: { "cart.$.quantity": 1 } })
      res.json("added");
    }

    catch (err) {
      next(err)
    }
  },

  decquantity: async (req, res) => {
    try {
      const id = req.session.userid;
      const cdid = req.body.id;
      let quantitycheck = await usermodel.findOne({
        _id: id,
        "cart._id": cdid,
      });
      quantitycheck.cart.forEach(async (val, i) => {
        if (val._id.toString() == cdid.toString()) {
          if (val.quantity <= 1) {
            let test = await usermodel.findOneAndUpdate(
              { _id: id },
              { $pull: { cart: { _id: cdid } } }, { new: true })



            res.json("deleted");
          } else {
            await usermodel.updateOne(
              { _id: id, "cart._id": cdid },
              { $inc: { "cart.$.quantity": -1 } }
            );
            res.json("added");
          }
        }
      });
    }
    catch (err) {
      next(err)
    }

  },

  decquantity1: async (req, res, next) => {
    try {
      const userid = req.session.userid
      const id = req.body.id


      const item = await usermodel.findOne({ _id: userid, 'cart._id': id }, { cart: 1 });
      if (item) {
        const cart = item.cart;
        for (let i = 0; i < cart.length; i++) {
          const val = cart[i];
          if (val.quantity <= 1) {
            await usermodel.updateOne(
              { _id: userid, "cart._id": id },
              { $pull: { cart: { _id: id } } }
            ).save
            return res.json('deleted')

          }



          else {
            await usermodel.updateOne({ _id: userid, "cart._id": id }, { $inc: { "cart.$.quantity": -1 } })
            res.json("decremented");
          }
        }

      }
    } catch (err) {
      next(err)
    }
  },

  //-------------------------------------------------Checkout Page---------------------------------------------------------//
  checkoutPage: async (req, res, next) => {
    try {
      const userid = req.session.userid
      const item = await usermodel.findOne({ _id: userid }).populate("cart.productid");

      if (item.cart.length > 0) {
        const currentStock = item.cart.every(product => {
          return product.quantity <= product.productid.Stock;
        });

        if (!currentStock) {
          let outOfStockProducts = [];
          item.cart.forEach(product => {
            if (product.quantity > product.productid.Stock) {
              outOfStockProducts.push(product.productid.ProductName);
            }
          });
          req.session.message = {
            type: 'danger',
            message: ` ${outOfStockProducts} is out of stock`,
            timer: 2000,
          }
          const message = req.session.message
          res.redirect("/cartpage");

        }
        else {
          res.render('user/checkoutpage', { login: true, item, page: 'Shop' })

        }
      }
      else {
        res.redirect('/cartpage')
      }
    }
    catch (err) {
      next(err)
    }

  },
  addDeliveryAddress: async (req, res) => {
    try {
      const userid = req.session.userid
      let newaddresss = {
        'addressName': req.body.addressName,
        'House': req.body.House,
        'city': req.body.city,
        'district': req.body.district,
        'state': req.body.state,
        'Pin': req.body.Pin
      }

      await usermodel.updateOne({ _id: userid }, { $push: { addresses: newaddresss } })
      res.redirect('/checkoutpage')
    }
    catch (err) {
      next(err)
    }
  },
  // -----------------------edit Address---------------------------------------------------------------------------//
  editaddress: async (req, res) => {
    try {
      const id = req.session.userid;
      const addid = req.body.id;
      let useraddress = await usermodel.findOne({ _id: id });
      useraddress.addresses.forEach((val) => {
        if (val.id.toString() == addid.toString()) {
          res.json(val);
        }
      });
    }
    catch (err) {
      next(err)
    }

  },
  updateaddress: async (req, res) => {
    try {
      const userid = req.session.userid
      const id = req.params.id
      let addressUpdate = {
        'addresses.$.addressName': req.body.addressName,
        'addresses.$.House': req.body.House,
        'addresses.$.city': req.body.city,
        'addresses.$.district': req.body.district,
        'addresses.$.state': req.body.state,
        'addresses.$.Pin': req.body.Pin
      }
      await usermodel.updateOne({ _id: userid, 'addresses._id': id }, { $set: addressUpdate }).then(() => {
        res.redirect('/profile')
      })
    }
    catch (err) {
      next(err)
    }

  },
  //----------------------------------------------------Order--------------------------------------------------------------//
  placeOrder: async (req, res) => {
    try {
      const order = req.body
      const userid = req.session.userid
      const userdata = await usermodel.findOne({ _id: userid }).populate("cart.productid");
      const cart = userdata.cart
      //checking stock with quantity
      const isStockAvailable = userdata.cart.every(product => {
        return product.quantity <= product.productid.Stock;
      });
      if (!isStockAvailable) {
        res.json({ outOfStock: true })
      }
      else {
        userdata.cart.forEach(async (product) => {
          new_stock = product.productid.Stock - product.quantity
          await productmodel.findByIdAndUpdate({ _id: product.productid._id }, { $set: { Stock: new_stock } })
        })

        let selectAddress = await usermodel.findOne({ _id: userid }, { 'addresses': 1, _id: 0 }).exec()
        let index = parseInt(order['order-address']);
        let addr = selectAddress.addresses[index]


        //cart bill
        let cartproducts = [];
        let total = 0
        cart.forEach((_id) => {
          total = total + _id.quantity * _id.productid.Price;
          const product = {
            product_id: _id.productid._id,
            name: _id.productid.ProductName,
            qnty: _id.quantity,
            price: _id.productid.Price,
          }
          cartproducts.push(product)
        });

        // coupon adding in place order
        if (req.session.coupon != null) {
          let couponData = req.session.coupon
          let userCoupon = await couponmodel.findOne({ couponCode: couponData })
          coupons = {
            name: userCoupon.couponName,
            code: userCoupon.couponCode,
            discount: userCoupon.discount,
          }

          let discount = Math.round(total * (userCoupon.discount / 100))

          total = total - discount


          // updating coupon model wthuser
          let couponDet = await couponmodel.findOne({ couponCode: couponData, couponUser: { $nin: [userid] } })
          if (couponDet) {
            await couponDet.updateOne(
              {
                $addToSet: {
                  couponUser: userid,
                }
              });

          }


        }

        else {
          coupons = {
            name: 'nil',
            code: 'nil',
            discount: 0,
          }

        }


        const status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
        let newOrder = ordermodel({
          userid: userid,
          address: addr,
          bill_amount: total,
          coupon: coupons,
          order_status: status,
          "delivery_status.ordered.state": true,
          "delivery_status.ordered.date": Date.now(),
          products: cartproducts

        })

        const test = await newOrder.save()


        if (order['payment-method'] === 'COD') {

          await ordermodel.findByIdAndUpdate({ _id: test._id }, {

            $set: {
              "paymentData.payment_id": "COD_" + test._id,
              "paymentData.payment_status": "Pending",
              "paymentData.payment_method": "Cash_on_Delivery",
            }
          })
            .then(() => usermodel.updateOne(
              { _id: userid },
              { $set: { cart: [] } }
            ))

          //let totalPrice = cartData.totalprice
          res.json({ codSuccess: true })
        }
        // wallet payment
        else if (order['payment-method'] === 'WALLET') {
          await ordermodel.findByIdAndUpdate({ _id: test._id }, {

            $set: {
              "paymentData.payment_id": "WALLET_" + test._id,
              "paymentData.payment_status": "Paid",
              "paymentData.payment_method": "WALLET_PAYMENT",
            }
          })
            .then(() => usermodel.updateOne(
              { _id: userid },
              { $set: { cart: [] }, $inc: { wallet: -test.bill_amount } }
            ))


          //let totalPrice = cartData.totalprice
          res.json({ walletSuccess: true })


        }



        else {
          var options = {
            amount: test.bill_amount * 100,
            currency: "USD",
            receipt: "" + test._id
          }
          instance.orders.create(options, function (err, order) {
            if (err) {
            } else {
              res.json(order)
            }
          })
        }

      }
    }

    catch (err) {
      next(err)
    }
  },
  verifypayment: async (req, res) => {
    try {
      let userid = req.session.userid
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      hmac.update(req.body['payment[razorpay_order_id]'] + '|' + req.body['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == req.body['payment[razorpay_signature]']) {
        await ordermodel.updateOne({ _id: req.body['order[receipt]'] }, {
          $set:
          {
            order_status: 'placed', "paymentData.payment_status": 'success',
            "paymentData.payment_method": "Online",
            "paymentData.payment_id": req.body['payment[razorpay_payment_id]']
          }
        })
          .then(() => usermodel.updateOne(
            { _id: userid },
            { $set: { cart: [] } }
          ))
        res.json({ status: true })
      } else {
        await ordermodel.updateOne({ _id: req.body['order[receipt]'] }, {
          $set:
          {
            order_status: 'failed', "paymentData.payment_status": 'failed',
            "paymentData.payment_method": "Online",
            "paymentData.payment_id": "failed"
          }
        })
        res.json({ status: false, errMsg: '' })
      }
    }
    catch (err) {
      next(err)
    }
  },
  orderSuccessPage: async (req, res) => {
    try {
      const userid = req.session.userid
      const order = await ordermodel.findOne({ userid: userid }).sort({ ordered_date: -1 }).limit(1)
      res.render('user/orderSuccess', { login: true, userid, order, page: 'Shop' })
    }
    catch (err) {
      next(err)
    }
  },
  orderDetails: async (req, res) => {
    try {
      ordermodel
        .findOne({ _id: req.params.id, userid: req.session.userid })
        .populate("products.product_id")
        .then((orderDetails) => {
          res.render("user/ViewOrder", {
            orderDetails,
            user: req.session.user, login: true,
            page: 'Shop'
          });
        });
    }
    catch (err) {
      next(err)
    }
  },
  //-----------------------------------------order Cancell-----------------------------------------------------------// 
  cancelOrder: async (req, res) => {
    try {
      const userid = req.session.userid
      await ordermodel
        .updateOne(
          { _id: req.body.id },
          {
            $set: {
              order_status: "canceled",
              "delivery_status.canceled.state": true,
              "delivery_status.canceled.date": Date.now(),
            },
          }
        )




      //         const orderdata=await ordermodel.findOne({_id:req.body.id})
      //         console.log(orderdata.products+"CANCELEDORDER")
      //  // update the product collection stock

      //  console.log(typeof orderdata.products.qnty)       
      //           await productmodel.updateOne({_id:orderdata.products.product_id},{$inc:{Stock:orderdata.products.qnty}})

      //           .then(()=>{
      //             console.log('tested')
      //           res.json("OrderCanceled");
      //         });

      const orderdata = await ordermodel.findOne({ _id: req.body.id });

      for (let i = 0; i < orderdata.products.length; i++) {
        const product = orderdata.products[i];

        // update the product collection stock
        await productmodel.updateOne(
          { _id: product.product_id },
          { $inc: { Stock: product.qnty } }
        );
      }


      if (orderdata.paymentData.payment_method == 'Online' || orderdata.paymentData.payment_method == 'WALLET_PAYMENT') {

        await usermodel.findOneAndUpdate({ _id: userid }, { $inc: { wallet: orderdata.bill_amount } })
      }


      res.json('OrderCanceled');



    }
    catch (err) {
      next(err)
    }
  },

  returnOrder: async (req, res) => {
    try {
      await ordermodel
        .updateOne(
          { _id: req.body.id },
          {
            $set: {
              order_status: "returned",
              "delivery_status.returned.state": true,
              "delivery_status.returned.date": Date.now(),
            },
          }
        )
      const orderdata = await ordermodel.findOne({ _id: req.body.id });

      for (let i = 0; i < orderdata.products.length; i++) {
        const product = orderdata.products[i];

        // update the product collection stock
        await productmodel.updateOne(
          { _id: product.product_id },
          { $inc: { Stock: product.qnty } }
        );
      }

      res.json("Success");

    }
    catch (err) {
      next(err)
    }

  },

  orderHistory: (req, res) => {
    try {
      // res.render('user/orderHistory',{login:true})
      ordermodel
        .find({
          userid: req.session.userid,
          order_status: { $ne: "pending" },
        })
        .sort({ ordered_date: -1 })
        .then((orderedItems) => {
          res.render("user/orderHistory", {
            orderedItems,
            user: req.session.user, login: true, page: 'Profile'
          });
        });
    }
    catch (err) {
      next(err)
    }
  },
  //--------------------------------------------------Coupon--------------------------------------------------------------//
  applyCoupon: async (req, res) => {
    try {
      let userid = req.session.userid
      let userInfo = await usermodel.findById({ _id: userid })
      // let cart=userInfo.cart
      var couponCode = req.body.code;


      // Check if the coupon code is valid
      let couponDet = await couponmodel.findOne({ couponCode: couponCode, couponUser: { $nin: [userid] } })

      if (couponDet) {
        let date = new Date(couponDet.expiryDate)
        const currentDate = new Date();
        if (date.getTime() < currentDate.getTime()) {
          res.json({ expired: true });
        }
        else {

          if (req.body.total > couponDet.minAmount) {
            let discount = Math.round(req.body.total * (couponDet.discount / 100))

            let total = req.body.total - discount
            req.session.coupon = couponCode

            res.json({ success: true, newTotal: total, discount: discount });

            // await couponDet.updateOne(
            //   {
            //     $addToSet: {
            //       couponUser: userid,
            //     }
            //   });
          }


          else {
            req.session.coupon = null
            res.json({ notapplicable: true });
          }

        }
      }
      else {
        req.session.coupon = null
        res.json({ success: false });
      }

    }
    catch (err) {
      next(err)
      req.session.coupon = null
      res.json({ success: false });
      //next(createError(404));
    }
  },
  removeCoupon: async (req, res) => {
    try {
      let userid = req.session.userid
      let userInfo = await usermodel.findById({ _id: userid })
      // let cartInfo = await cart.findOne({ user: id })
      var couponCode = req.body.code;

      // Check if the coupon code is valid
      let couponDet = await couponmodel.findOne({ couponCode: couponCode })

      if (couponDet) {
        // await couponDet.updateOne(
        //   { $pull: { couponUser: userid } }
        // );

        // let total = cartInfo.totalprice
        // let maxDiscount = 0

        // let discount = Math.round(currenttotal * (couponDet.discount / 100))
        let discount = 0
        let total = req.body.subtotal
        req.session.coupon = null
        res.json({ success: true, newTotal: total, discount: discount });

      } else {
        res.json({ success: false });
      }
    }
    catch (err) {
      next(err)
    }
  },
  //--------------------------------------------------User Profile -------------------------------------------------------//

  profile: async (req, res) => {
    try {
      if (req.session.logIn) {
        const id = req.session.userid
        const user = await usermodel.findOne({ _id: id })
        const orderedItems = ordermodel
          .find({
            userid: req.session.userid,
            order_status: { $ne: "pending" },
          })
          .sort({ ordered_date: -1 })


          .then((orderedItems) => {
            res.render('user/userprofile', { login: true, user, page: 'Profile', orderedItems })
          })
      }
    }
    catch (err) {
      next(err)
    }
  },
  editProfile: async (req, res) => {
    try {
      userid = req.params.id
      const { fullName, phoneNumber } = req.body;
      await usermodel.findByIdAndUpdate({ _id: userid }, { $set: { fullName, phoneNumber } })
      res.redirect('/profile')
    }
    catch (err) {
      next(err)
      res.redirect('/home')
    }
  },
  addAddress: async (req, res) => {
    try {
      userid = req.params.id
      const { addressName, House, city, district, state, Pin } = req.body
      let address = await usermodel.updateOne({ _id: userid }, { $addToSet: { addresses: { addressName, House, city, district, state, Pin } } })
      res.redirect('/profile')
    }
    catch (err) {
      next(err)

    }

  },
  deleteAddress: async (req, res) => {
    try {
      const id = req.session.userid
      await usermodel.updateOne(
        { _id: req.session.userid },
        { $pull: { addresses: { _id: req.body.id } } }
      );
      res.json("deleted");
      //res.redirect('shoppage')
    }
    catch (err) {
      next(err)
    }
  },

  changepassword: async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body
      const password = newPassword
      const confmpwd = confirmPassword
      const user_id = req.session.userid
      const saltRounds = 10
      const newPass = await bcrypt.hash(password, saltRounds)
      if (password == confmpwd) {
        const updatedData = await usermodel.findByIdAndUpdate({ _id: user_id }, { $set: { password: newPass } }, { new: true })
        res.json('success')
      }
      else {
        res.json('failed')
      }

    }
    catch (err) {
      res.json({ success: false })
      next((err))
    }
  },
  //--------------------------------------------------search sort filter-----------------------------------------------//
  search: async (req, res) => {
    try {
      let key = req.query.search
      let product = await productmodel.find({ $or: [{ ProductName: { $regex: key, $options: 'i' } }, { Brand: { $regex: key, $options: 'i' } }, { categoryName: { $regex: key, $options: 'i' } }] })
      // const categories = await categorymodel.find()
      let brand = await brandmodel.find({})
      let category = await categorymodel.find({})

      if (req.session.logIn) {
        res.render('user/shoppage', { product, page: "Shop", brand, category, login: true })
      }
      else {
        res.render('user/shoppage', { product, page: "Shop", brand, category, login: false })

      }
    }
    catch (err) {
      next(err)

    }

  },
  sortfilter: async (req, res) => {
    try {
      const { category, brand, sort } = req.body

      const categoryfilter = category === 'All' ? {} : { categoryName: category };
      const brandfilter = brand === 'All' ? {} : { Brand: brand }


      const matchCriteria = { $and: [categoryfilter, brandfilter] };



      const sortvalue = parseInt(req.body.sort)


      const products = await productmodel.aggregate([
        { $match: matchCriteria },

        { $sort: { Price: sortvalue } }
      ])




      res.send({ pro: products })
    }
    catch (err) {
      next(err)
    }
  },
  //--------------------------------------------------User Logout -------------------------------------------------------//  
  LogOut: (req, res) => {
    try {
      req.session.logIn = false
      req.session.destroy()
      res.redirect('/')
    }
    catch (err) {
      next(err)
    }

  },
  //-----------------------------------------------------contact----------------------------------------------------------//
  contact: (req, res) => {
    try {
      if (req.session.logIn) {
        res.render('user/contact', { login: true, page: 'Contact' })
      }
      else {
        res.render('user/contact', { login: false, page: 'Contact' })

      }
    }
    catch (err) {
      next(err)
    }
  },
  //-------------------------------------------------------forgotPassword-----------------------------------------------//
  forgotPassword: (req, res) => {
    try {
      res.render('user/forgotpswd')
    }
    catch (err) {
      next(err)
    }
  },
  verifyemail: async (req, res) => {
    try {
      let user = await usermodel.findOne({ email: req.body.email })
      if (user) {
        var mailOptions = {
          to: req.body.email,
          subject: "Otp for password reset is: ",
          html: "<h3>OTP for password reset is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };
        const reqEmail = req.body.email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }


          res.render('user/resetpswd', { reqEmail: reqEmail })

        })
      }
      else {
        const emailerror = 'Invalid Email. Enter correct email'
        res.render('user/forgotpswd', { emailerror })
      }

    }
    catch (err) {
      next(err)
    }
  },
  resetPassword: async (req, res) => {
    try {
      const saltRounds = 10
      if (req.body.otp == otp) {
        if (req.body.newpassword == req.body.confirmpassword) {
          const newPass = await bcrypt.hash(req.body.newpassword, saltRounds)
          const updatedData = await usermodel.findOneAndUpdate({ email: req.body.email }, { $set: { password: newPass } }, { new: true })
          // const updatedData = await usermodel.findOneAndUpdate({ email: req.body.email }, { $set: { password: req.body.newpassword } }, { new: true })
          res.redirect('/login')
        }
      }
      else {
        const otperror = 'Incorrect OTP'
        //  res.render('user/resetpswd', { otperror })
        res.redirect('back')
      }

    }
    catch (err) {
      next(err)
    }
  },
  // --------------------------------------Invoice--------------------------------------------------------------------//
  invoice: async (req, res) => {
    try {
      const id = req.params.id
      const orderdata = await ordermodel.findOne({ _id: id }).populate(["userid", "products.product_id",])
      res.render('user/invoiceUser', { login: true, page: 'Profile', orderdata })
    }
    catch (err) {
      next(err)
    }
  },
  // ------------------------------Wallet Check----------------------------------------------------------------------//
  walletCheck: (req, res, next) => {
    try {
      usermodel.findOne({ _id: req.session.userid }).then((user) => {
        if (user.wallet >= req.body.finalAmount) {
          res.json("success");
        } else {
          res.json(user);
        }
      });
    } catch (error) {
      next(error);
    }
  },
}