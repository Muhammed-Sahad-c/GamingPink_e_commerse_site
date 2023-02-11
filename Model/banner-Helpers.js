// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections');
const { path } = require('../app');
const ObjectID = require('mongodb').ObjectID;





module.exports = {


    getBannersOverallDetails: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_PRODUCTS).find().toArray().then((data) => {
                resolve(data)
            })
        })
    },

    offerProductAdd: (productData, filenames) => {
        return new Promise(async (resolve, reject) => {
            let productsdetails = await db.get().collection(collection.OFFER_PRODUCTS).insertOne(productData)
            let image = await db.get().collection(collection.OFFER_PRODUCTS).updateOne({ _id: ObjectID(productsdetails.insertedId) }, {
                $set: {
                    offerProductImages: filenames
                }
            });
            resolve();
        })
    },

    getOfferProducts: () => {
        return new Promise(async (resolve, reject) => {
            let offerprdct = await db.get().collection(collection.OFFER_PRODUCTS).find().toArray()
            resolve(offerprdct)
        })
    },

    removeBanner: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_PRODUCTS).deleteOne(
                { _id: ObjectID(id) }
            ).then(() => {
                resolve()
            })
        })
    },

    addWideProducts: (file, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WIDE_PRODUCTS).insertOne(data).then((data) => {
                db.get().collection(collection.WIDE_PRODUCTS).updateOne(
                    {
                        _id: data.insertedId
                    },
                    {
                        $set: {
                            wideProducts: file
                        }
                    }
                ).then(() => {
                    resolve();
                })
            })
        })
    },


    findWideProducts: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WIDE_PRODUCTS).find().toArray().then((data) => {
                resolve(data)
            })
        })
    }









}