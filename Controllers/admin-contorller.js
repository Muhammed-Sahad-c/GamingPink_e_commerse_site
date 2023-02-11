
const { path } = require("../app");
const productHelper = require("../Model/product-helpers");
const ordersHelper = require('../Model/order-helpers');
const bannerHelper = require('../Model/banner-Helpers');
const couponHelper = require('../Model/coupon-helpers');
const dashBoardHelper = require('../Model/dashboard-helpers');

const dateFinder = () => {
    var nowDate = new Date();
    var date = nowDate.getFullYear() + '-' + 0 + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    return date;
}

/* STATUSES */
const productAddedStatus = true;
const productEditStatus = true;
const ProductDeletedStatus = true;
const offerProductStatus = true;
const loginStatus = true;
const adminLogin = true;
const admin = true;

// statues for showing which page nowin

const dashBoardTab = true;
const productTab = true;
const usersTab = true;
const ordersTab = true;
const categoriesTab = true;
const conuponTab = true;
const bannerTab = true;
const salesTab = true;


// delivary Statusses 

let outOfDelivery = true;
const shipped = true
const deliveried = true;
const cancelled = true;

const adminBaseTitle = ' admin | '



module.exports = {



    // dashBoard Controller ----------

    gettingDashBoardPage: async (req, res, next) => {
        const date = dateFinder();
        const itemCounts = await dashBoardHelper.getItemsCountForDashBoard(date);
        const ordersDetailsGraph = await dashBoardHelper.getOrderDetailsforGraph();
        res.render("admin/dashBoard", { itemCounts, admin, ordersDetailsGraph, title: adminBaseTitle + "Home" });
    },

    // Products Controller-----------

    gettingProductsPage: (req, res, next) => {
        // showing products on adminside product page
        productHelper.getAllProducts().then((products) => {
            res.render("admin/products", { products, productTab, admin, title: adminBaseTitle + "Products" });
        });
    },

    gettingCategorySelectionPage: (req, res, next) => {
        productHelper.getCategories().then((categories) => {
            res.render("../views/admin/categories", { admin, categories, categoriesTab, title: adminBaseTitle + "Categoires" });
        })
    },

    gettingUserDetailsPage: (req, res, next) => {
        productHelper.getUsers().then((users) => {
            res.render("admin/users", { users, usersTab: true, admin, title: adminBaseTitle + "Users" });
        });
    },

    gettingEditProductForm: async (req, res, next) => {
        let product = await productHelper.editProduct(req.params.id)
        res.render("admin/edit-product", { product, admin, title: adminBaseTitle + "Edit Products" });
    },

    gettingDeletedHistoryPage: (req, res, next) => {
        productHelper.deletehistory().then((details) => {
            res.render("admin/deletedHistory", { details, admin, title: adminBaseTitle + "Deleted History" });
        });
    },

    removeProduct: (req, res, next) => {
        productHelper.removeProduct(req.params.id).then((dd) => {
            res.json(true)
        });
    },

    gettingAdminLoginPage: (req, res, next) => {
        res.render("admin/admin-login", { adminLogin, title: adminBaseTitle + "Login" });
    },

    editProduct: async (req, res, next) => {
        const filenames = await req.files.map(file => (file.filename));
        productHelper.updateProduct(req.body, req.params.id, filenames).then(() => {
            res.render('admin/respond', { admin, productAddedStatus, title: adminBaseTitle + "response" })
        });
    },

    addProduct: (req, res, next) => {
        const filenames = req.files.map(file => (file.filename));
        const date = dateFinder();
        productHelper.addProduct(req.body, filenames, date).then((id) => {
            res.redirect('/admin/products')
        });
    },



    // banner Controllers ------
    gettingBannerProductsPage: async (req, res, next) => {
        const offerProducts = await bannerHelper.getBannersOverallDetails();
        // res.render('/admin/banners', bannerTab, admin)
        res.render('../views/admin/banners.hbs', { admin, bannerTab, offerProducts, title: adminBaseTitle + "Banners" })
    },

    gettingAddOfferProductForm: (req, res, next) => {
        res.render("admin/add-offerproduct", { admin, bannerTab, title: adminBaseTitle + "Add Banners" });
    },

    addOfferProduct: (req, res, next) => {
        const filenames = req.files.map(file => (file.filename));
        bannerHelper.offerProductAdd(req.body, filenames).then((id) => {
            res.render("admin/respond", { offerProductStatus, admin, title: adminBaseTitle + "Banners" });
        });
    },

    removeBannerProducts: async (req, res, next) => {
        const removeBanner = await bannerHelper.removeBanner(req.params.id)
        res.json(true);
    },

    addWideProductsForm: async (req, res, next) => {
        const categories = await productHelper.getCategories();
        res.render('../views/admin/addwideproducts.hbs', { admin, bannerTab, categories, title: adminBaseTitle + "add Wide banners" })
    },

    addWideProducts: async (req, res, next) => {
        const filenames = req.files.map(file => (file.filename));
        const addWideProducts = await bannerHelper.addWideProducts(filenames, req.body)
        res.redirect('/bannersmanagementpage');
    },


    // Users Controllers --------------

    blockingUser: (req, res, next) => {
        productHelper.blockUser(req.params.id).then((status) => {
            blockStatus = true;
            res.redirect("/admin/users");
        });
    },

    unBlockUser: (req, res, next) => {
        productHelper.unBlockUser(req.params.id).then((status) => {
            blockStatus = true;
            res.redirect("/admin/users");
        });
    },




    // Authenticaiton Cotroller ----------

    adminLoginValidation: (req, res, next) => {
        productHelper.adminLogin(req.body).then((status) => {
            if (status) {
                // verifcation passed
                //creating session and redirecting to DaSHBOARD
                req.session.adminLoggedIn = true;
                res.redirect("/admin");
            } else {
                res.render("admin/admin-login", { loginStatus, adminLogin, title: adminBaseTitle + "Login" });
            }
        });
    },



    // category Controller -----------

    addNewCategory: async (req, res, next) => {
        const addCategoryStatus = await productHelper.addCategory(req.body.category);
        res.json(addCategoryStatus);
    },

    deleteCategory: (req, res, next) => {
        productHelper.removeCategory(req.params.id).then(() => {
            res.json(true);
        })
    },

    addSubCategories: (req, res, next) => {
        productHelper.insertSubCategories(req.body).then((status) => {
            res.json(status)
        })
    },

    //for showing to admin vategory based form for product adding
    categoryBasedForm: (req, res, next) => {
        productHelper.findASpecificCategory(req.params.id).then((productCategoryName) => {
            productHelper.findSubCategories(productCategoryName).then((subCategories) => {
                res.render('../views/admin/add-product.hbs', { admin, productCategoryName, subCategories, title: adminBaseTitle + "Add Products" })
            })
        })
    },







    //order Contorlller ----------

    gettingOrderManagemnetPage: async (req, res, next) => {
        const orders = await ordersHelper.gettingOrderDetailsForAdmin();
        const ordersCount = await dashBoardHelper.getOrderDetailsforGraph();
        ordersCount.totalOrders = orders.length
        res.render('../views/admin/ordersmanagement.hbs', { admin, ordersTab, orders, ordersCount, title: adminBaseTitle + "Orders" })
    },

    gettingaSpecificOrderDetails: async (req, res, next) => {
        const orderDetails = await ordersHelper.gettingaSpecificOrderDeataisForAdmin(req.params.id)
        items = orderDetails.length;
        // weather is coupon applied or not?
        if (orderDetails[0].couponStatus) {
            finalDiscount = orderDetails[0].grandTotal - orderDetails[0].couponDiscount
            orderDetails[0].finalDiscount = finalDiscount
        }
        if (orderDetails[0].orderStatus == 'Outofdelivery') {
            res.render('../views/admin/ordersDetailView.hbs', { admin, orderDetails, items, outOfDelivery, title: adminBaseTitle + "Orders", ordersTab })
        } else if (orderDetails[0].orderStatus == 'Shipped') {
            res.render('../views/admin/ordersDetailView.hbs', { admin, orderDetails, items, shipped, title: adminBaseTitle + "Orders", ordersTab })
        }
        else if (orderDetails[0].orderStatus == 'Cancelled') {
            res.render('../views/admin/ordersDetailView.hbs', { admin, orderDetails, items, cancelled, title: adminBaseTitle + "Orders", ordersTab })
        }
        else if (orderDetails[0].orderStatus == 'Delivaried') {
            res.render('../views/admin/ordersDetailView.hbs', { admin, orderDetails, items, deliveried, title: adminBaseTitle + "Orders", ordersTab })
        } else {
            res.render('../views/admin/ordersDetailView.hbs', { admin, orderDetails, items, title: adminBaseTitle + "Orders", ordersTab })
        }

    },

    updateOrderStatus: async (req, res, next) => {
        const updateStatus = await ordersHelper.updateOrderStatus(req.body);
        res.redirect('/admin/orders')
    },




    // coupon Controller --------

    gettingCouponPage: async (req, res, next) => {
        const coupnDetails = await couponHelper.getCouponDetails();
        res.render('../views/admin/couponmanagement.hbs', { admin, conuponTab, coupnDetails, title: adminBaseTitle + "coupns" });
    },

    creatingCoupon: async (req, res, next) => {
        date = dateFinder();
        const insertCoupon = await couponHelper.insertCoupon(req.body, date)
        res.json(true);
    },


    // tags Controller ---------

    addProductTag: async (req, res, next) => {
        const addTags = await productHelper.addProductTags(req.body);
        res.json(true);
    },


    // sales Controller
    getSalesRoport: async (req, res, next) => {
        salesReport = await dashBoardHelper.getSalesReport()
        res.render("../views/admin/sales-report.hbs", { admin, salesTab, salesReport, title: adminBaseTitle + "Sales" })
    }

}




