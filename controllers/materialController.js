const RawMaterial = require('../models/RawMaterial');

// @desc    Get all raw materials with optional search and filter
// @route   GET /api/raw-materials
// @access  Private (Admin & Seller)
exports.getMaterials = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { materialName: { $regex: search, $options: 'i' } },
        { materialCode: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const materials = await RawMaterial.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error('getMaterials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving raw materials',
    });
  }
};

// @desc    Get single raw material by ID
// @route   GET /api/raw-materials/:id
// @access  Private (Admin & Seller)
exports.getMaterialById = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found',
      });
    }

    return res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving raw material',
    });
  }
};

// @desc    Create new raw material
// @route   POST /api/raw-materials
// @access  Private (Admin only)
exports.createMaterial = async (req, res) => {
  try {
    const {
      materialCode,
      materialName,
      category,
      supplier,
      quantity,
      unit,
      price,
      status,
    } = req.body;

    if (!materialCode || !materialName || !category || !supplier || quantity === undefined || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (code, name, category, supplier, quantity, price)',
      });
    }

    const existing = await RawMaterial.findOne({ materialCode: materialCode.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Material code '${materialCode.toUpperCase()}' is already in use`,
      });
    }

    const material = await RawMaterial.create({
      materialCode: materialCode.trim().toUpperCase(),
      materialName: materialName.trim(),
      category: category.trim(),
      supplier: supplier.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'kg',
      price: Number(price),
      status: status || (Number(quantity) <= 0 ? 'OUT OF STOCK' : Number(quantity) < 50 ? 'LOW STOCK' : 'AVAILABLE'),
    });

    return res.status(201).json({
      success: true,
      material,
      message: 'Raw material added successfully',
    });
  } catch (error) {
    console.error('createMaterial error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating raw material',
    });
  }
};

// @desc    Update raw material
// @route   PUT /api/raw-materials/:id
// @access  Private (Admin only)
exports.updateMaterial = async (req, res) => {
  try {
    let material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found',
      });
    }

    if (req.body.materialCode && req.body.materialCode.toUpperCase() !== material.materialCode) {
      const existing = await RawMaterial.findOne({ materialCode: req.body.materialCode.toUpperCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Material code '${req.body.materialCode.toUpperCase()}' is already in use`,
        });
      }
    }

    const updateData = { ...req.body };
    if (updateData.materialCode) updateData.materialCode = updateData.materialCode.toUpperCase();
    if (updateData.quantity !== undefined) updateData.quantity = Number(updateData.quantity);
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);

    // Auto status if not explicitly overridden
    if (updateData.quantity !== undefined && !updateData.status) {
      if (updateData.quantity <= 0) updateData.status = 'OUT OF STOCK';
      else if (updateData.quantity < 50) updateData.status = 'LOW STOCK';
      else updateData.status = 'AVAILABLE';
    }

    material = await RawMaterial.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      material,
      message: 'Raw material updated successfully',
    });
  } catch (error) {
    console.error('updateMaterial error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating raw material',
    });
  }
};

// @desc    Delete raw material
// @route   DELETE /api/raw-materials/:id
// @access  Private (Admin only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found',
      });
    }

    await RawMaterial.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Raw material deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting raw material',
    });
  }
};
