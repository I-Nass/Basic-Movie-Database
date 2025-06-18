const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    imdbID: {
        type: String,
        required: true,
        unique: false // A user can view the same movie multiple times
    },
    Title: {
        type: String,
        required: true
    },
    Year: {
        type: String,
        required: false
    },
    Poster: {
        type: String,
        required: false
    },
    viewedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: false // We are managing 'viewedAt' explicitly
});

module.exports = mongoose.model('History', historySchema);