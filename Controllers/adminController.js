const usermodel = require("../models/userModel")
const sharp = require('sharp');
const categorymodel = require("../models/categoryModel")
const brandmodel = require("../models/brandsModel")
const productmodel = require("../models/productModel")
const adminmodel = require("../models/adminModel")
const couponmodel = require("../models/couponModel")
const bannermodel = require("../models/bannerModel")
const ordermodel = require("../models/orderModel")
const fs= require('fs')




module.exports = {
    //---------------------------------Admin Home-------------------------------------------------------------//   
    adminLogin: (req, res) => {
        try {
            if (!req.session.adminlogIn) {
                res.render('admin/adminlogin',{loginErr:null})

            }
            else {
                res.redirect('/admin/home')
            }
        }
        catch (err) {
            
            next(err)
        }
    },
    doAdminLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const admin = await adminmodel.findOne({ email, password });
           
            if (!admin) {
                
                return res.render('admin/adminlogin',{loginErr:'Invalid Credentials'});

            }
            else{
           
            req.session.adminlogIn = true;
           
            res.redirect('/admin/home')
            }


        }
        catch (err) {
            next(err)
        }

    },

    adminHome: async (req, res) => {
        try {
            if (req.session.adminlogIn) {
                const users = await usermodel.countDocuments()
                const codcount = await ordermodel.find({ 'paymentData.payment_method': "Cash_on_Delivery" }).count()
                const onlinecount = await ordermodel.find({ 'paymentData.payment_method': "Online" }).count()

                // data for line chart
                let salesChartDt = await ordermodel.aggregate([
                    {
                        $match: { order_status: 'placed' }
                    },
                    {
                        $group: {
                            _id: { day: { $dayOfWeek: "$ordered_date" } },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { _id: 1 },
                    },
                ]);

                let SalesCount = []
                for (let i = 1; i < 8; i++) {
                    let found = false
                    for (let j = 0; j < salesChartDt.length; j++) {
                        if (salesChartDt[j]._id.day == i) {
                            SalesCount.push({ _id: { day: i }, count: salesChartDt[j].count })
                            found = true
                            break;
                        }
                    }
                    if (!found) {
                        SalesCount.push({ _id: { day: i }, count: 0 })
                    }
                }
                const salesCounts = SalesCount.map(d => d.count);
                const salesCountsJson = JSON.stringify(salesCounts);
                const order = await ordermodel.find({ order_status: { $ne: "pending" } }).count()
                const product = await productmodel.find({ Status: 'List' }).count()
                const category = await categorymodel.find().count()

                res.render('admin/admin-home', { users, codcount, onlinecount, SalesCount, order,category, product })

            }
            else {
                res.render('admin/adminlogin',{loginerr:null})
            }
        }
        catch (err) {
            next(err)
        }
    },
    //-------------------------------------------Admin Logout-----------------------------------------------------------//    
    adminLogout: (req, res) => {
        try {
            req.session.adminlogIn = false
            res.redirect('/admin')
        }
        catch (err) {
            next(err)
        }
    },
    //---------------------------------------------------User management--------------------------------------------------//    
    listUsers: async (req, res) => {
        try {
            const user = await usermodel.find()
            res.render('admin/listUsers2', { user })
        }
        catch (err) {
            next(err)
        }
    },
    blockUser: async (req, res) => {
        try {
            const id = req.params.id

            await usermodel.findByIdAndUpdate({ _id: id }, { $set: { status: 'blocked' } })
                .then(() => {
                    res.redirect('/admin/users')
                })
        }
        catch (err) {
            next(err)
        }
    },
    unblockUser: async (req, res) => {
        try {
            const id = req.params.id
            await usermodel.findByIdAndUpdate({ _id: id }, { $set: { status: 'unblocked' } })
                .then(() => {
                    res.redirect('/admin/users')
                })
        }
        catch (err) {
            next(err)
        }
    },

    //-----------------------------------------------------------{{Product Management}}-------------------------------------------//

    //----------------------------------------------------------Category Management -----------------------------------------//
    listCategories: async (req, res) => {
        try {
            const category = await categorymodel.find({})
            res.render('admin/listCategories', { category })
        }
        catch (err) {
            next(err)
        }
    },

    addCategorypage: async (req, res) => {
        try {
            res.render('admin/addCategory')
        }
        catch (err) {
            next(err)
        }


    },

    addCategory: async (req, res) => {
        try {
            const { categoryName, Description ,Status} = req.body
            const image = req.files;
            //  image.forEach(img => { });
            //  const categoryimage = image != null ? image.map((img) => img.filename) : null

            // const sharp = require('sharp');

            // // image.forEach(img => {
            // sharp(img.path)
            //     .resize({width: 100, height: 100 }) 
            //     // set the width of the image to 800 pixels, the height will be set automatically to maintain the aspect ratio
            //     .toFile("public/admin/images" + img.filename, (err, info) => {
            //     if (err) throw err;
            //     console.log(info);
            //     });
            // });

            // const categoryimage = image != null ? image.map((img) => img.filename) : null;

            //Resizing images
            let newFilename; // declare the variable outside the loop
            image.forEach(img => {
              const filename = img.originalname;
              newFilename = `howell-Cat-${filename}`;
              sharp(img.path)
                .resize({width: 100,height:100,fit: 'inside',
                background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toFormat('jpeg', { quality: 100 })
                .toFile(`public/admin/images/${newFilename}`, (err, info) => {
                  if (err) throw err;
              //unlinking original images//
                  fs.unlink(img.path, (err) => {
                    if (err) throw err;
                  });
                });
            });
            const categoryimage = image != null ? image.map((img) => newFilename) : null;


            const newCategory = await categorymodel({
                categoryName,
                Description,
                Status,
                image: categoryimage,
            });

            await newCategory
                .save()
                .then(() => {
                    req.session.message = {
                        type: 'success',
                        message: 'Category added successfully'
                      }
                    res.redirect("/admin/categories");
                })
                .catch((err) => {
                    req.session.message = {
                        type: 'danger',
                        message: 'Category with same name is already present'
                      }
                    res.redirect("/admin/addCategoryPage");
                });

        } catch (err) {
            next(err)
        }

    },
    editCategorypage: async (req, res) => {
        try {
            const id = req.params.id
            let category = await categorymodel.findById({ _id: id })
            res.render('admin/editCategory', { category })
        }
        catch (err) {
            next(err)
        }
    },
  
    editcategory:async(req,res)=>{
        try{
            const id = req.params.id;
            const { categoryName, Description ,Status} = req.body;
            const newImages = req.files;
            const category = await categorymodel.findById(id);
            const existingImages= category.image

            let updatedImages = existingImages;
            if (newImages && newImages.length > 0) {
            // updatedImages = existingImages.concat(newImages.map((img) => img.filename));
            //updatedImages = newImages.map((img) => img.filename);


            
            let newFilename;
            newImages.forEach(img => {
                const filename = img.originalname;
                newFilename = `howell-Cat-${filename}`;
                sharp(img.path)
                  .resize({width: 200,height:200,fit: 'inside',
                  background: { r: 255, g: 255, b: 255, alpha: 1 } })
                  .toFormat('jpeg', { quality: 100 })
                  .toFile(`public/admin/images/${newFilename}`, (err, info) => {
                    if (err) throw err;

                  });
              });

            updatedImages = newImages.map((img) => newFilename);


            }

            // Create a new product object with the updated information, including the modified image filenames array
            const updatedCategory = await categorymodel.findOneAndUpdate( {_id:id},{$set:{
            categoryName,
            Description,
            Status,
            image: updatedImages,
            }})
            
            

            // Save the updated product object to the database
            // await updatedCategory.save()
            .then(() => {
                req.session.message = {
                    type: 'success',
                    message: 'Category updated successfully'
                  }
                res.redirect("/admin/categories");
            })
            .catch((err) => {
                req.session.message = {
                    type: 'danger',
                    message: 'Category with same name is already present'
                  }
                res.redirect("back");
            });
        
        }
        catch(err){
            next(err)
        }

    },


    // editCategory: async (req, res) => {
    //     try {
    //         const id = req.params.id;
    //         const { categoryName, Description } = req.body;
    //         const category = await categorymodel.findById(id);
    //         console.log(category)
    //         const images = category.image
    //         console.log(images)


    //         if (req.files) {
    //             const image = req.files;
    //             image.forEach((img) => { });
    //             const categoryImage = image != null ? image.map((img) => img.filename) : null;

    //             await categorymodel.findByIdAndUpdate({ _id: id }, { $set: { image: categoryImage } });
    //             console.log(category)
    //         } else {
    //             // Keep the existing image if no new image was uploaded
    //             // const category = await categorymodel.findById(id);
    //             console.log(category)
    //             // console.log(category.image)
    //             await categorymodel.findByIdAndUpdate({ _id: id }, { $set: { image: images } });
    //             // await categorymodel.findByIdAndUpdate({ _id: id }, { $set: { image: { $each: category.image } } })

    //         }
    //         //   const category = await categorymodel.findById(id);
    //         console.log(category)

    //         await categorymodel.findByIdAndUpdate({ _id: id }, { $set: { categoryName, Description } });
    //         res.redirect('/admin/categories');
    //     } catch (err) {
    //         next(err);
    //     }
    // }
    

    deleteCategory: async (req, res) => {
        try {
            const id = req.params.id
          const category=  await categorymodel.findByIdAndDelete({ _id: id });
            fs.unlink(`public/admin/images/${category.image}`, (err) => {
                if (err) {
                } else {
                }
              });
            res.redirect('/admin/categories')
            }
        
        catch (err) {
            next(err)
        }
    },

    //----------------------------------------------------Brand Management-------------------------------------------------//
    listBrands: async (req, res) => {
        try {
            const brand = await brandmodel.find({})
            res.render('admin/brands', { brand })
        }
        catch (err) {
            next(err)
        }
    },
    addBrand: async (req, res) => {
        try {
            const { brand } = req.body
            let newBrand = brandmodel({
                brand
            })
            await newBrand.save().
                then(() => {
                    req.session.message = {
                        type: 'success',
                        message: 'Brand added successfully'
                      }
                    res.redirect("/admin/brands");
                })
                .catch((err) => {
                    req.session.message = {
                        type: 'danger',
                        message: 'Brand with same name is already present'
                      }
                    res.redirect("/admin/brands");
                });
        }
        catch (err) {
            next(err)
        }
    },

    deleteBrand: async (req, res) => {
        try {
            const id = req.params.id
            await brandmodel.findByIdAndDelete({ _id: id })
            res.redirect("/admin/brands")

        }
        catch (err) {
            next(err)
        }


    },

    //----------------------------------------------------------Products----------------------------------------------------//
    addProductpage: async (req, res) => {
        try {
            const category = await categorymodel.find({})
            const brand = await brandmodel.find({})
            res.render('admin/addProduct', { brand, category })
        }
        catch (err) {
            next(err)
        }
    },
    addProduct: async (req, res) => {
        try {
            const { ProductName, Description, categoryName, Brand, Status, Specifications, Price, Stock } = req.body
       
            // const sizeAndStock= [{size:req.body.SizeAndStock.size, stock:req.body.SizeAndStock.stock}]
            // const SizeAndStock = sizeAndStock['SizeAndStock.size'].map((size, index) => ({ [size]: sizeAndStock['SizeAndStock.stock'][index] }));
            // console.log(SizeAndStock)

            // const SizeAndStock = [{size:req.body.SizeAndStock.size},{stock:req.body.SizeAndStock.stock}]
            // console.log(SizeAndStock)
            // const totalStock = Number(smallstock) + Number (mediumstock) + Number(largestock) + Number(onesizestock)
            const image = req.files;
            // image.forEach(img => { });
            // const productimage = image != null ? image.map((img) => img.filename) : null
            const newFilenames = []; // create an empty array to hold the new filenames
            image.forEach(img => {
              const filename = img.originalname;
              const newFilename = `howell-Prod-${filename}`; // declare the new filename inside the loop
              sharp(img.path)
                .resize({width: 1200,height:1200,fit: 'inside',
                background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toFormat('jpeg', { quality: 100 })
                .toFile(`public/admin/images/${newFilename}`, (err, info) => {
                  if (err) throw err;
  
                  
                  
                });
              newFilenames.push(newFilename); // add the new filename to the array
            });
            const productimage = image != null ? newFilenames : null; // use the new array to create the product image array
            

            const newProduct = await productmodel({
                ProductName,
                Description,
                categoryName,
                Brand,
                Status,
                Specifications,
                Price,
                Stock,
                image: productimage,
            });

            await newProduct
                .save()
                .then(() => {
                    res.redirect("/admin/listProducts");
                })
                .catch((err) => {
                    res.redirect("/admin/addProduct");
                });
        }
        catch (err) {
            next(err)
        }

    },

    listProducts: async (req, res) => {
        try {
            const product = await productmodel.find({})

       
            const productsWithStatus = product.map(prod => {
                const prodStatus = prod.Stock == 0 ? 'Out of Stock' : 'In-Stock';
                return { ...prod.toObject(), prodStatus };
            });




            //     let totalStock = product.SizeAndStock.reduce((sum, sizeAndStock) => {
            //     return sum + sizeAndStock.stock;
            //     }, 0);
            //     console.log(totalStock);

            // const products = await prodmodel.find({})

            // let totalStock = products.reduce((sum, product) => {
            //     return sum + product.SizeAndStock.reduce((sizeSum, sizeAndStock) => {
            //         return sizeSum + sizeAndStock.stock;
            //     }, 0);
            // }, 0);
            
            res.render('admin/listProducts', { product: productsWithStatus })


        }
        catch (err) {
            next(err)
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const id = req.params.id
            await productmodel.findByIdAndDelete({ _id: id });
            res.redirect('/admin/listProducts')
        }
        catch (err) {
            next(err)
        }
    },
    editProductPage: async (req, res) => {
        try {
            const id = req.params.id
            let product = await productmodel.findById({ _id: id })
            const category = await categorymodel.find({})
            const brand = await brandmodel.find({})
            res.render('admin/editProduct', { product, category, brand })
        }
        catch (err) {
            next(err)
        }
    },
    editProduct: async (req, res) => {
        try {
            const id = req.params.id
            const { ProductName, Description, categoryName, Brand, Specifications, Price, Stock, Status } = req.body
            const product = await productmodel.findOne({_id:id})
            const existingImages= product.image
            let newImages = req.files
            let updatedImages = existingImages;
            if (newImages && newImages.length > 0) {
            // updatedImages = existingImages.concat(newImages.map((img) => img.filename));

            const newFilenames = []; // create an empty array to hold the new filenames
            newImages.forEach(img => {
              const filename = img.originalname;
              const newFilename = `howell-Prod-${filename}`; // declare the new filename inside the loop
              sharp(img.path)
                .resize({width: 1200,height:1200,fit: 'inside',
                background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toFormat('jpeg', { quality: 100 })
                .toFile(`public/admin/images/${newFilename}`, (err, info) => {
                  if (err) throw err;
              
                });
              newFilenames.push(newFilename); // add the new filename to the array
            });
            updatedImages = newImages != null ? newFilenames : null;

           // updatedImages = newImages.map((img) => img.filename);
            }

           

            let data = await productmodel.findOneAndUpdate(
                { _id: id }, {
                    $set: {
                        ProductName,
                        Description,
                        categoryName,
                        Brand,
                        Specifications,
                        Price,
                        Stock,
                        Status,
                        image: updatedImages,

                    }
            }
              
            )
            await data.save().then(() => {
                res.redirect('/admin/listProducts')
            })

        }
        catch (err) {
            next(err)
        }

    },

    viewProduct: async (req, res) => {
        try {
            const id = req.params.id
            const category = await categorymodel.find({})
            const brand = await brandmodel.find({})
            let product = await productmodel.findById({ _id: id })
            res.render('admin/viewProduct', { product, category, brand })

        }
        catch (err) {
            next(err)
        }
    },

    // -------------------------------------------Coupon Management----------------------------------------------------------//
    listCoupons: async (req, res) => {
        try {
            const coupon = await couponmodel.find({})
            res.render('admin/listCoupons', { coupon })
        }
        catch (err) {
            next(err)
        }
    },
    addCouponPage: (req, res) => {
        try {
            res.render('admin/addCoupon')
        }
        catch (err) {
            next(err)
        }
    },
    addCoupon: async (req, res) => {
        try {
            const { couponName, couponCode, minAmount, discount, expiryDate } = req.body
            console.log(req.body)
            const newCoupon = couponmodel({
                couponName,
                couponCode,
                minAmount,
                discount,
                expiryDate
            });

            await newCoupon
                .save()
                .then(() => {
                    req.session.message = {
                        type: 'success',
                        message: 'Coupon added successfully'
                      }

                    res.redirect("/admin/coupons");
                })
                .catch((err) => {
                    req.session.message = {
                        type: 'danger',
                        message: 'Coupon with same code is already present'
                      }
                    res.redirect("/admin/addCouponPage");
                });

        }
        catch (err) {
            next(err)
        }
    },
    editCouponPage: async (req, res) => {
        try {
            const id = req.params.id
            const coupon = await couponmodel.findOne({ _id: id })
            res.render('admin/editCoupon', { coupon })
        }
        catch (err) {
            next(err)
        }
    },
    editCoupon: async (req, res) => {
        try {
            const id = req.params.id
            const { couponName, couponCode, minAmount, discount, expiryDate } = req.body
            await couponmodel.findByIdAndUpdate({ _id: id }, {
                $set: {
                    couponName,
                    couponCode,
                    minAmount,
                    discount,
                    expiryDate
                }
            })
            .then(() => {
                req.session.message = {
                    type: 'success',
                    message: 'Coupon updated successfully'
                  }
                res.redirect("/admin/coupons");
            })
            .catch((err) => {
                req.session.message = {
                    type: 'danger',
                    message: 'Coupon with same code is already present'
                  }
                res.redirect("back");
            });
            // res.redirect('/admin/coupons')
        }
        catch (err) {
            next(err)
        }
    },
    deleteCoupon: async (req, res) => {
        try {
            const id = req.params.id
            await couponmodel.findByIdAndDelete({ _id: id })
            res.redirect('/admin/coupons')
        }
        catch (err) {
            next(err)
        }
    },
    //----------------------------------------------------Banner management------------------------------------------------//
    listBanners: async (req, res) => {
        try {
            const banner = await bannermodel.find({})
            res.render('admin/banners', { banner })
        }
        catch (err) {
            next(err)
        }
    },
    addBannerPage: (req, res) => {
        try {
            res.render('admin/addBanner')
        }
        catch (err) {
            next(err)
        }
    },
    addBanner: async (req, res) => {
        try {
            const { bannerName, description, status } = req.body
            const image = req.files;
            // image.forEach(img => { });
            // const bannerimage = image != null ? image.map((img) => img.filename) : null
            let newFilename; // declare the variable outside the loop
image.forEach(img => {
  const filename = img.originalname;
  newFilename = `howell-${filename}`;
  sharp(img.path)
    .resize({width: 1500,height:391 ,fit: 'inside',
    background: { r: 255, g: 255, b: 255, alpha: 1 }})
    .toFormat('jpeg', { quality: 100 })
    .toFile(`public/admin/images/${newFilename}`, (err, info) => {
      if (err) throw err;
      console.log(info);
    
    });
});
const bannerimage = image != null ? image.map((img) => newFilename) : null;


            const newBanner = bannermodel({
                bannerName,
                description,
                status,
                image: bannerimage,
            });
        

            await newBanner
                .save()
                .then(() => {
                    req.session.message = {
                        type: 'success',
                        message: 'Banner added successfully'
                      }
                    res.redirect("/admin/banners");
                })
                .catch((err) => {
                    req.session.message = {
                        type: 'danger',
                        message: 'Banner with same name is already present'
                      }
                    res.redirect("/admin/addBanner");

        })
    }
        catch (err) {
            next(err)
        }
    },
    editBannerPage: async (req, res) => {
        try {
            const id = req.params.id
            const banner = await bannermodel.findOne({ _id: id })
            res.render('admin/editBanner', { banner })
        }
        catch (err) {
            next(err)
        }
    },
    editBanner: async (req, res) => {
        try {
            const id = req.params.id
            const { bannerName, description, status } = req.body
           
                // test
                
                const newImages = req.files;
                const banner = await bannermodel.findById(id);
                const existingImages= banner.image
    
                let updatedImages = existingImages;
                if (newImages && newImages.length > 0) {
                // updatedImages = existingImages.concat(newImages.map((img) => img.filename));--to add image to existing image
                //updatedImages = newImages.map((img) => img.filename);

                let newFilename;
                newImages.forEach(img => {
                    const filename = img.originalname;
                    newFilename = `howell-${filename}`;
                    sharp(img.path)
                      .resize({width: 1500,height:391,fit: 'inside',
                      background: { r: 255, g: 255, b: 255, alpha: 1 } })
                      .toFormat('jpeg', { quality: 100 })
                      .toFile(`public/admin/images/${newFilename}`, (err, info) => {
                        if (err) throw err;
                        
                      });
                  });

                updatedImages = newImages.map((img) => newFilename);


                }
    
                // Create a new product object with the updated information, including the modified image filenames array
                const updatedBanner = await bannermodel.findByIdAndUpdate({_id:id},{$set:{
                bannerName, description, status,
                image: updatedImages,
                }
            })
            .then(() => {
                req.session.message = {
                    type: 'success',
                    message: 'Banner updated successfully'
                  }
                res.redirect("/admin/banners");
            })
            .catch((err) => {
                req.session.message = {
                    type: 'danger',
                    message: 'Banner with same name is already present'
                  }
                res.redirect("back");
            });
                
    
               
                
            }
        catch (err) {
            next(err)
        }
    },
    deleteBanner: async (req, res) => {
        try {
            const id = req.params.id
            await bannermodel.findByIdAndDelete({ _id: id })
            res.redirect('/admin/banners')
        }
        catch (err) {
            next(err)
        }
    },
    //---------------------------------------------------ordermanagement------------------------------------------------------//
    orderList: async (req, res) => {
        try {
            const order = await ordermodel.find().populate('userid').sort({ ordered_date: -1 })

            res.render('admin/orderlist', { order })
        }
        catch (err) {
            next(err)
        }
    },
    viewOrder: async (req, res) => {
        try {
            const orderid = req.params.id
            const orderdata = await ordermodel.findOne({ _id: orderid }).populate(["userid", "products.product_id",])
            
            res.render('admin/orderSummary', { orderdata })
        }
        catch (err) {
            next(err)
        }
    },
    deliverystatus: (req, res) => {
        try {
            if (req.body.Status == "shipped") {
                ordermodel
                    .updateOne(
                        { _id: req.body.id },
                        {
                            $set: {
                                "delivery_status.shipped.state": true,
                                "delivery_status.shipped.date": Date.now(),
                            },
                        }
                    )
                    .then((data) => {
                        res.redirect("/admin/viewOrder/" + req.body.id);
                    });
            } else if (req.body.Status == "out_for_delivery") {
                ordermodel
                    .updateOne(
                        { _id: req.body.id },
                        {
                            $set: {
                                "delivery_status.out_for_delivery.state": true,
                                "delivery_status.out_for_delivery.date": Date.now(),
                            },
                        }
                    )
                    .then((data) => {
                        res.redirect("/admin/viewOrder/" + req.body.id);
                    });
            } else if (req.body.Status == "delivered") {
                ordermodel
                    .updateOne(
                        { _id: req.body.id },
                        {
                            $set: {
                                "delivery_status.delivered.state": true,
                                "delivery_status.delivered.date": Date.now(),
                            },
                        }
                    )
                    .then((data) => {
                        res.redirect("/admin/viewOrder/" + req.body.id);
                    });
            } else {
                res.redirect("/admin/viewOrder/" + req.body.id);
            }
        }
        catch (err) {
            next(err)
        }
    },
    paymentpending: (req, res) => {
        try {
            ordermodel
                .updateOne(
                    { _id: req.body.id },
                    { $set: { "paymentData.payment_status": "completed" } }
                )
                .then(() => {
                    res.json("completed");
                });
        } catch (error) {
            next(error);
        }
    },
    //-----------------------------------------------------Report----------------------------------------------------------//
    report: (req, res) => {
        try {
            res.render('admin/report')
        }
        catch (err) {
            next(err)
        }
    },
    salesReport: async (req, res, next) => {
        try {
           
            

// Get the current date/time in your local timezone
const now = new Date();

// Get the date portion of the current date/time in your local timezone
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Set the fromDate and toDate values to match your local timezone
const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
const toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

let salesData = await ordermodel.aggregate([
    {
        $match: {
            order_status: "placed",
            $and: [
                { ordered_date: { $gte: fromDate } },
                { ordered_date: { $lte: toDate } },
            ],
        },
    },
    {
        $project: {
            ordered_date: { $dateToString: { format: "%Y-%m-%d", date: "$ordered_date" } },
            userid: 1,products:1,bill_amount:1,coupon:1
        },
    },
    {
        $lookup: {
            from: "userdatas",
            localField: "userid",
            foreignField: "_id",
            as: "user",
        },
    },
    { $sort: { ordered_date: -1 } },
]);


          
            res.render('admin/salesReport', { salesData })
        } catch (err) {
            next(err);
        }
    },
// ---------------------------------------------------------Invoice-----------------------------------------------------//
viewInvoice:async(req,res)=>{
try{
    const orderid= req.params.id
    const orderdata = await ordermodel.findOne({ _id: orderid }).populate(["userid", "products.product_id",])
    res.render('admin/invoice',{orderdata})
}
catch(err){
    next(err)
}
}

}