const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const User = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNumber: Number,
  admin: { type: Boolean, default: false }

})

User.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true
})

module.exports = mongoose.model('User', User)
