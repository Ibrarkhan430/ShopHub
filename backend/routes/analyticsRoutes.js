const express = require("express");
const router = express.Router();

// ─── Auth Middleware ──────────────────────────────────────
const { protect, admin } = require("../middleware/authMiddleware");

// ─── Analytics Controller ─────────────────────────────────
const analyticsController = require("../controllers/analyticsController");

// ─── Analytics Routes ─────────────────────────────────────

// 1. Dashboard statistics
router.get(
  "/stats",
  protect,
  admin,
  analyticsController.getDashboardStats
);

// 2. Sales over time
router.get(
  "/sales-over-time",
  protect,
  admin,
  analyticsController.getSalesOverTime
);

// 3. Orders over time
router.get(
  "/orders-over-time",
  protect,
  admin,
  analyticsController.getOrdersOverTime
);

// 4. New customers over time
router.get(
  "/new-customers",
  protect,
  admin,
  analyticsController.getNewCustomersOverTime
);

// 5. Sales by category
router.get(
  "/categories",
  protect,
  admin,
  analyticsController.getSalesByCategory
);

// 6. Top products
router.get(
  "/top-products",
  protect,
  admin,
  analyticsController.getTopProducts
);

// 7. Top customers
router.get(
  "/top-customers",
  protect,
  admin,
  analyticsController.getTopCustomers
);

// 8. All customer analytics
router.get(
  "/customers",
  protect,
  admin,
  analyticsController.getAllCustomerAnalytics
);

// 9. Individual customer daily analytics
router.get(
  "/customers/:id/daily",
  protect,
  admin,
  analyticsController.getCustomerDailySales
);

// 10. Business insights
router.get(
  "/insights",
  protect,
  admin,
  analyticsController.getBusinessInsights
);

// ✅ ADDED: Dashboard route (for backward compatibility)
router.get(
  "/dashboard",
  protect,
  admin,
  analyticsController.getDashboardStats
);

module.exports = router;