// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const orderHelpers = require('./order-helpers');
const ObjectID = require('mongodb').ObjectID;




module.exports = {

    createOrderID: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).insertOne(data).then((data) => {
                resolve(data)
            })
        })
    },

    updatingNewAddressInOrderDetails: (address, orderID, userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).updateOne(
                { _id: ObjectID(orderID) },
                { $set: { delivery_address: address } }
            ).then((data) => {
                db.get().collection(collection.USER).updateOne(
                    { _id: ObjectID(userID) },
                    {
                        $push: {
                            userAddrsess: address
                        }
                    }
                ).then(() => {
                    resolve(data)
                })
            })
        })
        // return 
    },

    updatingExistingAccountInOrderDetais: (userID, index, orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER).findOne(
                { _id: ObjectID(userID) }
            ).then(async (data) => {
                address = data.userAddrsess[index]
                db.get().collection(collection.ORDERS).updateOne(
                    { _id: ObjectID(orderID) },
                    {
                        $set: { delivery_address: address }
                    }
                ).then(() => {
                    resolve(address);
                })



                // console.log(datas).
                // db.get().collection(collection.ORDERS).find({ _id: ObjectID(orderID) }).toArray().then((datas) => {
                //     console.log(datas)
                // })
                // db.get().collection(collection.ORDERS).updateOne(
                //     { _id: ObjectID(orderID) },
                //     {
                //         $set: { delivery_address: address }
                //     }
                // )
            })
        })

    },

    cartProductsCheckout: (orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERS).findOne({ _id: ObjectID(orderID) }).then((order) => {
                resolve(order.delivery_address);
            })
        })
    },

    confirmingOrder: (userID, paymentMethods, orderID, productDetails, date) => {
        return new Promise(async (resolve, reject) => {
            const orderStatus = 'Orderconfirmed'
            for (let i = 0; i < productDetails.length; i++) {
                const id = productDetails[i].productId
                const quantity = productDetails[i].quantity
                db.get().collection(collection.PRODUCTS).findOne(
                    {
                        _id: id
                    },
                ).then((data) => {
                    console.log(data)
                    if (data.FPStock == 1) {
                        db.get().collection(collection.PRODUCTS).updateOne(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    FPStock: 0,
                                    outOfStock: true
                                }
                            }
                        )
                    } else {
                        db.get().collection(collection.PRODUCTS).updateOne(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    FPStock: data.FPStock - quantity
                                }
                            }
                        )
                    }
                })
            }
            db.get().collection(collection.PRODUCTS).findOne(
                {
                    _id: productDetails.prodid
                }
            )

            db.get().collection(collection.ORDERS).updateOne(
                { _id: ObjectID(ObjectID(orderID)) },
                {
                    $set: {
                        products: productDetails,
                        orderStatus: orderStatus,
                        paymentMethod: 'Cash On Delivery',
                        orderConfirmationStatus: true,
                        Date: date
                    }
                }
            ).then(() => {
                db.get().collection(collection.CART).deleteOne({ userId: ObjectID(userID) });
                resolve();
            })

        })
    },

    getCartProductList: (userID) => {
        return db.get().collection(collection.CART).findOne({ userId: ObjectID(userID) });
    },

    doOnlinePayment: (orderID, productDetails, date, userID, data) => {
        return new Promise(async (resolve, reject) => {
            const orderStatus = 'Orderconfirmed'
            for (let i = 0; i < productDetails.length; i++) {
                const id = productDetails[i].productId
                const quantity = productDetails[i].quantity
                db.get().collection(collection.PRODUCTS).findOne(
                    {
                        _id: id
                    },
                ).then((data) => {
                    console.log(data)
                    if (data.FPStock == 1) {
                        db.get().collection(collection.PRODUCTS).updateOne(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    FPStock: 0,
                                    outOfStock: true
                                }
                            }
                        )
                    } else {
                        db.get().collection(collection.PRODUCTS).updateOne(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    FPStock: data.FPStock - quantity
                                }
                            }
                        )
                    }
                })
            }
            db.get().collection(collection.PRODUCTS).findOne(
                {
                    _id: productDetails.prodid
                }
            )

            db.get().collection(collection.ORDERS).updateOne(
                { _id: ObjectID(ObjectID(orderID)) },
                {
                    $set: {
                        products: productDetails,
                        orderStatus: orderStatus,
                        paymentMethod: 'Online Payment',
                        orderConfirmationStatus: true,
                        transactionID:data.transactionID,
                        Date: date
                    }
                }
            ).then(() => {
                db.get().collection(collection.CART).deleteOne({ userId: ObjectID(userID) });
                resolve(true);
            })

        })
    },

     

}