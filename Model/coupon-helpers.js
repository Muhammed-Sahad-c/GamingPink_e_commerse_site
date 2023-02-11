// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;








module.exports = {

    // admin side coupn mangement------------------

    getCouponDetails: () => {
        return db.get().collection(collection.COUPONS).find().toArray();
    },

    insertCoupon: (details, date) => {
        return new Promise((resolve, reject) => {
            return db.get().collection(collection.COUPONS).insertOne(details).then((data) => {
                if (date <= details.couponDate) {
                    db.get().collection(collection.COUPONS).updateOne(
                        { _id: ObjectID(data.insertedId) },
                        {
                            $set: {
                                exipiryStatus: false
                            }
                        }
                    ).then(() => { resolve() })
                } else {
                    db.get().collection(collection.COUPONS).updateOne(
                        { _id: ObjectID(data.insertedId) },
                        {
                            $set: {
                                exipiryStatus: true
                            }
                        }
                    ).then(() => { resolve() })
                }
            })
        })
    },

    applingCouponByUsingUserCode: (couponCode, Date, userID, orderID) => {
        console.log('--------------0----')
       
        console.log('--------------0----')
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPONS).findOne({ couponCode: couponCode }).then((data) => {
                if (data && userID != data.applied_users && Date <= data.couponDate) {
                    db.get().collection(collection.ORDERS).findOne({ _id: ObjectID(orderID) }).then((details) => {
                        if (details.grandTotal < 6000) {
                            resolve(null)
                        } else {
                            db.get().collection(collection.ORDERS).updateOne(
                                { _id: ObjectID(orderID) },
                                {
                                    $set: { couponStatus: true, couponCode: data.couponCode, couponDiscount: parseInt(data.couponDiscount) }
                                }
                            ).then(() => {
                                resolve(parseInt(data.couponDiscount))
                            })
                        }
                    })
                } else {
                    resolve(false)
                }
            })
        })
    },

    updateCouponAppliedUserDetails: (code, userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPONS).updateOne(
                { couponCode: code },
                {
                    $set: {
                        applied_users: [userID]
                    }
                }
            ).then(() => {
                resolve();
            })
        })
    },

    removeAppliedCouponFromUser: (couponCode, userID, orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPONS).updateOne(
                { couponCode: couponCode },
                {
                    $pull: {
                        applied_users: userID
                    }
                }
            ).then(() => {
                db.get().collection(collection.ORDERS).updateOne(
                    { _id: ObjectID(orderID) },
                    {
                        $set: {
                            couponStatus: false,
                            couponDiscount: null,
                            couponCode: null
                        }
                    }
                ).then(() => {
                    resolve();
                })
            })
        })
    }
















}