const productHelper = require("../Model/product-helpers");
const userHelper = require("../Model/user-helpers");
const cartHelper = require('../Model/cart-helpers');
const checkoutHelper = require('../Model/checkout-helpers');
const ordersHelper = require('../Model/order-helpers');
const couponHelpers = require("../Model/coupon-helpers");
const { ObjectID, Db } = require("mongodb");
const bannerHelpers = require("../Model/banner-Helpers");
const wishlistHelper = require("../Model/wishlist-helpers");
const compareProductHelper = require("../Model/compare-helpers");


let userData;
const passwordStatus = true;
const otpStatus = true;
const loginEmailStatus = true;
const signupEmailStatus = true;
const blockStatus = true;
const Clint = true;
const clintNav = true;

const emptyStatus = true;
const addAddress = true;
const couponStatus = true;

/*  OTP CREATOR */
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

const baseTitle = 'Gaming Pink | Select Your Own Style and Buid Your PC now!'
const signupTitle = 'Gaming Pink | Sign Up';
const loginTitle = 'Gaming Pink | Login';
const ordersTitle = 'Gaming Pink | orders'
const fllterTitle = 'Gaming Pink | Products'

let outOfDelivery = true;
const shipped = true
const deliveried = true;

const wishlistTab = true;
const ordersTab = true;
const cancelled = true;
const errorpage = true
const cartTab = true

const dateFinder = () => {
    var nowDate = new Date();
    var date = nowDate.getFullYear() + '-' + 0 + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    return date;
}




module.exports = {

    // home controller -----------

    gettingHomePage: async (req, res, next) => {
        let name = req.session.userDetailsInSession
        let cartCount = 0;
        let ordersCount = 0;
        let wishlistCount = 0;
        if (req.session.userDetailsInSession) {
            cartCount = await cartHelper.gettingCartProductsCount(name._id);
            ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
            wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
            if (wishlistCount.Wishlist) {
                wishlistCount = wishlistCount.Wishlist.length
            } else {
                wishlistCount = 0
            }
            ordersCount = ordersCount.length;
        }
        productHelper.getAllProducts().then((products) => {
            bannerHelpers.getOfferProducts().then((offerprdct) => {
                productHelper.getCategories().then((categories) => {
                    productHelper.featuredProducts().then((Featured) => {
                        bannerHelpers.findWideProducts().then((wideProducts) => {
                            res.render("user/home", { Clint, products, name, offerprdct, categories, cartCount, Featured, ordersCount, wishlistCount, wideProducts, title: baseTitle });
                        })
                    })
                })
            });
        });
    },


    // Authentincation Controller ----------

    gettingLoginPage: (req, res, next) => {
        res.render("user/home", { clintNav, title: baseTitle });
    },

    gettingSignUpPage: (req, res, next) => {
        res.render("user/signup", { clintNav, title: 'Gaming Pink | Signup' });
    },

    logOut: (req, res, next) => {
        req.session.destroy();
        console.log("Logged Out..");
        res.redirect("/");
    },

    gettingSingleProductView: async (req, res, next) => {
        try {
            req.session.userOrderAddress = null;
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            userHelper.getProductDetails(req.params.id).then((product) => {
                userHelper.getRelated(product[0]?.FPsubcategory).then((relatedProducts) => {
                    res.render("user/detail", { product, relatedProducts, name, Clint, cartCount, ordersCount, wishlistCount, title: "Gamin Pink | " + product[0].FPname });
                });
            });

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    signUpFormData: (req, res, next) => {
        try {
            userData = req.body;
            //password checking
            if (userData.SUpassword == userData.SUrepassword) {
                var mailOptions = {
                    to: req.body.SUemail,
                    from: "GamingPink@gmail.com",
                    subject: "Otp for registration is: ",
                    html:
                        "<h3>OTP for account verification is </h3>" +
                        "<h1 style='font-weight:bold;'>" +
                        otp +
                        "</h1>", // html body
                };
                // showing otp page afte OTP sent
                userHelper.doSignup(mailOptions, req.body).then((status) => {
                    //cheking email existing stattus
                    if (status == true) {
                        res.render("user/otp", { clintNav, title: baseTitle });
                    } else {
                        res.render("user/signup", { signupEmailStatus, clintNav, title: signupTitle });
                    }
                });
            } else {
                res.render("user/signup", { passwordStatus, clintNav, title: signupTitle });
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    OTPValidator: (req, res, next) => {
        try {
            // sending otp userdata and Orj otp for cheking
            userHelper.otpVerification(req.body, otp, userData).then((data) => {
                if (data == false) {
                    res.render("user/otp", { otpStatus, clintNav, title: signupTitle });
                } else {
                    req.session.userDetailsInSession = data;
                    res.redirect("/");
                }
            });

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    loginFormData: (req, res, next) => {
        try {
            userHelper.doLogin(req.body).then((status) => {
                if (status == true) {
                    res.render("user/login", { blockStatus, clintNav, title: loginTitle });
                } else if (status == null) {
                    res.render("user/login", { loginEmailStatus, clintNav, title: loginTitle });
                } else if (status) {
                    req.session.userDetailsInSession = status;
                    req.session.loggedIn = true;
                    // req.session.userdetails = status;
                    res.redirect("/");
                } else {
                    // incurrect Password!
                    res.render("user/login", { passwordStatus, clintNav, title: loginTitle });
                }
            });
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },



    // Products Controller --------------

    getProductsBasedOnCategory: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            productHelper.findASpecificCategory(req.params.id).then((categoryname) => {
                productHelper.findSubCategories(categoryname).then((categoryProduct) => {
                    productHelper.findProductsBasedOnCategory(categoryname).then((products) => {
                        res.render('../views/user/category-details.hbs', { Clint, categoryProduct, categoryname, products, name, cartCount, ordersCount, wishlistCount, title: 'Gamin Pink | ' + categoryname })
                    })
                })
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    filterProductsBasedOnSubCategory: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            subCategory = req.params.id
            const products = await productHelper.findProductsBasedOnSubCategory(req.params.id);
            const categoryProduct = await productHelper.findSubCategories(products[0].FPcategory)
            const categoryname = products[0].FPcategory;
            res.render('../views/user/category-details.hbs', { Clint, categoryProduct, categoryname, products, name, cartCount, ordersCount, wishlistCount, subCategory, title: 'Gamin Ping | ' + subCategory })

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    // Profile Controller -------------- 

    gettingProfilePage: (req, res, next) => {
        try {
            userHelper.gettingProfileDetails(req.session.userDetailsInSession).then((userData) => {
                res.render('user/profile', { clintNav, userData, title: 'Gaming Pink | Profile' })
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    gettingDetailsforEditDetails: (req, res, next) => {
        try {
            userHelper.gettingUserDetailsForEdit(req.params.id).then((editProfile) => {
                const userAddressArray = editProfile[0].userAddrsess
                res.render('user/profile', { clintNav, editProfile, userAddressArray, title: 'Gaming Pink | edit User Details' });
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    editedUserDatas: (req, res, next) => {
        try {
            userHelper.updatingUserDetails(req.params.id, req.body).then(() => {
                res.redirect('/profile')
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    addNewAddressForm: (req, res, next) => {
        try {
            res.render('user/addAddress', { clintNav, title: 'Gaming Pink | Add New Address' })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    addNewAddressFormData: (req, res, next) => {
        try {
            userHelper.updateNewAddress(req.body, req.session.userDetailsInSession._id).then(() => {
                res.redirect('/profile');
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    // Cart Contorller -------------

    gettingCartPage: async (req, res, next) => {
        try {
            const name = req.session.userDetailsInSession;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            placeOrderDisableStatus = false
            const userID = req.session.userDetailsInSession._id;
            const cartProductDetails = await cartHelper.chekingCartStatus(userID);
            if (cartProductDetails == false) {
                res.render('../views/user/cart.hbs', { Clint, name, emptyStatus, ordersCount, wishlistCount, cartTab, title: 'Gaming Pink | cart' }); // cart Empty
            } else {
                // checking if is there any out of stock product
                for (let i = 0; i < cartProductDetails.length; i++) {
                    products = cartProductDetails[i]
                    if (products.products.outOfStock) {
                        placeOrderDisableStatus = true
                        break;
                    } else {
                        break
                    }
                }
                let total = await cartHelper.gettingTotalPriceProducts(userID);
                const priceDetails = {
                    subTotal: total[0].subTotal,
                    grandTotal: total[0].grandTotal,
                    cartPrdctCount: cartProductDetails.length,
                    discount: total[0].subTotal - total[0].grandTotal,
                }
                res.render('../views/user/cart.hbs', { Clint, name, cartProductDetails, priceDetails, placeOrderDisableStatus, ordersCount, wishlistCount, cartTab, title: 'Gaming Pink | cart' });
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    addProductTocart: async (req, res, next) => {
        try {
            productID = req.params.id;
            userID = req.session.userDetailsInSession._id;
            cartHelper.addToCart(productID, userID).then((newProductStatus) => {
                if (newProductStatus == true) {
                    res.json({ status: true, newProductStatus: true })
                } else {
                    res.json({ status: true })
                }
            })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    changeProductQuantity: async (req, res, next) => {
        try {
            userID = req.session.userDetailsInSession._id;
            if (req.session.loggedIn == true) {
                cartHelper.updatingCartProductsCount(req.body).then(async (data) => {
                    if (data != false && data != null) {
                        let total = await cartHelper.gettingTotalPriceProducts(userID);
                        const priceDetails = {
                            status: data,
                            subTotal: total[0].subTotal,
                            grandTotal: total[0].grandTotal,
                            discount: total[0].subTotal - total[0].grandTotal,
                        }
                        res.json(priceDetails);
                    } else {
                        res.json(data)
                    }
                })
            } else {
                res.redirect('/login')
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    deleteCartProducts: async (req, res, next) => {
        try {
            const removePrdouct = await cartHelper.removeCartProduct(req.query)
            res.json(true);
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },



    // Checkout Controller  ---------------- 

    placeOrder: async (req, res, next) => {
        try {
            createdOrderId = req.params.id
            const name = req.session.userDetailsInSession._id
            priceDetails = await ordersHelper.getOrderDetails(createdOrderId);
            if (priceDetails.couponStatus == true) {
                priceDetails.grandTotal -= priceDetails.couponDiscount
                priceDetails.discount += priceDetails.couponDiscount
                userHelper.gettingUserDetailsForEdit(name).then((data) => {
                    data = data[0].userAddrsess;
                    res.render('user/checkout', { Clint, name, data, priceDetails, createdOrderId, couponStatus, title: 'Gaming Pink | Checkout Products' });
                })
            } else {
                userHelper.gettingUserDetailsForEdit(name).then((data) => {
                    data = data[0].userAddrsess;
                    res.render('user/checkout', { Clint, name, data, priceDetails, createdOrderId, title: 'Gaming Pink | Checkout Products' });
                })
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    createOrderId: async (req, res, next) => {
        try {
            userID = req.session.userDetailsInSession._id
            const total = await cartHelper.gettingTotalPriceProducts(userID);
            const priceDetails = {
                userId: ObjectID(userID),
                subTotal: total[0].subTotal,
                grandTotal: total[0].grandTotal,
                discount: total[0].subTotal - total[0].grandTotal,
                couponStatus: false,
                couponDiscount: 0
            }
            const userOrderId = await ordersHelper.createOrderId(priceDetails);
            res.json(userOrderId);
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    addingPlaceHoderAddress: async (req, res, next) => {
        try {
            const customAddress = req.body.newAddressObj;
            const result = await checkoutHelper.updatingNewAddressInOrderDetails(req.body.newAddressObj, req.body.orderID, req.session.userDetailsInSession._id)
            res.json(customAddress);
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    useExistAddress: async (req, res, next) => {
        try {
            const result = await checkoutHelper.updatingExistingAccountInOrderDetais(req.session.userDetailsInSession._id, req.body.addressIndex, req.body.orderID)
            res.json(result)
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    checkout: async (req, res, next) => {
        try {
            const checkout = await checkoutHelper.cartProductsCheckout(req.body.orderID)
            if (!checkout) {
                res.json(false);
            } else {
                const date = dateFinder()
                const userID = req.session.userDetailsInSession._id;
                const cartProducts = await checkoutHelper.getCartProductList(req.session.userDetailsInSession._id);
                checkoutHelper.confirmingOrder(userID, req.body.data, req.body.orderID, cartProducts.productsDetails, date).then(() => {
                    res.json(true)
                })
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    checkoutWithOnlinePayment: async (req, res, next) => {
        try {
            const checkout = await checkoutHelper.cartProductsCheckout(req.body.orderID)
            if (!checkout) {
                res.json(false);
            } else {
                const date = dateFinder()
                const userID = req.session.userDetailsInSession._id;
                const cartProducts = await checkoutHelper.getCartProductList(req.session.userDetailsInSession._id);
                const doOnlinePayment = await checkoutHelper.doOnlinePayment(req.body.orderID, cartProducts.productsDetails, date, userID, req.body)
                res.json(doOnlinePayment)
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    // Orders Controller -------- 

    myOrders: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
            }
            let pendingProducts = await ordersHelper.gettingPendingOrderDetails(req.session.userDetailsInSession._id);
            pendingProducts = pendingProducts.reverse();
            const deliveriedProducts = await ordersHelper.gettingDeliveriedAndCanceldOrderDetails(req.session.userDetailsInSession._id);
            const cancellorders = await ordersHelper.gettingCancelledOrderDetails(req.session.userDetailsInSession._id);
            if (deliveriedProducts[0] == null && pendingProducts[0] == null && cancellorders[0] == null) {
                res.render('../views/user/myorders.hbs', { Clint, emptyStatus, title: ordersTitle, name });
            } else {
                res.render('../views/user/myorders.hbs', { Clint, pendingProducts, deliveriedProducts, cartCount, wishlistCount, ordersTab, title: ordersTitle, cancellorders, name });

            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    ordersDetailView: async (req, res, next) => {
        try {
            const name = req.session.userDetailsInSession;
            let finalDiscount = 0;
            const orderDetails = await ordersHelper.gettingaSpecificOrderDetails(req.params.id)
            if (orderDetails[0].couponStatus) {
                finalDiscount = orderDetails[0].grandTotal - orderDetails[0].couponDiscount
                orderDetails[0].finalDiscount = finalDiscount
            }


            if (orderDetails[0].orderStatus == 'Shipped') {
                res.render('../views/user/orderdetailView.hbs', { Clint, orderDetails, shipped, title: ordersTitle, name })
            } else if (orderDetails[0].orderStatus == 'Outofdelivery') {
                res.render('../views/user/orderdetailView.hbs', { Clint, orderDetails, outOfDelivery, title: ordersTitle, name })
            } else if (orderDetails[0].orderStatus == 'Delivaried') {

                res.render('../views/user/orderdetailView.hbs', { Clint, orderDetails, deliveried, title: ordersTitle, name })
            } else if (orderDetails[0].orderStatus == 'Cancelled') {
                res.render('../views/user/orderdetailView.hbs', { Clint, orderDetails, cancelled, title: ordersTitle, name })
            }
            else {
                res.render('../views/user/orderdetailView.hbs', { Clint, orderDetails, title: ordersTitle })
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    cancelOrder: async (req, res, next) => {
        try {
            const cancelOrder = await ordersHelper.cancelOrderByUser(req.body.orderID)
            res.json(true);
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    // coupon controller ---------

    couponApplayStatusChecker: async (req, res, next) => {
        try {
            date = dateFinder();
            const couponChecker = await couponHelpers.applingCouponByUsingUserCode(req.body.couponCode, date, req.session.userDetailsInSession._id, req.body.orderID);
            if (couponChecker == false) {
                res.json(false)
            } else if (couponChecker == null) {
                res.json(null)
            }
            else {
                // console.log(couponChecker)
                const updateAppliedUsers = await couponHelpers.updateCouponAppliedUserDetails(req.body.couponCode, req.session.userDetailsInSession._id)
                couponDetails = {
                    status: couponChecker,
                    code: req.body.couponCode
                }
                res.json(couponDetails)
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    removeCoupon: async (req, res, next) => {
        try {
            console.log(req.body)
            const removeStatus = couponHelpers.removeAppliedCouponFromUser(req.body.couponCode, req.session.userDetailsInSession._id, req.body.orderID)
            res.json(true);
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },





    // filter Controllers -----------------

    filterProductByPriceHighToLow: async (req, res, next) => {
        try {
            const data = req.params.id.split(',')
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            if (data.length == 3) {
                const categoryname = data[0]
                sortCount = data[1];
                subCategory = data[2]
                productHelper.findSubCategories(categoryname).then(async (categoryProduct) => {
                    const products = await userHelper.filterBasedOnPriceHighToLow(subCategory, parseInt(sortCount), true);
                    res.render('../views/user/category-details.hbs', { Clint, categoryProduct, categoryname, products, name, cartCount, ordersCount, wishlistCount, subCategory, title: fllterTitle })
                })
            } else {
                const categoryname = data[0]
                sortCount = data[1]
                productHelper.findSubCategories(categoryname).then(async (categoryProduct) => {
                    const products = await userHelper.filterBasedOnPriceHighToLow(categoryname, parseInt(sortCount), false);
                    res.render('../views/user/category-details.hbs', { Clint, categoryProduct, categoryname, products, name, cartCount, ordersCount, wishlistCount, title: fllterTitle })
                })
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }

    },



    // wishlist Contorllers  -----------------

    addToWishList: async (req, res, next) => {
        try {
            const name = req.session.userDetailsInSession
            const wishlist = await wishlistHelper.addToWishList(req.params.id, name._id);
            res.json(wishlist)

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    gettingWishilstPage: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession;
            let cartCount = 0;
            let ordersCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                ordersCount = ordersCount.length;
            }
            wishlistProducts = await wishlistHelper.gettingWishlistProducts(name._id)
            if (wishlistProducts[0]) {
                res.render('../views/user/wishlist.hbs', { Clint, name, wishlistTab, cartCount, ordersCount, wishlistProducts, title: "Gaming Pink | My Wish List" })
            } else {
                res.render('../views/user/wishlist.hbs', { Clint, name, wishlistTab, cartCount, ordersCount, emptyStatus, title: "Gaming Pink | My Wish List" })
            }
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    removeFromWishList: async (req, res, next) => {
        try {
            const name = req.session.userDetailsInSession;
            const removeWishlistProduct = await wishlistHelper.removeProductFromWishList(name._id, req.params.id)
            res.json(true);

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    // compare products Controllers -----------------------

    getCompareProductPage: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            const compareProducts = await compareProductHelper.gettingCompareProductPage(name._id)
            if (compareProducts[0] == null) {
                res.render('../views/user/compare.hbs', { Clint, name, emptyStatus, cartCount, ordersCount, wishlistCount, title: 'Gamin Pink | Compare Products' })
            } else {
                res.render('../views/user/compare.hbs', { Clint, name, compareProducts, cartCount, ordersCount, wishlistCount, title: 'Gamin Pink | Compare Products' })
            }

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    addProductToCompare: async (req, res, next) => {
        try {
            const name = req.session.userDetailsInSession;
            const compareProduct = await compareProductHelper.insertingProductToCompareProduct(name._id, req.params.id)
            res.redirect('/compare')

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    removeProductFromCompareProducts: async (req, res, next) => {
        try {
            const removeProductsFromCompareProduct = await compareProductHelper.removeProductsFromCompareProducts(req.session.userDetailsInSession._id, req.params.id);
            res.redirect('/compare');

        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },


    orderFaild: (req, res, next) => {
        try {
            res.render('../views/user/orderFaildpage.hbs', { clintNav, title: ordersTitle })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },

    orderSuccessfull: (req, res, next) => {
        try {
            res.render('../views/user/ordersuccess.hbs', { clintNav, title: ordersTitle })
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })
        }
    },



    // about us

    aboutUS: async (req, res, next) => {
        try {
            let name = req.session.userDetailsInSession
            let cartCount = 0;
            let ordersCount = 0;
            let wishlistCount = 0;
            if (req.session.userDetailsInSession) {
                cartCount = await cartHelper.gettingCartProductsCount(name._id);
                ordersCount = await ordersHelper.gettingPendingOrderDetails(name._id)
                wishlistCount = await wishlistHelper.gettingWislistProductsCount(name._id)
                if (wishlistCount.Wishlist) {
                    wishlistCount = wishlistCount.Wishlist.length
                } else {
                    wishlistCount = 0
                }
                ordersCount = ordersCount.length;
            }
            res.render('../views/user/aboutUS.hbs', { clintNav, cartCount, ordersCount, wishlistCount, name , about:true})
        } catch (err) {
            res.render('../views/partials/404.hbs', { errorpage })

        }
    }



}



