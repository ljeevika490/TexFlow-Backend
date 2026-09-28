const User = require('../models/User');
const RawMaterial = require('../models/RawMaterial');
const PurchaseOrder = require('../models/PurchaseOrder');
const ProductionBatch = require('../models/ProductionBatch');

// @desc    Get all sellers (Admin only)
// @route   GET /api/users/sellers
// @access  Private (Admin)
exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'SELLER' }).select('-password').sort({ createdAt: -1 });

    // Attach order count to each seller
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const orderCount = await PurchaseOrder.countDocuments({ seller: seller._id });
        return {
          ...seller.toObject(),
          orderCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: sellersWithStats.length,
      sellers: sellersWithStats,
    });
  } catch (error) {
    console.error('getSellers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving sellers',
    });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/users/admin-stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const totalSellers = await User.countDocuments({ role: 'SELLER' });
    const totalRawMaterials = await RawMaterial.countDocuments();
    const totalPurchaseOrders = await PurchaseOrder.countDocuments();
    const activeProductionBatches = await ProductionBatch.countDocuments({
      status: 'IN PRODUCTION',
    });
    const completedProductionBatches = await ProductionBatch.countDocuments({
      status: 'COMPLETED',
    });

    const recentOrders = await PurchaseOrder.find()
      .populate('seller', 'name email')
      .populate('material', 'materialName materialCode')
      .sort({ createdAt: -1 })
      .limit(5);

    const productionSummary = await ProductionBatch.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalSellers,
        totalRawMaterials,
        totalPurchaseOrders,
        activeProductionBatches,
        completedProductionBatches,
      },
      recentOrders,
      productionSummary,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics',
    });
  }
};

// @desc    Get Seller Dashboard Stats
// @route   GET /api/users/seller-stats
// @access  Private (Seller)
exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalOrders = await PurchaseOrder.countDocuments({ seller: sellerId });
    const pendingOrders = await PurchaseOrder.countDocuments({
      seller: sellerId,
      status: 'PENDING',
    });
    const confirmedOrders = await PurchaseOrder.countDocuments({
      seller: sellerId,
      status: 'CONFIRMED',
    });
    const completedOrders = await PurchaseOrder.countDocuments({
      seller: sellerId,
      status: { $in: ['RECEIVED', 'IN TRANSIT'] },
    });

    const recentOrders = await PurchaseOrder.find({ seller: sellerId })
      .populate('material', 'materialName materialCode price unit')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        completedOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('getSellerStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving seller statistics',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};
