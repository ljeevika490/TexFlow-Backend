require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const RawMaterial = require('./models/RawMaterial');
const PurchaseOrder = require('./models/PurchaseOrder');
const ProductionBatch = require('./models/ProductionBatch');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/texflow';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await RawMaterial.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await ProductionBatch.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Admin Manager',
      email: 'admin@texflow.com',
      phone: '+91 98421 11000',
      password: 'admin123',
      role: 'ADMIN',
    });

    const seller1 = await User.create({
      name: 'Tiruppur Cotton Mills',
      email: 'tiruppur.tex@gmail.com',
      phone: '+91 94432 22001',
      password: 'seller123',
      role: 'SELLER',
    });

    const seller2 = await User.create({
      name: 'Coimbatore Spinners Ltd',
      email: 'coimbatore.yarns@gmail.com',
      phone: '+91 98430 33002',
      password: 'seller123',
      role: 'SELLER',
    });

    console.log('Created 1 Admin and 2 Sellers.');

    // 2. Create 5 Raw Materials
    const mat1 = await RawMaterial.create({
      materialCode: 'MAT-COT-01',
      materialName: 'Combed Organic Cotton 40s',
      category: 'Cotton',
      supplier: 'Tiruppur Cotton Mills',
      quantity: 1200,
      unit: 'kg',
      price: 280,
      status: 'AVAILABLE',
    });

    const mat2 = await RawMaterial.create({
      materialCode: 'MAT-POLY-02',
      materialName: 'Recycled Polyester Staple Fiber',
      category: 'Polyester',
      supplier: 'Chennai Synthetics Corp',
      quantity: 650,
      unit: 'kg',
      price: 160,
      status: 'AVAILABLE',
    });

    const mat3 = await RawMaterial.create({
      materialCode: 'MAT-YRN-03',
      materialName: 'Ring Spun Carded Yarn 30s',
      category: 'Yarn',
      supplier: 'Coimbatore Spinners Ltd',
      quantity: 40,
      unit: 'kg',
      price: 230,
      status: 'LOW STOCK',
    });

    const mat4 = await RawMaterial.create({
      materialCode: 'MAT-DYE-04',
      materialName: 'Reactive Navy Blue Dye (Grade A)',
      category: 'Dye',
      supplier: 'Tiruppur Color Chem',
      quantity: 80,
      unit: 'kg',
      price: 540,
      status: 'AVAILABLE',
    });

    const mat5 = await RawMaterial.create({
      materialCode: 'MAT-FAB-05',
      materialName: 'Greige Woven Cotton Fabric',
      category: 'Fabric',
      supplier: 'Coimbatore Spinners Ltd',
      quantity: 0,
      unit: 'meters',
      price: 110,
      status: 'OUT OF STOCK',
    });

    console.log('Created 5 Raw Materials.');

    // 3. Create 3 Purchase Orders
    await PurchaseOrder.create({
      poNumber: 'PO-2026-0101',
      seller: seller1._id,
      material: mat1._id,
      quantity: 200,
      unit: 'kg',
      orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      price: 280,
      totalAmount: 56000,
      status: 'CONFIRMED',
      notes: 'Export grade combed cotton required for Tiruppur knitting line.',
    });

    await PurchaseOrder.create({
      poNumber: 'PO-2026-0102',
      seller: seller2._id,
      material: mat3._id,
      quantity: 50,
      unit: 'kg',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expectedDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      price: 230,
      totalAmount: 11500,
      status: 'PENDING',
      notes: 'Urgent dispatch to Coimbatore processing unit.',
    });

    await PurchaseOrder.create({
      poNumber: 'PO-2026-0103',
      seller: seller1._id,
      material: mat4._id,
      quantity: 15,
      unit: 'kg',
      orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      expectedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      price: 540,
      totalAmount: 8100,
      status: 'RECEIVED',
      notes: 'Batch inspected and approved at Chennai testing laboratory.',
    });

    console.log('Created 3 Purchase Orders.');

    // 4. Create 3 Production Batches
    await ProductionBatch.create({
      batchNumber: 'BATCH-2026-001',
      productName: 'Premium Knit Cotton T-Shirts',
      fabricType: 'Single Jersey 180 GSM',
      quantity: 2500,
      unit: 'pieces',
      rawMaterial: mat1._id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'IN PRODUCTION',
    });

    await ProductionBatch.create({
      batchNumber: 'BATCH-2026-002',
      productName: 'Heavy Cotton Twill Chinos',
      fabricType: 'Twill Weave 260 GSM',
      quantity: 1200,
      unit: 'meters',
      rawMaterial: mat1._id,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      expectedEndDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actualEndDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
    });

    await ProductionBatch.create({
      batchNumber: 'BATCH-2026-003',
      productName: 'Activewear Dry-Fit Polo',
      fabricType: 'Micro-Polyester Pique',
      quantity: 3000,
      unit: 'pieces',
      rawMaterial: mat2._id,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      expectedEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'PLANNED',
    });

    console.log('Created 3 Production Batches.');

    console.log('==============================================');
    console.log('TexFlow Demo Seed Completed Successfully!');
    console.log('Admin:      admin@texflow.com / admin123');
    console.log('Seller 1:   tiruppur.tex@gmail.com / seller123');
    console.log('Seller 2:   coimbatore.yarns@gmail.com / seller123');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
