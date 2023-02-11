// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;



module.exports = {



    chekingCartStatus: (userID) => {
        return db.get().collection(collection.CART).aggregate([
            {
                $match: { userId: ObjectID(userID) }
            },
            {
                $unwind: '$productsDetails'
            },
            {
                $project: { productId: '$productsDetails.productId', quantity: '$productsDetails.quantity' }
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            {
                $project: {
                    productId: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
                }
            },
            {
                $project: {
                    productId: 1,
                    quantity: 1,
                    "products.FPofferprice": 1,
                    "products.FPorjprice": 1,
                    "products.FPname": 1,
                    "products.outOfStock": 1,
                    "products.productImages": 1,
                    totalOrjPrice: { $sum: { $multiply: ['$quantity', '$products.FPorjprice'] } },
                    totalDiscoutPrice: { $sum: { $multiply: ['$quantity', '$products.FPofferprice'] } }
                }
            },
        ]).toArray();



    },


    gettingTotalPriceProducts: async (userID) => {
        return await db.get().collection(collection.CART).aggregate([
            {
                $match: { userId: ObjectID(userID) }
            },
            {
                $unwind: '$productsDetails'
            },
            {
                $project: { productId: '$productsDetails.productId', quantity: '$productsDetails.quantity' }
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            {
                $project: {
                    _id: 0, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
                }
            },
            {
                $project: {
                    productId: 1,
                    quantity: 1,
                    "products.FPofferprice": 1,
                    "products.FPorjprice": 1,
                }
            },
            {
                $project: {
                    productId: 1,
                    quantity: 1,
                    "products.FPofferprice": 1,
                    "products.FPorjprice": 1,
                    "products.FPname": 1,
                    "products.productImages": 1,
                    totalOrjPrice: { $sum: { $multiply: ['$quantity', '$products.FPorjprice'] } },
                    totalDiscountPrice: { $sum: { $multiply: ['$quantity', '$products.FPofferprice'] } }
                }
            },
            {
                $group: {
                    _id: null,
                    grandTotal: { $sum: '$totalDiscountPrice' },
                    subTotal: { $sum: '$totalOrjPrice' },
                }
            },


        ]).toArray();
        // console.log('----------------------------------------')
        // console.log(yes)
        // console.log('----------------------------------------')
    },


    addToCart: (productID, userID) => {
        cartObj = {
            productId: ObjectID(productID),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            const cart = await db.get().collection(collection.CART).findOne({ userId: ObjectID(userID) })
            // cart already exist updating new Products
            if (cart) {
                const productExistStatus = await cart.productsDetails.findIndex(pr => pr.productId == productID);
                // Products not existing -1 so updating new product
                if (productExistStatus > -1) {
                    db.get().collection(collection.CART).updateOne(
                        { 'productsDetails.productId': ObjectID(productID), userId: ObjectID(userID) },
                        {
                            $inc: { 'productsDetails.$.quantity': 1 }
                        }
                    )
                    resolve();
                }
                // product existing in cart so increase the quantitiy
                else {
                    db.get().collection(collection.CART).updateOne(
                        { userId: ObjectID(userID) },
                        {
                            $push: {
                                productsDetails: cartObj
                            }
                        }
                    )
                    resolve(true);
                }
            } else {
                cartObj = {
                    userId: ObjectID(userID),
                    productsDetails: [cartObj]
                }
                db.get().collection(collection.CART).insertOne(cartObj)
                resolve(true);
            }
        })
    },


    updatingCartProductsCount: ({ cartID, productID, count, quantity }) => {
        count = parseInt(count)
        quantity = parseInt(quantity)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity <= 1) {
                db.get().collection(collection.CART).updateOne(
                    { _id: ObjectID(cartID) },
                    {
                        $pull: { productsDetails: { productId: ObjectID(productID) } }
                    }
                ).then(() => {
                    resolve(false)
                })
            } else {
                db.get().collection(collection.PRODUCTS).findOne(
                    { _id: ObjectID(productID) }
                ).then((data) => {
                    if (data.FPStock > quantity) {
                        db.get().collection(collection.CART).updateOne(
                            { _id: ObjectID(cartID), 'productsDetails.productId': ObjectID(productID) },
                            {
                                $inc: { 'productsDetails.$.quantity': count }
                            }
                        )
                        resolve(true);
                    } else {
                        if (count == -1) {
                            db.get().collection(collection.CART).updateOne(
                                { _id: ObjectID(cartID), 'productsDetails.productId': ObjectID(productID) },
                                {
                                    $inc: { 'productsDetails.$.quantity': count }
                                }
                            )
                            resolve(true);
                        } else {
                            resolve(null)
                        }
                    }
                })

            }
            // 
        })
    },


    gettingCartProductsCount: (userID) => {
        return new Promise(async (resolve, reject) => {
            const cart = await db.get().collection(collection.CART).findOne({ userId: ObjectID(userID) })
            if (cart) {
                if (cart.productsDetails) {
                    resolve(cart.productsDetails.length);
                } else {
                    resolve(0);
                }
            }
            else {
                resolve(0)
            }
        })
    },


    removeCartProduct: ({ cartID, productID }) => {
        return new Promise(async (resolve, reject) => {
            let deletedStatus = await db.get().collection(collection.CART).updateOne(
                { _id: ObjectID(cartID) },
                {
                    $pull: { productsDetails: { productId: ObjectID(productID) } }
                }
            )
            resolve(true);
        });
    },







    // ---------------------------------------------


    addtoCartGuestUser: (productID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART).insertOne(

                {
                    userId: 'guest', productsDetails: [productID]
                }
            ).then((Data) => {
                resolve(Data.insertedId)
            })
        })
    }














}



