// requiring DB connection page
const db = require('../config/connection');
// requiring collection name required name
const collection = require('../config/collections')
// Nodemailer
const nodemailer = require('nodemailer')
// Bcrypt 
const bcrypt = require('bcrypt');
const { ObjectId, ObjectID } = require('mongodb');
const objectId = require('mongodb').ObjectID;



//Creating Transport for signuppgae
let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,

    auth: {
        user: 'sahadmuhammed289@gmail.com',
        pass: 'SvqRfGr0tW6Tm58J',
    }

});


module.exports = {




    // Verifications Management---------

    doSignup: (mailOptions, userdata) => {
        //sigup email cheking it is existing or not
        return new Promise(async (resolve, reject) => {

            email = await db.get().collection(collection.USER).findOne({ 'SUemail': mailOptions.to })
            if (email) {
                // email already exist 
                console.log('email aleard exist')
                resolve(false)
            } else {
                // email not existing so we can sent mail as OTP
                // OTP sending on mail and checking it sent or not
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    resolve(true)
                });
            }
        })
    },

    otpVerification: (data, orjotp, userData) => {
        return new Promise(async (resolve, reject) => {
            // Checking OTP are eual
            if (orjotp == data.FOTP) {
                userData.SUpassword = await bcrypt.hash(userData.SUpassword, 10)
                userData.SUrepassword = await bcrypt.hash(userData.SUrepassword, 10)
                db.get().collection(collection.USER).insertOne(userData).then((data) => {
                    db.get().collection(collection.USER).updateOne({ _id: data.insertedId }, { $set: { block: false } }).then(() => {
                        db.get().collection(collection.USER).findOne({ _id: data.insertedId }).then((details) => {
                            resolve(details)
                        })
                    })
                })
            }
            else {
                resolve(false)
            }
        })
    },

    doLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let blockstatus;
            const user = await db.get().collection(collection.USER).findOne({ 'SUemail': data.loginMail });
            if (user) {
                const blockcheck = await db.get().collection(collection.USER).findOne({ 'SUemail': data.loginMail }).then((respond) => {
                    blockstatus = respond.block;
                })
                if (blockstatus == false) {
                    bcrypt.compare(data.loginPassword, user.SUpassword).then((status) => {
                        if (status) {
                            status = user;
                            resolve(status)
                        }
                        else {
                            resolve(false)
                        }
                    })
                } else {
                    resolve(true)
                }
            }
            else {
                resolve(null)
            }

        })
    },



    // Detail View Mangement------------
    getProductDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            // Getting Product details using id from userside
            const product = await db.get().collection(collection.PRODUCTS).find({ _id: ObjectID(id) }).toArray();
            resolve(product)
        })
    },

    getRelated: (subcategory) => {
        return new Promise(async (resolve, reject) => {
            // Getting Product details using id from userside
            const categorySort = await db.get().collection(collection.PRODUCTS).find({ FPsubcategory: subcategory, ProductExistingStaus: false }).toArray();
            resolve(categorySort);
        })
    },



    //  profile Management -------

    gettingProfileDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            const userDetails = await db.get().collection(collection.USER).find({ SUemail: userId.SUemail }).toArray();
            resolve(userDetails);
        })
    },

    gettingUserDetailsForEdit: (id) => {
        return new Promise(async (resolve, reject) => {
            const userDetails = await db.get().collection(collection.USER).find({ _id: ObjectId(id) }).toArray();
            resolve(userDetails);
        })
    },

    updatingUserDetails: (userid, userData) => {
        return new Promise(async (resolve, reject) => {
            const sahad = await db.get().collection(collection.USER).updateOne(
                { _id: ObjectID(userid) }, {
                $set: {
                    SUusername: userData.SUusername,
                    userAddress: [userData.SUaddress, userData.SUpincode, userData.SUstreet, userData.SUcity, userData.SUcountry]
                }
            }
            )
            resolve()
        })
    },

    updateNewAddress: (addressObject, userID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER).updateOne(
                { _id: ObjectID(userID) }, { $push: { userAddrsess: addressObject } }
            )
            resolve();
        })
    },


    // filter Mangement-------------

    filterBasedOnPriceHighToLow: (name, sortCount, data) => {
        return new Promise((resove, reject) => {
            if (data == true) {
                db.get().collection(collection.PRODUCTS).aggregate([
                    {
                        $match: { FPsubcategory: name, ProductExistingStaus: false }
                    },
                    {
                        $sort: { FPorjprice: sortCount }
                    }
                ]).toArray().then((data) => {
                    resove(data)
                })
            } else {
                db.get().collection(collection.PRODUCTS).aggregate([
                    {
                        $match: { FPcategory: name, ProductExistingStaus: false }
                    },
                    {
                        $sort: { FPorjprice: sortCount }
                    }
                ]).toArray().then((data) => {
                    resove(data)
                })
            }

        })
    }




}  