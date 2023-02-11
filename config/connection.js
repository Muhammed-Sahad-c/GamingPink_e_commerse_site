

// mongo Drivers
const mongoClient = require('mongodb').MongoClient;

// state
const state = {
    db: null
};

// connecting......
module.exports.connect = function (done) {
    const url = "mongodb://127.0.0.1:27017/";
    const dbname = 'GamingPink';

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        else state.db = data.db(dbname)
    })
    done();
}

module.exports.get = function () {
    return state.db;
} 