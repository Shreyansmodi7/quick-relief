import Medicine from '../models/Medicine.js';

// @desc    Fetch all medicines
// @route   GET /api/medicines
// @access  Public
export const getMedicines = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $text: { $search: req.query.keyword }
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const medicines = await Medicine.find({ ...keyword, ...category });
  res.json(medicines);
};

// @desc    Fetch single medicine
// @route   GET /api/medicines/:id
// @access  Public
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Medicine not found' });
  }
};

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private/Admin
export const createMedicine = async (req, res) => {
  const { name, description, price, image, category, inStock, manufacturer, requiresPrescription } = req.body;

  const medicine = new Medicine({
    name,
    description,
    price,
    image,
    category,
    inStock,
    manufacturer,
    requiresPrescription
  });

  const createdMedicine = await medicine.save();
  res.status(201).json(createdMedicine);
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
export const updateMedicine = async (req, res) => {
  const { name, description, price, image, category, inStock, manufacturer, requiresPrescription } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    medicine.name = name || medicine.name;
    medicine.description = description || medicine.description;
    medicine.price = price || medicine.price;
    medicine.image = image || medicine.image;
    medicine.category = category || medicine.category;
    medicine.inStock = inStock !== undefined ? inStock : medicine.inStock;
    medicine.manufacturer = manufacturer || medicine.manufacturer;
    medicine.requiresPrescription = requiresPrescription !== undefined ? requiresPrescription : medicine.requiresPrescription;

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } else {
    res.status(404).json({ message: 'Medicine not found' });
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
export const deleteMedicine = async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    await medicine.deleteOne();
    res.json({ message: 'Medicine removed' });
  } else {
    res.status(404).json({ message: 'Medicine not found' });
  }
};
