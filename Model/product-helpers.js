// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { ObjectId, ObjectID } = require('mongodb');
const { path } = require('../app');
const objectId = require('mongodb').ObjectID;


// Storing all counts
const counts = {
    productCount: null,
    usersCount: 0,
    revenueCount: 0,
    salesCount: 0
}

module.exports = {
    // Admin Authendication --------------

    adminLogin: (loginData) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.ADMIN).findOne({ 'Aname': loginData.Aname })
            // console.log(admin)
            if (admin && admin.Apassword == loginData.Apassword) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    },

    // Products Management -----------------

    addProduct: (formData, filenames , date) => {
        formData.FPorjprice = parseInt(formData.FPorjprice)
        formData.FPofferprice = parseInt(formData.FPofferprice);
        formData.FPStock = parseInt(formData.FPStock)
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS).insertOne(formData);
            let images = await db.get().collection(collection.PRODUCTS).updateOne({ _id: ObjectId(products.insertedId) }, {
                $set: {
                    productImages: filenames,
                    date:date,
                    ProductExistingStaus: false
                }
            });
            resolve(products.insertedId);
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            const products = await db.get().collection(collection.PRODUCTS).find(
                { ProductExistingStaus: false }
            ).toArray()
            resolve(products);
        })
    },

    editProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS).findOne({ _id: ObjectId(productId) }).then((productDetails) => {
                resolve(productDetails);
            })
        })
    },

    updateProduct: (productData, productId, filenames) => {
        return new Promise(async (resolve, reject) => {
            //updating data which come from edited page 
            const updateddata = await db.get().collection(collection.PRODUCTS).updateOne(
                { _id: ObjectId(productId) }, {
                $set: {
                    //changina ll the details
                    FPname: productData.FPname,
                    FPdiscription: productData.FPdiscription,
                    FPcategory: productData.FPcategory,
                    FPsubcategory: productData.FPsubcategory,
                    FPorjprice: parseInt(productData.FPorjprice),
                    FPStock: parseInt(productData.FPStock),
                    FPofferprice: parseInt(productData.FPofferprice)
                }
            }
            );

            //setting new images
            const imageUpload = await db.get().collection(collection.PRODUCTS).updateOne(
                { _id: ObjectId(productId) }, {
                $set: {
                    productImages: filenames
                }
            }
            );

            resolve();
        })
    },

    removeProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS).findOne({ _id: ObjectId(productId) }).then((data) => {
                const productId = data._id
                const prdctName = data.FPname
                const prdctCategory = data.FPcategory;
                const date = new Date();
                const deletedDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                const deletedTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                db.get().collection(collection.DUMB_PRODUCTS).insertOne({ prdctName, prdctCategory, deletedDate, deletedTime }).then((data) => {
                    db.get().collection(collection.PRODUCTS).update(
                        { _id: objectId(productId) },
                        {
                            $set: { ProductExistingStaus: true }
                        }
                    ).then((data) => {
                        resolve(true)
                    })
                })
            })
        })
    },

    deletehistory: () => {
        return new Promise(async (resolve, reject) => {
            // findign deleted data from dumb Data base 
            const dumb = await db.get().collection(collection.DUMB_PRODUCTS).find().toArray();
            resolve(dumb)//passing that data as array
        })
    },

    addProductTags: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS).updateOne(
                {
                    _id: ObjectID(data.productID)
                },
                {
                    $push: {
                        Tags: data.tag
                    }
                }
            ).then(() => {
                resolve();
            })

        })
    },

    featuredProducts: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS).find(
                { Tags: 'Featured' }
            ).toArray().then((data) => {
                resolve(data)
            })
        })
    },

    // user ManageMent ---------------------

    getUsers: () => {
        return new Promise(async (resolve, reject) => {
            const users = await db.get().collection(collection.USER).find().toArray().then((result) => {
                resolve(result)
            })
        })
    },

    blockUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let block = await db.get().collection(collection.USER).updateOne(
                { _id: ObjectId(id) },
                {
                    $set: {
                        block: true
                    }
                }
            )
            resolve(true)
        })
    },

    unBlockUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let block = await db.get().collection(collection.USER).updateOne(
                { _id: ObjectId(id) },
                {
                    $set: {
                        block: false
                    }
                }
            )
            resolve(true)
        })
    },



    // category Management ----------------

    getCategories: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES).find().toArray().then((categories) => {
                resolve(categories);
            })
        })
    },

    addCategory: (categoryName) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES).findOne({ categoryName: categoryName }).then((data) => {
                if (data) {
                    resolve(false)
                } else {
                    db.get().collection(collection.CATEGORIES).insertOne({ categoryName }).then(() => {
                        resolve(true);
                    })
                }
            })
        })
    },

    removeCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES).deleteOne({ _id: ObjectId({ id }) }).then(() => {
                resolve();
            })
        })
    },

    // [  REUSABLE ]
    findASpecificCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES).find({ _id: ObjectId(id) }).toArray().then((data) => {
                resolve(data[0].categoryName);
            })
        })
    },

    insertSubCategories: (data) => {
        return new Promise(async (resolve, reject) => {
            category = await db.get().collection(collection.CATEGORIES).find({ categoryName: data.categoryName }).toArray()
            if (category[0]) {
                // console.log(category[0]._id)
                db.get().collection(collection.CATEGORIES).updateOne({ _id: ObjectId(category[0]._id) }, {
                    $push: {
                        subCategories: data.subcategoryname
                    }
                })
                resolve(true);
            }
            else {
                resolve(false)
            }
        })
    },

    // [ REUSABLE ]    
    findSubCategories: (name) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORIES).aggregate([
                {
                    $match: { categoryName: name }
                },
                {
                    $unwind: '$subCategories'
                }
            ]).toArray().then((data) => {
                resolve(data)
            })
        })
    },

    // [REUSABLE]
    findProductsBasedOnCategory: (name) => {
        return new Promise(async (resolve, reject) => {
            // taking product details
            db.get().collection(collection.PRODUCTS).find({ FPcategory: name, ProductExistingStaus: false }).toArray().then((products) => {
                resolve(products);
            })
        })
    },

    findProductsBasedOnSubCategory: (subCateoryName) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS).aggregate([
                {
                    $match: { FPsubcategory: subCateoryName, ProductExistingStaus: false }
                }
            ]).toArray().then((data) => {
                resolve(data)
            })
        })
    },





    // Tags management 














}
