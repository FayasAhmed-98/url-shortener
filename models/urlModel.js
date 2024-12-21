const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    short_url: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 10,
    },
    long_url: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v); // Basic URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: false, // Optional, but can be set when needed
    },
  });
  
// Index for long_url (if needed)
urlSchema.index({ long_url: 1 });

// Optional: index for expiration date if we want to query it
urlSchema.index({ expires_at: 1 });

  module.exports = mongoose.model('URL', urlSchema);  