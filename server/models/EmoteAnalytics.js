const mongoose = require('mongoose');

const emoteAnalyticsSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        index: true
    },
    playerName: String,
    emoteType: {
        type: String,
        required: true
    },
    usageCount: {
        type: Number,
        default: 1
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
});

// Compound index to quickly find and update emote usage per player
emoteAnalyticsSchema.index({ playerId: 1, emoteType: 1 }, { unique: true });

module.exports = mongoose.model('EmoteAnalytics', emoteAnalyticsSchema);
