const mongoose = require('mongoose');

// Define the URL schema
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
});

// Add index on long_url to ensure efficient queries
urlSchema.index({ long_url: 1 });

// Create and export the URL model
module.exports = mongoose.model('URL', urlSchema);
