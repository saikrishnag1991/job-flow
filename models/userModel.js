const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6, select: false },
        phone: String,
        address: String,
        jobTitle: String,
        experience: String,
        skills: [String],
        certifications: [{ type: mongoose.Schema.Types.Mixed }], // Flexible structure for certifications
        documents: [{ type: mongoose.Schema.Types.Mixed }], // Flexible structure for documents
        settings: {
            notificationsEnabled: Boolean,
            locationEnabled: Boolean,
            darkModeEnabled: Boolean,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
