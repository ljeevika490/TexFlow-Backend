const ProductionBatch = require('../models/ProductionBatch');

// Helper to generate Batch numbers like BATCH-2026-001
const generateBatchNumber = async () => {
  const count = await ProductionBatch.countDocuments();
  const year = new Date().getFullYear();
  return `BATCH-${year}-${String(count + 1).padStart(3, '0')}`;
};

// @desc    Get all production batches
// @route   GET /api/production
// @access  Private (Admin)
exports.getBatches = async (req, res) => {
  try {
    const { search, status, fabricType } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { fabricType: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (fabricType) {
      query.fabricType = fabricType;
    }

    const batches = await ProductionBatch.find(query)
      .populate('rawMaterial', 'materialCode materialName category unit')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error('getBatches error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving production batches',
    });
  }
};

// @desc    Get single batch by ID
// @route   GET /api/production/:id
// @access  Private (Admin)
exports.getBatchById = async (req, res) => {
  try {
    const batch = await ProductionBatch.findById(req.params.id).populate(
      'rawMaterial',
      'materialCode materialName category unit quantity price supplier'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Production batch not found',
      });
    }

    return res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving production batch',
    });
  }
};

// @desc    Create new production batch
// @route   POST /api/production
// @access  Private (Admin)
exports.createBatch = async (req, res) => {
  try {
    const {
      productName,
      fabricType,
      quantity,
      unit,
      rawMaterial,
      startDate,
      expectedEndDate,
      status,
    } = req.body;

    if (!productName || !fabricType || !quantity || !rawMaterial || !startDate || !expectedEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required batch fields (product name, fabric type, quantity, material, dates)',
      });
    }

    const batchNumber = req.body.batchNumber || (await generateBatchNumber());

    const batch = await ProductionBatch.create({
      batchNumber,
      productName: productName.trim(),
      fabricType: fabricType.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'meters',
      rawMaterial,
      startDate,
      expectedEndDate,
      status: status || 'PLANNED',
    });

    const populated = await ProductionBatch.findById(batch._id).populate(
      'rawMaterial',
      'materialCode materialName category unit'
    );

    return res.status(201).json({
      success: true,
      batch: populated,
      message: 'Production batch created successfully',
    });
  } catch (error) {
    console.error('createBatch error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating production batch',
    });
  }
};

// @desc    Update production batch
// @route   PUT /api/production/:id
// @access  Private (Admin)
exports.updateBatch = async (req, res) => {
  try {
    let batch = await ProductionBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Production batch not found',
      });
    }

    const updateData = { ...req.body };

    // If changing to COMPLETED and no actualEndDate, set today
    if (updateData.status === 'COMPLETED' && !updateData.actualEndDate) {
      updateData.actualEndDate = new Date();
    }

    batch = await ProductionBatch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('rawMaterial', 'materialCode materialName category unit');

    return res.status(200).json({
      success: true,
      batch,
      message: 'Production batch updated successfully',
    });
  } catch (error) {
    console.error('updateBatch error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating production batch',
    });
  }
};

// @desc    Delete production batch
// @route   DELETE /api/production/:id
// @access  Private (Admin)
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await ProductionBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Production batch not found',
      });
    }

    await ProductionBatch.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Production batch deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting production batch',
    });
  }
};
