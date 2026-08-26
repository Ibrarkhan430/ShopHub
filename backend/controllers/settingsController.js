const Settings = require('../models/Settings');

// ─── Get Settings ──────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Settings ──────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      currency,
      taxRate,
      shippingFee,
      freeShippingThreshold,
      logo,
      paymentMethods,
    } = req.body;

    let settings = await Settings.getSettings();

    if (storeName !== undefined) settings.storeName = storeName;
    if (storeEmail !== undefined) settings.storeEmail = storeEmail;
    if (storePhone !== undefined) settings.storePhone = storePhone;
    if (storeAddress !== undefined) settings.storeAddress = storeAddress;
    if (currency !== undefined) settings.currency = currency;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (logo !== undefined) settings.logo = logo;
    if (paymentMethods !== undefined) settings.paymentMethods = paymentMethods;

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};