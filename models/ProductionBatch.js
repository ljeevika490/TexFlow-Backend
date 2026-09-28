const mongoose = require('mongoose');

const productionBatchSchema = new mongoose.Schema(
  {
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      unique: true,
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    fabricType: {
      type: String,
      required: [true, 'Fabric type is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'meters',
      trim: true,
    },
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: [true, 'Raw material reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required'],
    },
    actualEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PLANNED', 'IN PRODUCTION', 'COMPLETED', 'ON HOLD', 'CANCELLED'],
      default: 'PLANNED',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('ProductionBatch', productionBatchSchema);
