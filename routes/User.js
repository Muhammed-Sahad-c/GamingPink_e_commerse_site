
var express = require("express");
var router = express.Router();
const userController = require('../Controllers/user-controller')

/* partials */
const clintNav = true;

/*  Session Checkers */
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.render("user/login", { clintNav });
  }
};

const ajaxVerifyLogin = (req, res, next) => {
  // checking weather user logged or not
  if (req.session.loggedIn) {
    next();
  } else {
    res.json('login first');
  }
};




// Home Routes-------
router.get("/", userController.gettingHomePage);
router.get('/aboutUS',userController.aboutUS)

// products-----------
router.get('/categoryofproducts/:id', userController.getProductsBasedOnCategory)
router.get("/detail/:id", userController.gettingSingleProductView);
router.get('/getproductsbasedonsubcategory/:id', userController.filterProductsBasedOnSubCategory)

// Login Routres----------
router.get("/login", verifyLogin, userController.gettingLoginPage);
router.post("/user/Logindata", userController.loginFormData)
router.get("/logout", userController.logOut);

// Signup Routers--------
router.get("/signup", userController.gettingSignUpPage);
router.post("/user/SUsubmit", userController.signUpFormData);
router.post("/user/GETOTP", userController.OTPValidator);

// Profile Routers------- 
router.get("/profile", verifyLogin, userController.gettingProfilePage)
router.get('/editprofile/:id', userController.gettingDetailsforEditDetails)
router.post('/user/updateuserdetails/:id', userController.editedUserDatas)
router.get('/addaddress', verifyLogin, userController.addNewAddressForm);
router.post('/user/addnewaddress', verifyLogin, userController.addNewAddressFormData)

// cart Routers----------
router.get('/cart', verifyLogin, userController.gettingCartPage);
router.get('/addproducttocart/:id', ajaxVerifyLogin, userController.addProductTocart);
router.post('/changeproductquantitiy/', userController.changeProductQuantity)
router.get('/deletecartproducts/', ajaxVerifyLogin, userController.deleteCartProducts);

// placeOrders Routers----------
router.post('/createorderid', ajaxVerifyLogin, userController.createOrderId)
router.get('/placeorder/:id', verifyLogin, userController.placeOrder);
router.post('/selectaddressforordersdetails/', ajaxVerifyLogin, userController.useExistAddress);
router.post('/addnewaddressfromcheckout', ajaxVerifyLogin, userController.addingPlaceHoderAddress)
router.post('/checkout', ajaxVerifyLogin, userController.checkout); // cash on delivery
router.post('/checkoutwithpaypal', ajaxVerifyLogin, userController.checkoutWithOnlinePayment);

// my orders Routers-----------
router.get('/myorders', verifyLogin, userController.myOrders);
router.get('/orderdetailsview/:id', verifyLogin, userController.ordersDetailView)
router.post('/cancelOrder',ajaxVerifyLogin,userController.cancelOrder)

// coupon Routers-----------
router.post('/usercouponapply', ajaxVerifyLogin, userController.couponApplayStatusChecker);
router.post('/removecopon', ajaxVerifyLogin, userController.removeCoupon)


// filter Routes --------------
router.get('/filterbyhightolow/:id', userController.filterProductByPriceHighToLow)
// router.get('/filterbylatest')

// wishList Routes --------------
router.get('/addtowishlist/:id', ajaxVerifyLogin, userController.addToWishList);
router.get('/wishlist', verifyLogin, userController.gettingWishilstPage)
router.get('/removewishlistproduct/:id', ajaxVerifyLogin, userController.removeFromWishList)

// compare Product Routers --------  

router.get('/compare', verifyLogin, userController.getCompareProductPage)
router.get('/addtocompare/:id', verifyLogin, userController.addProductToCompare)
router.get('/removeproductfromcompare/:id', verifyLogin, userController.removeProductFromCompareProducts)


router.get('/faliedorder', userController.orderSuccessfull)
router.get('/successorder', userController.orderSuccessfull)




module.exports = router;
