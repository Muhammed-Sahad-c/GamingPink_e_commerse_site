const db = require('../config/connection');
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;


module.exports = {



    addToWishList: (productID, userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER).findOne(
                {
                    _id: ObjectID(userID),

                    Wishlist: {
                        $in: [ObjectID(productID)]
                    }
                }
            ).then((data) => {
                if (data == null) {
                    db.get().collection(collection.USER).updateOne(
                        { _id: ObjectID(userID) },
                        {
                            $push: {
                                Wishlist: ObjectID(productID)
                            }
                        }
                    ).then(() => {
                        resolve(true);
                    })
                } else {
                    resolve(false)
                }
            })
        })
    },

    gettingWislistProductsCount: (userID) => {
        return new Promise((resoive, reject) => {
            db.get().collection(collection.USER).findOne(
                { _id: ObjectID(userID) }
            ).then((data) => {
                resoive(data)
            })
        })
    },

    gettingWishlistProducts: (userID) => {
        return new Promise((resoive, reject) => {
            db.get().collection(collection.USER).aggregate([
                {
                    $match: { _id: ObjectID(userID) }
                },
                {
                    $unwind: '$Wishlist'
                },
                {

                    $project: { productId: '$Wishlist' }

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
                    $project: { products: 1 }
                }
            ]).toArray().then((data) => {
                resoive(data)
            })
        })
    },

    removeProductFromWishList: (userID, productID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER).updateOne(
                { _id: ObjectID(userID) },
                {
                    $pull: {
                        Wishlist:ObjectID(productID)
                    }
                }
            ).then(()=>{
               resolve();
            })
        })
    }
























}