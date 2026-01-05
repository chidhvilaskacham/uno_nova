const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: {
        id: String,
        name: String
    },
    roomId: {
        type: String,
        index: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isWhisper: {
        type: Boolean,
        default: false
    },
    recipientId: {
        type: String, // Only for whispers
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: { expires: '30d' } // Auto-delete after 30 days
    },
    reactions: [{
        emoji: String,
        senderName: String
    }]
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
