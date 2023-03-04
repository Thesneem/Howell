const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController')
const adminSession = require ('../middlewares/authentication')


//-----------------------------GET request-------------------------------//
router.get('/',adminController.adminLogin)
router.get('/home',adminSession.adminSession,adminController.adminHome)
router.get('/logout',adminController.adminLogout)
router.get('/users',adminSession.adminSession,adminController.listUsers)
// router.get('/staff',adminSession.adminSession,adminController.liststaff)
// router.get('/addStaff',adminSession.adminSession,adminController.addStaffPage)
router.get('/categories',adminSession.adminSession,adminController.listCategories)
router.get('/addCategorypage',adminSession.adminSession ,adminController.addCategorypage)
router.get('/editCategorypage/:id',adminSession.adminSession,adminController.editCategorypage)
router.get('/brands',adminSession.adminSession,adminController.listBrands)
router.get('/addProduct',adminSession.adminSession,adminController.addProductpage)
router.get('/listProducts',adminController.listProducts)
router.get('/editProduct/:id',adminController.editProductPage)
router.get('/viewProduct/:id',adminSession.adminSession,adminController.viewProduct)
router.get('/coupons',adminSession.adminSession,adminController.listCoupons)
router.get('/addCouponPage',adminSession.adminSession,adminController.addCouponPage)
router.get('/editCoupon/:id', adminSession.adminSession,adminController.editCouponPage)
router.get('/banners',adminSession.adminSession,adminController.listBanners)
router.get('/addBanner',adminSession.adminSession,adminController.addBannerPage)
router.get('/editBanner/:id',adminSession.adminSession,adminController.editBannerPage)
router.get('/orders',adminSession.adminSession,adminController.orderList)
router.get('/salesreport',adminSession.adminSession,adminController.report)
router.get('/viewOrder/:id',adminSession.adminSession,adminController.viewOrder)
router.get('/invoice/:id',adminSession.adminSession,adminController.viewInvoice)

//------------------------------POST request----------------------------------//
router.post('/adminlogin',adminController.doAdminLogin)
router.post('/blockUser/:id', adminSession.adminSession,adminController.blockUser)
router.post('/unblockUser/:id',adminSession.adminSession,adminController.unblockUser)
//router.post('/users/:id',adminController.userAction)
// router.post('/addStaff',adminSession.adminSession,adminController.addStaff)
// router.post('/blockStaff/:id', adminSession.adminSession,adminController.blockStaff)
// router.post('/unblockStaff/:id',adminSession.adminSession,adminController.unblockStaff)
router.post('/addCategory',adminSession.adminSession,adminController.addCategory)
router.post('/deleteCategory/:id',adminSession.adminSession,adminController.deleteCategory)
router.post('/addBrand',adminSession.adminSession,adminController.addBrand)
router.post('/deleteBrand/:id',adminSession.adminSession,adminController.deleteBrand)
router.post('/addProduct',adminController.addProduct)
router.post('/deleteProduct/:id',adminSession.adminSession,adminController.deleteProduct)
router.post('/editProduct/:id',adminController.editProduct)
router.post('/editCategory/:id',adminController.editcategory)
router.post('/addCoupon',adminSession.adminSession,adminController.addCoupon)
router.post('/editCoupon/:id',adminSession.adminSession,adminController.editCoupon)
router.post('/deleteCoupon/:id',adminSession.adminSession,adminController.deleteCoupon)
router.post('/addBanner',adminSession.adminSession,adminController.addBanner)
router.post('/editBanner/:id',adminSession.adminSession,adminController.editBanner)
router.post('/deleteBanner/:id',adminSession.adminSession,adminController.deleteBanner)
router.post('/deliverystatus',adminSession.adminSession,adminController.deliverystatus)
router.post('/report/sales',adminSession.adminSession,adminController.salesReport)



router.post('/paymentpending',adminController.paymentpending)

module.exports = router;
