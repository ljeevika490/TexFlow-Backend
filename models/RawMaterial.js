const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema(
  {
    materialCode: {
      type: String,
      required: [true, 'Material code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      default: 'kg',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOW STOCK', 'OUT OF STOCK'],
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Auto-adjust status based on quantity if updated
rawMaterialSchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = 'OUT OF STOCK';
  } else if (this.quantity < 50) {
    this.status = 'LOW STOCK';
  } else {
    this.status = 'AVAILABLE';
  }
  next();
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
