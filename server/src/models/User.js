/**
 * Mongoose models and classmethods for interacting with Users
 */
 const mongoose = require('mongoose');
 
 const Schema = mongoose.Schema;
 
 const userSchema = new Schema({
     userName: {type: String, required: true},
     email: {type: String, required: true},
     googleId: {type: String, required: true},
     thumbnail: String,
     createdAt: {type: Date, required: true, default: Date.now() },
     lastModified: {type: Date, required: true, default: Date.now() }
 });

 module.exports = mongoose.model('User', userSchema);