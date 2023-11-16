
const mongoose=require('mongoose')
require('dotenv').config();
const UsersSeeder=require('./seeders/users.seeder')
const mongoURL = process.env.MONGODB_DATABASE || 'mongodb://localhost:27017/cubic';


/**
 * Seeders List
 * order is important
 * @type {Object}
 */
module.exports.seedersList = {
  UsersSeeder
};
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */

 module.exports.connect = async () => await mongoose.connect(mongoURL, { useNewUrlParser: true });
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
 module.exports.dropdb = async () => mongoose.connection.db.dropDatabase();
