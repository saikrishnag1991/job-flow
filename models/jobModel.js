import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'] },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String],
    benefits: [String],
    contactPerson: { name: String, email: String, phone: String },
    startDate: { type: String, default: 'Immediate' },
    status: { type: String, enum: ['Open', 'Filled', 'Closed'], default: 'Open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // 🟢 Pending applications awaiting supervisor approval
    pendingApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ✅ Approved applications
    acceptedApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

// Virtual for "posted X time ago"
JobSchema.virtual('postedAgo').get(function () {
    const now = new Date();
    const postedDate = this.createdAt;
    const diffInMilliseconds = now - postedDate;

    // Convert to appropriate time unit
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
});

module.exports = mongoose.model('Job', JobSchema);
