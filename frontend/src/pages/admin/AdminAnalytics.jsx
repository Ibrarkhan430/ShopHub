import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  UserPlus,
  Activity,
  Clock,
  RefreshCw,
  MoreHorizontal,
  AlertCircle,
  Package,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// =====================================================
// AUTH
// =====================================================

const getAuthConfig = () => {
  try {
    const userInfo = JSON.parse(
      localStorage.getItem("userInfo") || "{}"
    );

    const token = userInfo?.token;

    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch {
    return {
      headers: {
        Authorization: "",
      },
    };
  }
};

// =====================================================
// KPI CARD
// =====================================================

const KPICard = ({
  title,
  value,
  change,
  changeType = "up",
  icon: Icon,
  subtitle,
  highlight = false,
}) => {
  const isUp = changeType === "up";

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-lg ${
        highlight
          ? "border-blue-500 bg-blue-600 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              highlight ? "text-blue-100" : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h3
            className={`mt-1 text-2xl font-bold ${
              highlight ? "text-white" : "text-slate-800"
            }`}
          >
            {value}
          </h3>

          <div className="mt-2 flex items-center gap-1">
            {isUp ? (
              <ArrowUpRight
                className={`h-4 w-4 ${
                  highlight ? "text-blue-200" : "text-green-500"
                }`}
              />
            ) : (
              <ArrowDownRight
                className={`h-4 w-4 ${
                  highlight ? "text-blue-200" : "text-red-500"
                }`}
              />
            )}

            <span
              className={`text-sm font-medium ${
                highlight
                  ? "text-blue-100"
                  : isUp
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {change}
            </span>

            <span
              className={`ml-1 text-xs ${
                highlight ? "text-blue-200" : "text-slate-400"
              }`}
            >
              {subtitle}
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            highlight ? "bg-blue-500" : "bg-blue-50"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              highlight ? "text-white" : "text-blue-600"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({ status }) => {
  const styles = {
    active:
      "border-green-200 bg-green-100 text-green-700",
    new: "border-blue-200 bg-blue-100 text-blue-700",
    vip:
      "border-amber-200 bg-amber-100 text-amber-700",
    inactive:
      "border-slate-200 bg-slate-100 text-slate-500",
  };

  const safeStatus = status || "inactive";

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[safeStatus] || styles.inactive
      }`}
    >
      {safeStatus.charAt(0).toUpperCase() +
        safeStatus.slice(1)}
    </span>
  );
};

// =====================================================
// CUSTOM TOOLTIP
// =====================================================

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-slate-800">
        {label}
      </p>

      {payload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-2 py-0.5"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: entry.color,
            }}
          />

          <span className="text-slate-600">
            {entry.name}:
          </span>

          <span className="font-semibold text-slate-800">
            {entry.name
              ?.toLowerCase()
              .includes("revenue")
              ? `Rs. ${Number(
                  entry.value || 0
                ).toLocaleString()}`
              : Number(
                  entry.value || 0
                ).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// MAIN ANALYTICS PAGE
// =====================================================

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  const [timeRange, setTimeRange] =
    useState("daily");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const days =
        timeRange === "daily"
          ? 7
          : timeRange === "weekly"
          ? 28
          : 90;

      const config = getAuthConfig();

      const [
        statsRes,
        salesRes,
        ordersRes,
        newCustomersRes,
        categoriesRes,
        topProductsRes,
        topCustomersRes,
        customersRes,
        insightsRes,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/analytics/stats?days=${days}`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/sales-over-time?days=${days}`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/orders-over-time?days=${days}`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/new-customers?days=${days}`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/categories`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/top-products?limit=5`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/top-customers?limit=5`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/customers?days=${days}`,
          config
        ),

        axios.get(
          `${API_URL}/analytics/insights?days=${days}`,
          config
        ),
      ]);

      setAnalytics({
        stats: statsRes.data || {},

        sales: salesRes.data || {
          daily: [],
          weekly: [],
          monthly: [],
        },

        orders: ordersRes.data || [],

        newCustomers: newCustomersRes.data || [],

        categories: categoriesRes.data || [],

        topProducts: topProductsRes.data || [],

        topCustomers: topCustomersRes.data || [],

        customers: customersRes.data || {
          data: [],
          total: 0,
        },

        insights: insightsRes.data || [],
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Analytics fetch error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Unauthorized. Please login as admin to view analytics."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load analytics data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  // ===================================================
  // SAFE DATA
  // ===================================================

  const stats = analytics?.stats || {};

  const customers =
    analytics?.customers?.data || [];

  const categories =
    Array.isArray(analytics?.categories)
      ? analytics.categories
      : [];

  const topProducts =
    Array.isArray(analytics?.topProducts)
      ? analytics.topProducts
      : [];

  const topCustomers =
    Array.isArray(analytics?.topCustomers)
      ? analytics.topCustomers
      : [];

  const insights =
    Array.isArray(analytics?.insights)
      ? analytics.insights
      : [];

  // ===================================================
  // FILTER CUSTOMERS
  // ===================================================

  const filteredCustomers = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const name =
        customer.name?.toLowerCase() || "";

      const email =
        customer.email?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        customer.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    customers,
    searchQuery,
    statusFilter,
  ]);

  // ===================================================
  // CHART DATA
  // ===================================================

  const chartData = useMemo(() => {
    if (!analytics?.sales) {
      return [];
    }

    if (timeRange === "daily") {
      return analytics.sales.daily || [];
    }

    if (timeRange === "weekly") {
      return analytics.sales.weekly || [];
    }

    return analytics.sales.monthly || [];
  }, [analytics, timeRange]);

  const xKey =
    timeRange === "daily"
      ? "date"
      : timeRange === "weekly"
      ? "week"
      : "month";

  // ===================================================
  // FORMATTERS
  // ===================================================

  const formatMoney = (value) =>
    `Rs. ${Number(value || 0).toLocaleString()}`;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString();

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString();
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading && !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin" />

          <span className="text-lg">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error && !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />

          <h3 className="mb-2 text-lg font-bold text-slate-800">
            Error Loading Analytics
          </h3>

          <p className="mb-4 text-sm text-slate-600">
            {error}
          </p>

          <button
            onClick={loadData}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // STATS
  // ===================================================

  const totalCustomers =
    stats.totalCustomers || 0;

  const totalProducts =
    stats.totalProducts || 0;

  const totalOrders =
    stats.totalOrders || 0;

  const totalRevenue =
    stats.totalRevenue ||
    stats.totalSales ||
    0;

  const averageOrderValue =
    stats.averageOrderValue || 0;

  const salesChange =
    Number(stats.salesChange || 0);

  const ordersChange =
    Number(stats.ordersChange || 0);

  const newCustomersChange =
    Number(
      stats.newCustomersChange || 0
    );

  const newCustomers =
    stats.newCustomers || 0;

  const newCustomersToday =
    stats.newCustomersToday || 0;

  const newCustomersWeek =
    stats.newCustomersWeek || 0;

  const newCustomersMonth =
    stats.newCustomersMonth || 0;

  const returningCustomers =
    stats.returningCustomers || 0;

  const inactiveCustomers =
    stats.inactiveCustomers || 0;

  const revenueToday =
    stats.revenueToday || 0;

  const revenueWeek =
    stats.revenueWeek || 0;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Analytics Dashboard
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Live data • Updated{" "}
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">
                  Last 7 Days
                </option>

                <option value="weekly">
                  Last 28 Days
                </option>

                <option value="monthly">
                  Last 90 Days
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Revenue"
            value={formatMoney(totalRevenue)}
            change={`${salesChange >= 0 ? "+" : ""}${salesChange}%`}
            changeType={
              salesChange >= 0
                ? "up"
                : "down"
            }
            subtitle="vs previous period"
            icon={DollarSign}
            highlight
          />

          <KPICard
            title="Total Orders"
            value={formatNumber(totalOrders)}
            change={`${ordersChange >= 0 ? "+" : ""}${ordersChange}%`}
            changeType={
              ordersChange >= 0
                ? "up"
                : "down"
            }
            subtitle="vs previous period"
            icon={ShoppingBag}
          />

          <KPICard
            title="Total Customers"
            value={formatNumber(
              totalCustomers
            )}
            change={`${newCustomersChange >= 0 ? "+" : ""}${newCustomersChange}%`}
            changeType={
              newCustomersChange >= 0
                ? "up"
                : "down"
            }
            subtitle="new customers"
            icon={Users}
          />

          <KPICard
            title="Average Order"
            value={formatMoney(
              averageOrderValue
            )}
            change={`${newCustomers} new`}
            changeType="up"
            subtitle="customers"
            icon={TrendingUp}
          />
        </div>

        {/* =================================================
            SECONDARY STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  New Customers Today
                </p>

                <p className="text-xl font-bold text-slate-800">
                  {formatNumber(
                    newCustomersToday
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <Activity className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  New Customers This Week
                </p>

                <p className="text-xl font-bold text-slate-800">
                  {formatNumber(
                    newCustomersWeek
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Returning Customers
                </p>

                <p className="text-xl font-bold text-slate-800">
                  {formatNumber(
                    returningCustomers
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Revenue This Week
                </p>

                <p className="text-xl font-bold text-slate-800">
                  {formatMoney(
                    revenueWeek
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            REVENUE CHART
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Revenue Overview
              </h3>

              <p className="text-sm text-slate-500">
                Revenue by selected period
              </p>
            </div>

            <div className="flex gap-6">
              <div>
                <p className="text-xs text-slate-500">
                  Today
                </p>

                <p className="text-lg font-bold text-blue-600">
                  {formatMoney(
                    revenueToday
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  This Week
                </p>

                <p className="text-lg font-bold text-slate-800">
                  {formatMoney(
                    revenueWeek
                  )}
                </p>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />

                <XAxis
                  dataKey={xKey}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
              No revenue data available yet.
            </div>
          )}
        </div>

        {/* =================================================
            TOP PRODUCTS + CATEGORIES
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TOP PRODUCTS */}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Top Products
                  </h3>

                  <p className="text-sm text-slate-500">
                    Best performing products
                  </p>
                </div>

                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {topProducts.length > 0 ? (
                topProducts.map(
                  (product, index) => (
                    <div
                      key={
                        product._id ||
                        product.id ||
                        index
                      }
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.name ||
                              "Unknown Product"}
                          </p>

                          <p className="text-xs text-slate-500">
                            Sold:{" "}
                            {formatNumber(
                              product.soldQty ||
                                product.sold ||
                                0
                            )}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-slate-800">
                        {formatMoney(
                          product.revenue
                        )}
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">
                  No product sales available.
                </div>
              )}
            </div>
          </div>

          {/* CATEGORIES */}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800">
                Sales by Category
              </h3>

              <p className="text-sm text-slate-500">
                Category revenue distribution
              </p>
            </div>

            <div className="p-6">
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
                  <div className="h-56">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="revenue"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                        >
                          {categories.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={[
                                  "#3b82f6",
                                  "#10b981",
                                  "#f59e0b",
                                  "#8b5cf6",
                                  "#ef4444",
                                  "#06b6d4",
                                ][
                                  index % 6
                                ]}
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            formatMoney(value)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {categories
                      .slice(0, 6)
                      .map(
                        (
                          category,
                          index
                        ) => (
                          <div
                            key={
                              category.category ||
                              index
                            }
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    [
                                      "#3b82f6",
                                      "#10b981",
                                      "#f59e0b",
                                      "#8b5cf6",
                                      "#ef4444",
                                      "#06b6d4",
                                    ][
                                      index % 6
                                    ],
                                }}
                              />

                              <span className="text-sm text-slate-600">
                                {category.category ||
                                  "Other"}
                              </span>
                            </div>

                            <span className="text-sm font-semibold text-slate-800">
                              {Number(
                                category.percentage ||
                                  0
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        )
                      )}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-slate-400">
                  No category data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            TOP CUSTOMERS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800">
              Top Customers
            </h3>

            <p className="text-sm text-slate-500">
              Customers with the highest completed-order spending
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {topCustomers.length > 0 ? (
              topCustomers.map(
                (customer, index) => (
                  <div
                    key={
                      customer._id ||
                      customer.id ||
                      index
                    }
                    className="p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {customer.name
                          ?.split(" ")
                          .map(
                            (word) =>
                              word[0]
                          )
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) ||
                          "??"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {customer.name ||
                            "Unknown"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-slate-800">
                      {formatMoney(
                        customer.totalSpent
                      )}
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        customer.totalOrders
                      }{" "}
                      completed orders
                    </p>
                  </div>
                )
              )
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 md:col-span-2 lg:col-span-5">
                No customer spending data available.
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            CUSTOMER DIRECTORY
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Customer Directory
                </h3>

                <p className="text-sm text-slate-500">
                  {formatNumber(
                    totalCustomers
                  )}{" "}
                  total •{" "}
                  {formatNumber(newCustomers)}{" "}
                  new •{" "}
                  {formatNumber(
                    returningCustomers
                  )}{" "}
                  returning
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="new">
                    New
                  </option>

                  <option value="vip">
                    VIP
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Orders
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Spent
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Joined
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Order
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={
                        customer._id ||
                        customer.id
                      }
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {customer.name
                              ?.split(" ")
                              .map(
                                (n) =>
                                  n[0]
                              )
                              .join("")
                              .toUpperCase()
                              .slice(
                                0,
                                2
                              ) ||
                              "??"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {customer.name ||
                                "Unknown"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {customer.email ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            customer.status ||
                            "new"
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {formatNumber(
                            customer.totalOrders ??
                              customer.orderCount ??
                              0
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatMoney(
                            customer.totalSpent
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {formatDate(
                            customer.createdAt
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="h-3.5 w-3.5" />

                          {formatDate(
                            customer.lastOrderDate ||
                              customer.lastActive
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-slate-300" />

              <p className="text-sm text-slate-500">
                No customers found matching your filters.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredCustomers.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {customers.length}
              </span>{" "}
              customers
            </p>
          </div>
        </div>

        {/* =================================================
            NEW CUSTOMERS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              Customer Growth
            </h3>

            <p className="text-sm text-slate-500">
              New customer registrations
            </p>
          </div>

          {newCustomersToday ||
          newCustomersWeek ||
          newCustomersMonth ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Today
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {formatNumber(
                    newCustomersToday
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  This Week
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {formatNumber(
                    newCustomersWeek
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  This Month
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {formatNumber(
                    newCustomersMonth
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              No new customer registrations yet.
            </p>
          )}
        </div>

        {/* =================================================
            BUSINESS INSIGHTS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              Business Insights
            </h3>

            <p className="text-sm text-slate-500">
              Automatic insights from your store data
            </p>
          </div>

          {insights.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {insights.map(
                (insight, index) => {
                  const type =
                    insight.type ||
                    "info";

                  const boxClass =
                    type === "positive"
                      ? "border-green-200 bg-green-50"
                      : type === "negative"
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50";

                  return (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${boxClass}`}
                    >
                      <h4 className="font-semibold text-slate-800">
                        {insight.title ||
                          "Insight"}
                      </h4>

                      <p className="mt-1 text-sm text-slate-600">
                        {insight.message ||
                          ""}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm text-slate-500">
                No business insights available yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}