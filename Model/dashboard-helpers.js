// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;



module.exports = {




    getItemsCountForDashBoard: (date) => {
        let itemCounts = {
            pendingOrders: 0,
            products: 0,
            users: 0,
            sales: 0,
            todaySales: 0,
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER).find().toArray().then((users) => {
                db.get().collection(collection.PRODUCTS).find({ ProductExistingStaus: false }).toArray().then((products) => {
                    db.get().collection(collection.ORDERS).aggregate([
                        {
                            $match: {
                                orderStatus: 'Delivaried'
                            }
                        },
                    ]).toArray().then((data) => {
                        db.get().collection(collection.ORDERS).aggregate([
                            {
                                $match: { $and: [{ 'orderStatus': "Delivaried" }, { Date: date }] }
                            },

                        ]).toArray().then((todaySale) => {
                            itemCounts.todaySales = todaySale.length
                            itemCounts.products = products.length
                            itemCounts.users = users.length;
                            itemCounts.sales = data.length;
                            for (const x in itemCounts) {
                                if (itemCounts[x] > 1000000) {
                                    itemCounts[x] = '1000000+'
                                } 
                            }
                            resolve(itemCounts);
                        })
                    })
                })
            })
        })
    },

    getOrderDetailsforGraph: () => {
        return new Promise((resolve, reject) => {
            const detailsForOrdersDetailsGraph = {
                pending: 0,
                deliveried: 0,
                cancelled: 0
            }
            db.get().collection(collection.ORDERS).aggregate([
                {
                    $match: {
                        orderStatus: 'Delivaried'
                    }
                },
            ]).toArray().then((deliveried) => {
                db.get().collection(collection.ORDERS).aggregate([
                    {
                        $match: { $or: [{ 'orderStatus': 'Orderconfirmed' }, { 'orderStatus': "Shipped" }, { 'orderStatus': "Outofdelivery" }] }
                    },
                ]).toArray().then((pending) => {
                    db.get().collection(collection.ORDERS).aggregate([
                        {
                            $match: {
                                orderStatus: 'Cancelled'
                            }
                        },
                    ]).toArray().then((cancelled) => {
                        detailsForOrdersDetailsGraph.deliveried = deliveried.length;
                        detailsForOrdersDetailsGraph.pending = pending.length
                        detailsForOrdersDetailsGraph.cancelled = cancelled.length
                        resolve(detailsForOrdersDetailsGraph)

                    })
                })
            })
        })
    },   //  need to Ajax

    getSalesReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).aggregate([
                {
                    $match: {
                        orderStatus: 'Delivaried'
                    }
                },
                {
                    $project: {
                        grandTotal: 1, userId: 1, couponDiscount: 1, Date: 1, orderStatus: 1, paymentMethod: 1, products: 1
                    }
                },
                {
                    $addFields: { productsTotalPrice: { $subtract: ["$grandTotal", "$couponDiscount"] } }
                },
                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        userId: 1, Date: 1, orderStatus: 1, paymentMethod: 1, products: 1, productsTotalPrice: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.USER,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },

            ]).toArray().then((details) => {
                resolve(details)
            })
        })
    }

























}













