const db = require('../config/connection');
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;



module.exports = {

    insertingProductToCompareProduct: (userID, productID) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.COMPARE_PRODUCTS).findOne({ userId: ObjectID(userID) }).then((data) => {
                if (!data) {
                    db.get().collection(collection.COMPARE_PRODUCTS).insertOne(
                        {
                            userId: ObjectID(userID),
                            compareProducts: [ObjectID(productID)]
                        }
                    ).then(() => {
                        resolve();
                    })
                } else {
                    if (data.compareProducts.length < 2) {
                        db.get().collection(collection.COMPARE_PRODUCTS).updateOne(
                            {
                                userId: ObjectID(userID)
                            },
                            {
                                $push: {
                                    compareProducts: ObjectID(productID)

                                }
                            }
                        ).then(() => {
                            resolve();
                        })
                    } else {
                        db.get().collection(collection.COMPARE_PRODUCTS).updateOne(
                            {
                                userId: ObjectID(userID)
                            },
                            {
                                $set: {
                                    'compareProducts.0': ObjectID(productID)
                                }
                            }
                        ).then((data) => {
                            resolve();
                        })
                    }
                }
            })

        })
    },

    gettingCompareProductPage: (userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COMPARE_PRODUCTS).aggregate([
                {
                    $match: {
                        userId: ObjectID(userID)
                    }
                },
                {
                    $unwind: '$compareProducts'
                },
                {
                    $project: {
                        compareProducts: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS,
                        localField: 'compareProducts',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        products: 1
                    }
                }

            ]).toArray().then((data) => {
                resolve(data)
            })
        })
    },

    removeProductsFromCompareProducts: (userID, productID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COMPARE_PRODUCTS).updateOne(
                {
                    userId: ObjectID(userID)
                },
                {
                    $pull: {
                        compareProducts: ObjectID(productID)
                    }
                }
            ).then(() =>{
                resolve();
            })
        })
    },











}