// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const { ObjectId } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;




module.exports = {

    // user side order helpers  -----------
    gettingPendingOrderDetails: async (userID) => {
        return await db.get().collection(collection.ORDERS).aggregate([
            {
                $match: { userId: ObjectID(userID) }
            },
            {
                $match: { $or: [{ 'orderStatus': 'Orderconfirmed' }, { 'orderStatus': "pending" }, { 'orderStatus': "Shipped" }, { 'orderStatus': "Outofdelivery" }] }
            },
            {
                $project: { amount: 1, products: 1 }
            },
            // {
            //     $unwind: '$products'
            // },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            // {
            //     $unwind:'$productDetails'
            // }
        ]).toArray()
    },

    gettingDeliveriedAndCanceldOrderDetails: async (userID) => {
        return await db.get().collection(collection.ORDERS).aggregate([
            {
                $match: { userId: ObjectID(userID) }
            },
            {
                $match: { 'orderStatus': 'Delivaried' }
            },
            {
                $project: { amount: 1, products: 1 }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

        ]).toArray()
    },

    gettingCancelledOrderDetails: async (userID) => {
        return await db.get().collection(collection.ORDERS).aggregate([
            {
                $match: { userId: ObjectID(userID) }
            },
            {
                $match: { 'orderStatus': 'Cancelled' }
            },
            {
                $project: { amount: 1, products: 1 }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

        ]).toArray()
    },

    gettingaSpecificOrderDetails: (orderID) => {
        return db.get().collection(collection.ORDERS).aggregate([

            {
                $match: { _id: ObjectID(orderID) }
            },
            {
                $project: { amount: 1, products: 1, userId: 1, orderStatus: 1, delivery_address: 1, couponStatus: 1, couponDiscount: 1, grandTotal: 1 }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $addFields: {
                    finalDiscount: {
                        $subtract: ['$grandTotal', '$couponDiscount']
                    }
                }
            }
        ]).toArray()
    },


    // admin side order helpers -----------
    gettingOrderDetailsForAdmin: () => {
        return db.get().collection(collection.ORDERS).aggregate([
            {
                $match: { $or: [{ 'orderConfirmationStatus': true }, { 'orderStatus': 'Orderconfirmed' }, { 'orderStatus': "pending" }, { 'orderStatus': "Shipped" }, { 'orderStatus': "Outofdelivery" }] }
            },
            {
                $project: { amount: 1, products: 1, userId: 1, orderStatus: 1, paymentMethod: 1, Date: 1 }
            },
            {
                $addFields: {
                    totalItems: { $size: "$products" }
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
        ]).toArray()
    },

    gettingaSpecificOrderDeataisForAdmin: (ids) => {
        const stringIds = ids;
        const id = stringIds.split(',');
        orderID = id[0];
        userID = id[1];
        return db.get().collection(collection.ORDERS).aggregate([
            {
                $match: { _id: ObjectID(orderID) }
            },
            {
                $project: { amount: 1, products: 1, userId: 1, orderStatus: 1, delivery_address: 1, couponStatus: 1, couponDiscount: 1, grandTotal: 1 }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCTS,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

        ]).toArray()
    },

    updateOrderStatus: async (data) => {
        const value = data.status.split(',');
        const orderID = value[0];
        let status = value[1]
        if (status == 'Deliveried') {
            status = 'Delivaried'
        }
        return db.get().collection(collection.ORDERS).updateOne(
            { _id: ObjectID(orderID) },
            {
                $set: { orderStatus: status }
            }
        );

    },

    createOrderId: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).insertOne(data).then((insertedDetails) => {
                resolve(insertedDetails.insertedId);
            })
        })
    },

    getOrderDetails: (orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).findOne({ _id: ObjectID(orderID) }).then((data) => {
                resolve(data)
            })
        })
    },


    cancelOrderByUser: (orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).updateOne(
                {
                    _id: ObjectID(orderID)
                },
                {
                    $set: {
                        orderStatus: 'Cancelled',
                    }
                }
            ).then(() => {
                db.get().collection(collection.ORDERS).aggregate([
                    {
                        $match: {
                            _id: ObjectID(orderID)
                        }
                    },
                    {
                        $project: {
                            products: 1, _id: 0
                        }
                    },
                    {
                        $unwind: '$products'
                    },

                ]).toArray().then((data) => {
                    console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        db.get().collection(collection.PRODUCTS).updateOne(
                            {
                                _id: ObjectID(data[i].products.productId)
                            },
                            { $inc: { FPStock: data[i].products.quantity } }


                        ).then((datas) => {
                            resolve();
                        })
                    }
                })
            })
        })
    }













}