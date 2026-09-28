const PurchaseOrder = require('../models/PurchaseOrder');
const RawMaterial = require('../models/RawMaterial');

// Helper to generate PO numbers like PO-2026-1001
const generatePONumber = async () => {
  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  return `PO-${year}-${String(count + 101).padStart(4, '0')}`;
};

// @desc    Get purchase orders (Admin: all, Seller: only own orders)
// @route   GET /api/purchase-orders
// @access  Private (Admin & Seller)
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Role scoping
    if (req.user.role === 'SELLER') {
      query.seller = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.poNumber = { $regex: search, $options: 'i' };
    }

    const orders = await PurchaseOrder.find(query)
      .populate('seller', 'name email phone')
      .populate('material', 'materialCode materialName category price unit')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('getOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving purchase orders',
    });
  }
};

// @desc    Get single purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private (Admin or Owner Seller)
exports.getOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('seller', 'name email phone')
      .populate('material', 'materialCode materialName category price unit supplier');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // Role check: Seller can only see their own order
    if (
      req.user.role === 'SELLER' &&
      order.seller._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view another seller\'s order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving purchase order',
    });
  }
};

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin & Seller)
exports.createOrder = async (req, res) => {
  try {
    const { materialId, quantity, expectedDate, notes, customSellerId } = req.body;

    if (!materialId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide material and order quantity',
      });
    }

    const numQty = Number(quantity);
    if (numQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    const rawMaterial = await RawMaterial.findById(materialId);
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found',
      });
    }

    // Determine seller: if Admin provided customSellerId, use it; else logged in seller
    let sellerId = req.user._id;
    if (req.user.role === 'ADMIN' && customSellerId) {
      sellerId = customSellerId;
    }

    const poNumber = await generatePONumber();
    const price = rawMaterial.price;
    const totalAmount = numQty * price;

    const order = await PurchaseOrder.create({
      poNumber,
      seller: sellerId,
      material: rawMaterial._id,
      quantity: numQty,
      unit: rawMaterial.unit,
      orderDate: new Date(),
      expectedDate: expectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      price,
      totalAmount,
      status: 'PENDING',
      notes: notes || '',
    });

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate('seller', 'name email phone')
      .populate('material', 'materialCode materialName category price unit');

    return res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Purchase order created successfully',
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating purchase order',
    });
  }
};

// @desc    Update purchase order (status / details)
// @route   PUT /api/purchase-orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // If Seller
    if (req.user.role === 'SELLER') {
      if (order.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify another seller\'s order',
        });
      }

      // Sellers can only cancel pending orders or update their notes
      if (req.body.status) {
        if (req.body.status === 'CANCELLED') {
          if (order.status !== 'PENDING') {
            return res.status(400).json({
              success: false,
              message: `Cannot cancel order in '${order.status}' status. Only PENDING orders can be cancelled.`,
            });
          }
          order.status = 'CANCELLED';
        } else {
          return res.status(403).json({
            success: false,
            message: 'Sellers can only cancel PENDING orders. Status updates are managed by Admin.',
          });
        }
      }

      if (req.body.notes !== undefined) {
        order.notes = req.body.notes;
      }

      await order.save();
    } else {
      // Admin can update status and details
      if (req.body.status) {
        order.status = req.body.status;
      }
      if (req.body.notes !== undefined) {
        order.notes = req.body.notes;
      }
      if (req.body.expectedDate) {
        order.expectedDate = req.body.expectedDate;
      }
      if (req.body.quantity !== undefined) {
        order.quantity = Number(req.body.quantity);
        order.totalAmount = order.quantity * order.price;
      }

      await order.save();
    }

    const updated = await PurchaseOrder.findById(order._id)
      .populate('seller', 'name email phone')
      .populate('material', 'materialCode materialName category price unit');

    return res.status(200).json({
      success: true,
      order: updated,
      message: 'Purchase order updated successfully',
    });
  } catch (error) {
    console.error('updateOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating purchase order',
    });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting purchase order',
    });
  }
};
