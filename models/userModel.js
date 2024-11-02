const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name!'],
        trim: true
    },
    lastname: {
        type: String,
        required: [true, 'Please enter your lastname!'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Please enter your username!'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please enter your email!'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please enter a valid email!']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        minlength: 8, 
        select: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        select: false,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    reset_password_token: {
        type: String
    },
    reset_password_expires: {
        type: Date
    }
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    //delete passConf field
    this.passwordConfirm = undefined;
    this.reset_password_token = undefined;
    this.reset_password_expires = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema);

module.exports = User;