const mongoose = require('mongoose');

const distributedListSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  totalRecords: {
    type: Number,
    required: true
  },
  distributions: [{
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    records: [{
      firstName: String,
      phone: String,
      notes: String
    }],
    recordCount: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DistributedList', distributedListSchema);