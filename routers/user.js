const express = require('express');
const { signUp } = require('../Controllers/userController');
const router = express.Router();
const userController = require('../Controllers/userController')
const ajaxAuth = require('../middlewares/ajaxAuth')
const Auth = require('../middlewares/authentication')


//-----------------get requests------------------------------------------------//

router.get('/',userController.Home)
router.get('/login', userController.Login)
router.get('/signup',userController.signUp)
router.get('/logout',userController.LogOut)
router.get('/productDetails/:id',userController.productDetails)
router.get('/shoppage',userController.shoppage)
router.get('/wishlist',Auth.userSession,userController.wishlistpage)
router.get('/cartpage',Auth.userSession,userController.cartpage)
router.get('/profile',Auth.userSession,userController.profile)
router.get('/checkoutpage',Auth.userSession,userController.checkoutPage)
router.get('/otp',userController.otp)
router.get('/resendOTP',userController.resendotp)
router.get('/orderSuccessPage',Auth.userSession,userController.orderSuccessPage)
router.get('/orderDetails/:id',userController.orderDetails)
router.get('/orderHistory',Auth.userSession,userController.orderHistory)
router.get('/search',userController.search)
router.get('/contact',userController.contact)
router.get('/forgotPassword',userController.forgotPassword)
router.get('/invoice/:id',Auth.userSession,userController.invoice)
router.get('/count',userController.count)

//------------------Post requests------------------------------------------------//
 //router.post('/signup',userController.doSignUp)
router.post('/otp',userController.otp)
router.post('/verifyOTP',userController.verifyotp)
router.post('/resendotp',userController.resendotp)
router.post('/login',userController.doLogin)
router.post('/addToWishlist/:id',ajaxAuth.ajaxSession,userController.addToWishlist)
router.post('/removeFromWishlist/:id',ajaxAuth.ajaxSession,userController.removeFromWishlist)
router.post('/addToCart/:id',ajaxAuth.ajaxSession,userController.addtoCart)
router.post('/deleteFromCart/:id',userController.deleteFromCart)
router.post('/editProfile/:id',userController.editProfile)
router.post('/addAddress/:id',userController.addAddress)
router.post('/deleteaddress',userController.deleteAddress)
router.post('/editaddress',userController.editaddress)
router.post('/updateaddress/:id',userController.updateaddress)
router.post('/incquantity',userController.incquantity)
router.post('/decquantity',userController.decquantity)
router.post('/addDeliveryAddress', userController.addDeliveryAddress)
router.post('/applyCoupon',userController.applyCoupon)
router.post('/removeCoupon',userController.removeCoupon)
router.post('/changepassword/:id',Auth.userSession,userController.changepassword)
router.post('/place-order',Auth.userSession,userController.placeOrder)
router.post('/verifypayment',Auth.userSession,userController.verifypayment);
router.post('/cancelorder',Auth.userSession,userController.cancelOrder)
router.post('/returnorder/:id',Auth.userSession,userController.returnOrder)
router.post('/sortfilter',userController.sortfilter)
router.post('/forgotPassword',userController.verifyemail)
router.post('/resetPassword',userController.resetPassword)
router.post('/walletCheck',userController.walletCheck)
module.exports = router;