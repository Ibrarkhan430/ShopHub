const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ======================================================
// GENERATE JWT TOKEN
// ======================================================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

// ======================================================
// REGISTER USER
// ======================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // IMPORTANT:
    // Do NOT hash password here.
    // User.js pre-save middleware will hash it automatically.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        token: generateToken(user._id),
      });
    }

    return res.status(400).json({
      message: 'Invalid user data',
    });

  } catch (error) {
    console.error('Register error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // Password incorrect
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Login successful
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// GET USER PROFILE
// ======================================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.json(user);

  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// UPDATE USER PROFILE
// ======================================================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const {
      name,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      profileImage,
    } = req.body;

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (address !== undefined) {
      user.address = address;
    }

    if (city !== undefined) {
      user.city = city;
    }

    if (postalCode !== undefined) {
      user.postalCode = postalCode;
    }

    if (country !== undefined) {
      user.country = country;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      postalCode: updatedUser.postalCode,
      country: updatedUser.country,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    // Validate fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          'Please provide current password and new password',
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          'New password must be at least 6 characters',
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    // IMPORTANT:
    // Do NOT bcrypt.hash() here.
    // User.js pre-save middleware handles hashing.
    user.password = newPassword;

    await user.save();

    return res.json({
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// ADD ADDRESS
// ======================================================
const addAddress = async (req, res) => {
  try {
    const {
      name,
      fullName,
      address,
      city,
      postalCode,
      country,
      phone,
      isDefault,
    } = req.body;

    if (
      !name ||
      !fullName ||
      !address ||
      !city ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        message:
          'Please provide complete address (name, fullName, address, city, postalCode, country)',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // If this address is default,
    // remove default from existing addresses
    if (isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses.push({
      name,
      fullName,
      address,
      city,
      postalCode,
      country,
      phone: phone || '',
      isDefault: isDefault || false,
    });

    await user.save();

    return res.status(201).json(user.addresses);

  } catch (error) {
    console.error('Add address error:', error);

    return res.status(500).json({
      message: 'Server error while adding address',
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ADDRESS
// ======================================================
const updateAddress = async (req, res) => {
  try {
    const {
      name,
      fullName,
      address,
      city,
      postalCode,
      country,
      phone,
      isDefault,
    } = req.body;

    const addressId = req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    // If this address is default,
    // remove default from other addresses
    if (isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),

      name:
        name ||
        user.addresses[addressIndex].name,

      fullName:
        fullName ||
        user.addresses[addressIndex].fullName,

      address:
        address ||
        user.addresses[addressIndex].address,

      city:
        city ||
        user.addresses[addressIndex].city,

      postalCode:
        postalCode ||
        user.addresses[addressIndex].postalCode,

      country:
        country ||
        user.addresses[addressIndex].country,

      phone:
        phone !== undefined
          ? phone
          : user.addresses[addressIndex].phone,

      isDefault:
        isDefault !== undefined
          ? isDefault
          : user.addresses[addressIndex].isDefault,
    };

    await user.save();

    return res.json(user.addresses);

  } catch (error) {
    console.error('Update address error:', error);

    return res.status(500).json({
      message: 'Server error while updating address',
      error: error.message,
    });
  }
};

// ======================================================
// DELETE ADDRESS
// ======================================================
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const addressExists = user.addresses.some(
      (addr) => addr._id.toString() === addressId
    );

    if (!addressExists) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    return res.json(user.addresses);

  } catch (error) {
    console.error('Delete address error:', error);

    return res.status(500).json({
      message: 'Server error while deleting address',
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL USERS - ADMIN
// ======================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password');

    return res.json(users);

  } catch (error) {
    console.error('Get all users error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// GET USER BY ID - ADMIN
// ======================================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.json(user);

  } catch (error) {
    console.error('Get user by ID error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// DELETE USER - ADMIN
// ======================================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    await user.deleteOne();

    return res.json({
      message: 'User removed successfully',
    });

  } catch (error) {
    console.error('Delete user error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// UPDATE USER - ADMIN
// ======================================================
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const {
      name,
      email,
      role,
      isActive,
    } = req.body;

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email.toLowerCase().trim();
    }

    if (role) {
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });

  } catch (error) {
    console.error('Update user error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
};