"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number },
    friends: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });
userSchema.virtual('name').get(function fullName() {
    return "".concat(this.firstName, " ").concat(this.lastName);
});
exports["default"] = (0, mongoose_1.model)('User', userSchema);
