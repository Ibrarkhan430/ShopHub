const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// =====================================================
// HELPERS
// =====================================================

const CUSTOMER_ROLE = "user";

const COMPLETED_STATUSES = ["delivered"];

const getDays = (value, defaultValue = 7) => {
  const days = Number.parseInt(value, 10);

  if (!Number.isFinite(days) || days < 1) {
    return defaultValue;
  }

  return Math.min(days, 365);
};

const getLimit = (value, defaultValue = 5) => {
  const limit = Number.parseInt(value, 10);

  if (!Number.isFinite(limit) || limit < 1) {
    return defaultValue;
  }

  return Math.min(limit, 100);
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const formatDate = (date) => {
  const d = new Date(date);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatMoney = (value) => Number(value || 0);

const getPercentageChange = (current, previous) => {
  current = Number(current || 0);
  previous = Number(previous || 0);

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getCustomerStatus = (ordersCount) => {
  if (ordersCount === 0) return "inactive";
  if (ordersCount >= 10) return "vip";
  if (ordersCount >= 2) return "active";

  return "new";
};

// =====================================================
// GET DASHBOARD STATS
// =====================================================

exports.getDashboardStats = async (req, res) => {
  try {
    const days = getDays(req.query.days, 7);

    const currentStart = startOfDay(daysAgo(days - 1));
    const previousStart = startOfDay(daysAgo(days * 2 - 1));

    // -------------------------------------------------
    // CURRENT PERIOD ORDERS
    // -------------------------------------------------

    const currentOrders = await Order.find({
      createdAt: {
        $gte: currentStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    // -------------------------------------------------
    // PREVIOUS PERIOD ORDERS
    // -------------------------------------------------

    const previousOrders = await Order.find({
      createdAt: {
        $gte: previousStart,
        $lt: currentStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    // -------------------------------------------------
    // REVENUE
    // IMPORTANT: Order model uses totalPrice
    // -------------------------------------------------

    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + formatMoney(order.totalPrice),
      0
    );

    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + formatMoney(order.totalPrice),
      0
    );

    // -------------------------------------------------
    // BASIC COUNTS
    // IMPORTANT: User model uses role "user"
    // -------------------------------------------------

    const totalCustomers = await User.countDocuments({
      role: CUSTOMER_ROLE,
    });

    const totalProducts = await Product.countDocuments();

    // -------------------------------------------------
    // NEW CUSTOMERS
    // -------------------------------------------------

    const currentNewCustomers = await User.countDocuments({
      role: CUSTOMER_ROLE,
      createdAt: {
        $gte: currentStart,
      },
    });

    const previousNewCustomers = await User.countDocuments({
      role: CUSTOMER_ROLE,
      createdAt: {
        $gte: previousStart,
        $lt: currentStart,
      },
    });

    // -------------------------------------------------
    // TODAY
    // -------------------------------------------------

    const todayStart = startOfDay(new Date());

    const todayOrders = await Order.find({
      createdAt: {
        $gte: todayStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    const revenueToday = todayOrders.reduce(
      (sum, order) => sum + formatMoney(order.totalPrice),
      0
    );

    // -------------------------------------------------
    // THIS WEEK
    // -------------------------------------------------

    const weekStart = startOfDay(daysAgo(6));

    const weekOrders = await Order.find({
      createdAt: {
        $gte: weekStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    const revenueWeek = weekOrders.reduce(
      (sum, order) => sum + formatMoney(order.totalPrice),
      0
    );

    // -------------------------------------------------
    // NEW CUSTOMERS TODAY / WEEK / MONTH
    // -------------------------------------------------

    const newCustomersToday = await User.countDocuments({
      role: CUSTOMER_ROLE,
      createdAt: {
        $gte: todayStart,
      },
    });

    const newCustomersWeek = await User.countDocuments({
      role: CUSTOMER_ROLE,
      createdAt: {
        $gte: weekStart,
      },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const newCustomersMonth = await User.countDocuments({
      role: CUSTOMER_ROLE,
      createdAt: {
        $gte: monthStart,
      },
    });

    // -------------------------------------------------
    // RETURNING CUSTOMERS
    // -------------------------------------------------

    const returningCustomersAgg = await Order.aggregate([
      {
        $match: {
          status: {
            $in: COMPLETED_STATUSES,
          },
        },
      },
      {
        $group: {
          _id: "$user",
          orderCount: {
            $sum: 1,
          },
        },
      },
      {
        $match: {
          orderCount: {
            $gte: 2,
          },
        },
      },
      {
        $count: "count",
      },
    ]);

    const returningCustomers =
      returningCustomersAgg[0]?.count || 0;

    // -------------------------------------------------
    // INACTIVE CUSTOMERS
    // -------------------------------------------------

    const customersWithOrders = await Order.distinct("user", {
      status: {
        $in: COMPLETED_STATUSES,
      },
    });

    const inactiveCustomers = Math.max(
      totalCustomers - customersWithOrders.length,
      0
    );

    // -------------------------------------------------
    // SEGMENTS
    // -------------------------------------------------

    const newCustomers = Math.max(
      totalCustomers -
        returningCustomers -
        inactiveCustomers,
      0
    );

    const retentionRate =
      totalCustomers > 0
        ? Number(
            (
              (returningCustomers / totalCustomers) *
              100
            ).toFixed(1)
          )
        : 0;

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      totalCustomers,

      totalProducts,

      totalOrders: currentOrders.length,

      totalRevenue: currentRevenue,

      totalSales: currentRevenue,

      averageOrderValue:
        currentOrders.length > 0
          ? Math.round(
              currentRevenue / currentOrders.length
            )
          : 0,

      salesChange: getPercentageChange(
        currentRevenue,
        previousRevenue
      ),

      ordersChange: getPercentageChange(
        currentOrders.length,
        previousOrders.length
      ),

      newCustomers: currentNewCustomers,

      newCustomersChange: getPercentageChange(
        currentNewCustomers,
        previousNewCustomers
      ),

      newCustomersToday,

      newCustomersWeek,

      newCustomersMonth,

      returningCustomers,

      inactiveCustomers,

      retentionRate,

      revenueToday,

      revenueWeek,

      ordersToday: todayOrders.length,

      segments: [
        {
          name: "New",
          value: newCustomers,
          color: "#3b82f6",
        },
        {
          name: "Returning",
          value: returningCustomers,
          color: "#1e40af",
        },
        {
          name: "Inactive",
          value: inactiveCustomers,
          color: "#93c5fd",
        },
      ],
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    res.status(500).json({
      message: "Failed to load dashboard analytics",
      error: error.message,
    });
  }
};

// =====================================================
// SALES OVER TIME
// =====================================================

exports.getSalesOverTime = async (req, res) => {
  try {
    const days = getDays(req.query.days, 7);

    const daily = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = daysAgo(i);

      const start = startOfDay(date);
      const end = endOfDay(date);

      const orders = await Order.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: {
          $in: COMPLETED_STATUSES,
        },
      }).lean();

      const revenue = orders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

      const newCustomers = await User.countDocuments({
        role: CUSTOMER_ROLE,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      const returningCustomersAgg =
        await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: start,
                $lte: end,
              },
              status: {
                $in: COMPLETED_STATUSES,
              },
            },
          },
          {
            $group: {
              _id: "$user",
              orders: {
                $sum: 1,
              },
            },
          },
          {
            $match: {
              orders: {
                $gte: 2,
              },
            },
          },
          {
            $count: "count",
          },
        ]);

      const returningCustomers =
        returningCustomersAgg[0]?.count || 0;

      daily.push({
        date: formatDate(date),
        day: formatDate(date),

        sales: revenue,
        revenue,

        orders: orders.length,

        new: newCustomers,
        returning: returningCustomers,
      });
    }

    // Weekly data
    const weekly = [];

    for (let i = 3; i >= 0; i--) {
      const end = endOfDay(daysAgo(i * 7));

      const start = startOfDay(
        new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
      );

      const orders = await Order.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: {
          $in: COMPLETED_STATUSES,
        },
      }).lean();

      const revenue = orders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

      const newCustomers = await User.countDocuments({
        role: CUSTOMER_ROLE,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      weekly.push({
        week: `${formatDate(start)} - ${formatDate(end)}`,
        revenue,
        sales: revenue,
        orders: orders.length,
        new: newCustomers,
        returning: 0,
      });
    }

    // Monthly data
    const monthly = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();

      date.setMonth(date.getMonth() - i);

      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );

      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const orders = await Order.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
        status: {
          $in: COMPLETED_STATUSES,
        },
      }).lean();

      const revenue = orders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

      const newCustomers = await User.countDocuments({
        role: CUSTOMER_ROLE,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      monthly.push({
        month: start.toLocaleString("en-US", {
          month: "short",
        }),
        revenue,
        sales: revenue,
        orders: orders.length,
        new: newCustomers,
        returning: 0,
      });
    }

    res.json({
      daily,
      weekly,
      monthly,
    });
  } catch (error) {
    console.error("Sales over time error:", error);

    res.status(500).json({
      message: "Failed to load sales data",
      error: error.message,
    });
  }
};

// =====================================================
// ORDERS OVER TIME
// =====================================================

exports.getOrdersOverTime = async (req, res) => {
  try {
    const days = getDays(req.query.days, 7);

    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = daysAgo(i);

      const start = startOfDay(date);
      const end = endOfDay(date);

      const orders = await Order.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      }).lean();

      const revenue = orders
        .filter((order) =>
          COMPLETED_STATUSES.includes(order.status)
        )
        .reduce(
          (sum, order) =>
            sum + formatMoney(order.totalPrice),
          0
        );

      result.push({
        date: formatDate(date),
        orders: orders.length,
        revenue,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Orders over time error:", error);

    res.status(500).json({
      message: "Failed to load orders data",
      error: error.message,
    });
  }
};

// =====================================================
// NEW CUSTOMERS OVER TIME
// =====================================================

exports.getNewCustomersOverTime = async (req, res) => {
  try {
    const days = getDays(req.query.days, 7);

    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = daysAgo(i);

      const start = startOfDay(date);
      const end = endOfDay(date);

      const count = await User.countDocuments({
        role: CUSTOMER_ROLE,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

      result.push({
        date: formatDate(date),
        newCustomers: count,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("New customers error:", error);

    res.status(500).json({
      message: "Failed to load new customers",
      error: error.message,
    });
  }
};

// =====================================================
// SALES BY CATEGORY
// =====================================================

exports.getSalesByCategory = async (req, res) => {
  try {
    const orders = await Order.find({
      status: {
        $in: COMPLETED_STATUSES,
      },
    })
      .populate("orderItems.product")
      .lean();

    const categoryTotals = {};

    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const product = item.product;

        if (!product) return;

        const category =
          product.category || "Other";

        const amount =
          formatMoney(item.price) *
          Number(item.quantity || 0);

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          amount;
      });
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, value) => sum + value,
      0
    );

    const result = Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,

        total: value,

        revenue: value,

        percentage:
          total > 0
            ? Number(
                ((value / total) * 100).toFixed(1)
              )
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (error) {
    console.error("Category analytics error:", error);

    res.status(500).json({
      message: "Failed to load category analytics",
      error: error.message,
    });
  }
};

// =====================================================
// TOP PRODUCTS
// =====================================================

exports.getTopProducts = async (req, res) => {
  try {
    const limit = getLimit(req.query.limit, 5);

    const orders = await Order.find({
      status: {
        $in: COMPLETED_STATUSES,
      },
    })
      .populate("orderItems.product")
      .lean();

    const stats = {};

    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const product = item.product;

        if (!product) return;

        const id = String(product._id);

        if (!stats[id]) {
          stats[id] = {
            id: product._id,
            _id: product._id,
            name: product.name,
            image: product.image || "",
            soldQty: 0,
            sold: 0,
            revenue: 0,
            price: product.price || 0,
            stock: product.stock || 0,
          };
        }

        const quantity = Number(
          item.quantity || 0
        );

        const revenue =
          formatMoney(item.price) * quantity;

        stats[id].soldQty += quantity;
        stats[id].sold += quantity;
        stats[id].revenue += revenue;
      });
    });

    const result = Object.values(stats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error("Top products error:", error);

    res.status(500).json({
      message: "Failed to load top products",
      error: error.message,
    });
  }
};

// =====================================================
// TOP CUSTOMERS
// =====================================================

exports.getTopCustomers = async (req, res) => {
  try {
    const limit = getLimit(req.query.limit, 5);

    const stats = await Order.aggregate([
      {
        $match: {
          status: {
            $in: COMPLETED_STATUSES,
          },
        },
      },

      {
        $group: {
          _id: "$user",

          totalOrders: {
            $sum: 1,
          },

          totalSpent: {
            $sum: "$totalPrice",
          },
        },
      },

      {
        $sort: {
          totalSpent: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);

    const userIds = stats.map(
      (item) => item._id
    );

    const users = await User.find({
      _id: {
        $in: userIds,
      },
    })
      .select("name email role")
      .lean();

    const userMap = {};

    users.forEach((user) => {
      userMap[String(user._id)] = user;
    });

    const result = stats.map((item) => {
      const user =
        userMap[String(item._id)];

      return {
        id: item._id,

        name: user?.name || "Unknown",

        email: user?.email || "",

        totalOrders: item.totalOrders,

        totalSpent: formatMoney(
          item.totalSpent
        ),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Top customers error:", error);

    res.status(500).json({
      message: "Failed to load top customers",
      error: error.message,
    });
  }
};

// =====================================================
// ALL CUSTOMER ANALYTICS
// =====================================================

exports.getAllCustomerAnalytics = async (
  req,
  res
) => {
  try {
    const customers = await User.find({
      role: CUSTOMER_ROLE,
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({
          user: customer._id,
          status: {
            $in: COMPLETED_STATUSES,
          },
        })
          .sort({ createdAt: -1 })
          .lean();

        const totalSpent = orders.reduce(
          (sum, order) =>
            sum + formatMoney(order.totalPrice),
          0
        );

        const today = startOfDay(new Date());
        const yesterday = startOfDay(
          daysAgo(1)
        );

        const todayOrders = orders.filter(
          (order) =>
            new Date(order.createdAt) >= today
        );

        const yesterdayOrders = orders.filter(
          (order) =>
            new Date(order.createdAt) >=
              yesterday &&
            new Date(order.createdAt) < today
        );

        const todaySales = todayOrders.reduce(
          (sum, order) =>
            sum + formatMoney(order.totalPrice),
          0
        );

        const yesterdaySales =
          yesterdayOrders.reduce(
            (sum, order) =>
              sum + formatMoney(order.totalPrice),
            0
          );

        const dailySales = [];

        for (let i = 6; i >= 0; i--) {
          const date = daysAgo(i);

          const start = startOfDay(date);
          const end = endOfDay(date);

          const dayOrders = orders.filter(
            (order) => {
              const created = new Date(
                order.createdAt
              );

              return (
                created >= start &&
                created <= end
              );
            }
          );

          const sales = dayOrders.reduce(
            (sum, order) =>
              sum +
              formatMoney(order.totalPrice),
            0
          );

          dailySales.push({
            date: formatDate(date),
            sales,
            orders: dayOrders.length,
          });
        }

        return {
          id: customer._id,

          _id: customer._id,

          name: customer.name,

          email: customer.email,

          createdAt: customer.createdAt,

          totalOrders: orders.length,

          totalSpent,

          todaySales,

          yesterdaySales,

          salesChange: getPercentageChange(
            todaySales,
            yesterdaySales
          ),

          lastOrderDate:
            orders.length > 0
              ? orders[0].createdAt
              : null,

          status: getCustomerStatus(
            orders.length
          ),

          avatar:
            customer.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "??",

          dailySales,
        };
      })
    );

    // Frontend expects data
    res.json({
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error(
      "Customer analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load customer analytics",
      error: error.message,
    });
  }
};

// =====================================================
// CUSTOMER DAILY SALES
// =====================================================

exports.getCustomerDailySales = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Customer ID is required",
      });
    }

    const days = getDays(req.query.days, 7);

    const orders = await Order.find({
      user: id,
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = daysAgo(i);

      const start = startOfDay(date);
      const end = endOfDay(date);

      const dayOrders = orders.filter(
        (order) => {
          const created = new Date(
            order.createdAt
          );

          return (
            created >= start &&
            created <= end
          );
        }
      );

      const sales = dayOrders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

      result.push({
        date: formatDate(date),
        sales,
        orders: dayOrders.length,
      });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "Customer daily sales error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load customer sales",
      error: error.message,
    });
  }
};

// =====================================================
// BUSINESS INSIGHTS
// =====================================================

exports.getBusinessInsights = async (
  req,
  res
) => {
  try {
    const days = getDays(req.query.days, 7);

    const currentStart = startOfDay(
      daysAgo(days - 1)
    );

    const previousStart = startOfDay(
      daysAgo(days * 2 - 1)
    );

    const currentOrders = await Order.find({
      createdAt: {
        $gte: currentStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    const previousOrders = await Order.find({
      createdAt: {
        $gte: previousStart,
        $lt: currentStart,
      },
      status: {
        $in: COMPLETED_STATUSES,
      },
    }).lean();

    const currentRevenue =
      currentOrders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

    const previousRevenue =
      previousOrders.reduce(
        (sum, order) =>
          sum + formatMoney(order.totalPrice),
        0
      );

    const salesChange =
      getPercentageChange(
        currentRevenue,
        previousRevenue
      );

    const newCustomers =
      await User.countDocuments({
        role: CUSTOMER_ROLE,
        createdAt: {
          $gte: currentStart,
        },
      });

    const insights = [];

    // Sales
    if (salesChange > 0) {
      insights.push({
        type: "positive",
        title: "Sales are growing",
        message: `Sales increased by ${salesChange}% compared with the previous period.`,
      });
    } else if (salesChange < 0) {
      insights.push({
        type: "negative",
        title: "Sales decreased",
        message: `Sales decreased by ${Math.abs(
          salesChange
        )}% compared with the previous period.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Sales are stable",
        message:
          "Sales are currently stable compared with the previous period.",
      });
    }

    // Customers
    if (newCustomers > 0) {
      insights.push({
        type: "positive",
        title: "New customers",
        message: `${newCustomers} new customers joined in the selected period.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "No new customers",
        message:
          "There were no new customer registrations in the selected period.",
      });
    }

    // Top category
    const categoryAgg =
      await Order.aggregate([
        {
          $match: {
            status: {
              $in: COMPLETED_STATUSES,
            },
          },
        },

        {
          $unwind: "$orderItems",
        },

        {
          $lookup: {
            from: "products",
            localField:
              "orderItems.product",
            foreignField: "_id",
            as: "product",
          },
        },

        {
          $unwind: "$product",
        },

        {
          $group: {
            _id: "$product.category",

            revenue: {
              $sum: {
                $multiply: [
                  "$orderItems.price",
                  "$orderItems.quantity",
                ],
              },
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 1,
        },
      ]);

    if (categoryAgg.length > 0) {
      insights.push({
        type: "info",
        title: "Top category",
        message: `${categoryAgg[0]._id} is currently your best-performing category.`,
      });
    }

    // Top product
    const topProduct =
      await Order.aggregate([
        {
          $match: {
            status: {
              $in: COMPLETED_STATUSES,
            },
          },
        },

        {
          $unwind: "$orderItems",
        },

        {
          $group: {
            _id: "$orderItems.product",

            revenue: {
              $sum: {
                $multiply: [
                  "$orderItems.price",
                  "$orderItems.quantity",
                ],
              },
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 1,
        },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },

        {
          $unwind: "$product",
        },
      ]);

    if (topProduct.length > 0) {
      insights.push({
        type: "info",
        title: "Best selling product",
        message: `${topProduct[0].product.name} is currently your best-selling product.`,
      });
    }

    // Top customer
    const topCustomer =
      await Order.aggregate([
        {
          $match: {
            status: {
              $in: COMPLETED_STATUSES,
            },
          },
        },

        {
          $group: {
            _id: "$user",

            totalSpent: {
              $sum: "$totalPrice",
            },
          },
        },

        {
          $sort: {
            totalSpent: -1,
          },
        },

        {
          $limit: 1,
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $unwind: "$user",
        },
      ]);

    if (topCustomer.length > 0) {
      insights.push({
        type: "info",
        title: "Top customer",
        message: `${topCustomer[0].user.name} has spent Rs. ${formatMoney(
          topCustomer[0].totalSpent
        ).toLocaleString()} in completed orders.`,
      });
    }

    res.json(insights);
  } catch (error) {
    console.error(
      "Business insights error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load business insights",
      error: error.message,
    });
  }
};