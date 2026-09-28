const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: [true, 'PO number is required'],
      unique: true,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: [true, 'Material reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Order quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDate: {
      type: Date,
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN TRANSIT', 'RECEIVED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
