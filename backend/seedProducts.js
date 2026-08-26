require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  // Shoes (3)
  { name: 'Nike Air Max Running Shoes', description: 'Lightweight running sneakers with breathable mesh upper and cushioned sole.', price: 12499, oldPrice: 17999, category: 'Shoes', stock: 20, tag: 'bestseller', rating: 4.5, numReviews: 88, image: '' },
  { name: 'Classic Leather Sneakers', description: 'Premium leather sneakers, perfect for casual everyday wear.', price: 8999, category: 'Shoes', stock: 15, tag: 'new', rating: 4, numReviews: 12, image: '' },
  { name: 'Sports Training Shoes', description: 'Durable training shoes designed for gym and outdoor workouts.', price: 6999, oldPrice: 9499, category: 'Shoes', stock: 25, tag: 'sale', rating: 4.2, numReviews: 34, image: '' },

  // Clothing (4)
  { name: "Levi's Casual Denim Jacket", description: 'Genuine denim jacket, slim fit, perfect for all seasons.', price: 6499, oldPrice: 9999, category: 'Clothing', stock: 18, tag: 'bestseller', rating: 4.7, numReviews: 233, image: '' },
  { name: 'Outfitters Graphic Printed Tee', description: 'Soft cotton t-shirt with modern graphic print.', price: 1899, oldPrice: 2999, category: 'Clothing', stock: 40, tag: 'sale', rating: 4.1, numReviews: 56, image: '' },
  { name: "Khaadi Women's Summer Kurta", description: 'Lightweight breathable kurta, perfect for summer wear.', price: 3499, oldPrice: 4999, category: 'Clothing', stock: 22, tag: 'new', rating: 4.4, numReviews: 19, image: '' },
  { name: 'Formal Slim Fit Shirt', description: 'Crisp cotton-blend formal shirt for office and events.', price: 2799, category: 'Clothing', stock: 30, tag: 'none', rating: 0, numReviews: 0, image: '' },

  // Camera (2)
  { name: 'Canon EOS Mirrorless Camera', description: '24MP mirrorless camera with 4K video recording.', price: 189999, category: 'Camera', stock: 6, tag: 'bestseller', rating: 4.8, numReviews: 41, image: '' },
  { name: 'Compact Digital Camera', description: 'Pocket-friendly digital camera with optical zoom.', price: 34999, oldPrice: 42999, category: 'Camera', stock: 10, tag: 'sale', rating: 4.3, numReviews: 27, image: '' },

  // Laptop (3)
  { name: 'Dell Inspiron 15 Laptop', description: 'Core i5, 8GB RAM, 512GB SSD — ideal for work and study.', price: 149999, category: 'Laptop', stock: 8, tag: 'bestseller', rating: 4.6, numReviews: 63, image: '' },
  { name: 'HP Pavilion Ultrabook', description: 'Slim and lightweight laptop with all-day battery life.', price: 134999, oldPrice: 159999, category: 'Laptop', stock: 5, tag: 'sale', rating: 4.4, numReviews: 38, image: '' },
  { name: 'MacBook Air M2', description: 'Apple M2 chip, stunning Retina display, ultra-portable.', price: 289999, category: 'Laptop', stock: 4, tag: 'new', rating: 4.9, numReviews: 15, image: '' },

  // Keyboard (2)
  { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with tactile switches.', price: 8999, oldPrice: 11999, category: 'Keyboard', stock: 20, tag: 'sale', rating: 4.5, numReviews: 47, image: '' },
  { name: 'Wireless Slim Keyboard', description: 'Compact wireless keyboard with quiet-click keys.', price: 3499, category: 'Keyboard', stock: 25, tag: 'new', rating: 0, numReviews: 0, image: '' },

  // Mouse (4)
  { name: 'Logitech Wireless Mouse', description: 'Ergonomic wireless mouse with precision tracking.', price: 2499, category: 'Mouse', stock: 35, tag: 'bestseller', rating: 4.6, numReviews: 102, image: '' },
  { name: 'RGB Gaming Mouse', description: 'High-DPI gaming mouse with customizable RGB lighting.', price: 4999, oldPrice: 6499, category: 'Mouse', stock: 18, tag: 'sale', rating: 4.4, numReviews: 29, image: '' },
  { name: 'Bluetooth Silent Mouse', description: 'Noise-free clicking, dual connectivity, compact design.', price: 1999, category: 'Mouse', stock: 30, tag: 'new', rating: 0, numReviews: 0, image: '' },
  { name: 'Vertical Ergonomic Mouse', description: 'Reduces wrist strain with a natural handshake grip design.', price: 3999, category: 'Mouse', stock: 15, tag: 'none', rating: 4.2, numReviews: 8, image: '' },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Admin user dhoondein (createdBy field ke liye zaroori hai)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Please create an admin account first.');
      process.exit(1);
    }

    const productsWithCreator = products.map((p) => ({ ...p, createdBy: admin._id }));

    await Product.insertMany(productsWithCreator);
    console.log(`✅ ${productsWithCreator.length} products added successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();