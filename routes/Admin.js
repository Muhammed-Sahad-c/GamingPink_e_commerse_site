const express = require("express");
const router = express.Router();
const adminController = require('../Controllers/admin-contorller')
const multer = require('multer')
const path = require('path')


// session checkers
const verfiyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn == true) {
    next();
  } else {
    res.render("admin/admin-login", { adminLogin });
  }
};


/* Multer */
const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error('invalid image type')

    if (isValid) {
      uploadError = null
    }
    console.log("INSIDE MULTER");
    cb(uploadError, './public/admin/assets/images/offerproduct-images')
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })




// statuses
const adminLogin = true;



// admin Routers ---------
router.get("/login", adminController.gettingAdminLoginPage);
router.post("/adminLogin" , adminController.adminLoginValidation);

// Dashboard ------------
router.get("/", verfiyAdminLogin,adminController.gettingDashBoardPage);
// router.get('/test',adminController.test)
// products Routers ------------ 
router.get("/products", verfiyAdminLogin, adminController.gettingProductsPage);
router.get("/addproduct", verfiyAdminLogin, adminController.gettingCategorySelectionPage);
router.post("/addproduct", uploadOptions.array('FPmainimage', 8), adminController.addProduct);
router.get("/edit/:id", verfiyAdminLogin, adminController.gettingEditProductForm);
router.post("/editproduct/:id", uploadOptions.array('FPmainimage', 10), adminController.editProduct)
router.get("/remove/:id", verfiyAdminLogin, adminController.removeProduct)
router.get("/deletedhistory", verfiyAdminLogin, adminController.gettingDeletedHistoryPage);

// Banners Routes ---------
router.get('/bannersmanagementpage', verfiyAdminLogin, adminController.gettingBannerProductsPage);
router.get("/offerProducts", verfiyAdminLogin, adminController.gettingAddOfferProductForm)
router.post("/addOfferProduct", uploadOptions.array('OPimage', 10), adminController.addOfferProduct)
router.get('/removebannerproducts/:id', verfiyAdminLogin, adminController.removeBannerProducts);
router.get('/widebanners', verfiyAdminLogin, adminController.addWideProductsForm)
router.post('/addwideproduct', uploadOptions.array('WPmainimage', 10), adminController.addWideProducts)

// Tags Routes
router.post('/addproducttag/', adminController.addProductTag)

// user Router ----------
router.get("/users", verfiyAdminLogin, adminController.gettingUserDetailsPage);
router.get("/block/:id", adminController.blockingUser);
router.get("/unBlock/:id", adminController.unBlockUser);


//category Routers --------
router.post('/addcategory', adminController.addNewCategory);
router.get('/deletecategory/:id', adminController.deleteCategory);
router.post('/addsubcategories', adminController.addSubCategories);
router.get('/usecategory/:id', adminController.categoryBasedForm);

//order Routers -------------
router.get('/orders', verfiyAdminLogin, adminController.gettingOrderManagemnetPage)
router.get('/ordersoverview/:id', verfiyAdminLogin, adminController.gettingaSpecificOrderDetails)
router.post('/updateStatus', adminController.updateOrderStatus)


// coupon Routers ---------------
router.get('/coupon', adminController.gettingCouponPage);
router.post('/addnewcoupon', adminController.creatingCoupon);


// sales Routes --------------------
router.get('/salesreport', adminController.getSalesRoport);





module.exports = router;
