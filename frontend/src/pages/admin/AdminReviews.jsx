import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
} from "lucide-react";
import { getAllReviews, updateReviewStatus } from "../../api/reviews";

const statusColors = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllReviews();
      
      // Extract array whether returned directly or nested (res.reviews, res.data, etc.)
      const reviewsArray = Array.isArray(res)
        ? res
        : res?.reviews || res?.data?.reviews || res?.data || [];

      if (!Array.isArray(reviewsArray)) {
        throw new Error("Invalid response format from server");
      }
      
      setReviews(reviewsArray);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError(err.message || "Failed to load reviews from server");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (reviewId, newStatus) => {
    setUpdatingId(reviewId);
    try {
      await updateReviewStatus(reviewId, newStatus);
      // Only update UI AFTER successful API response
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId || r.id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      (r.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.product?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.status === "approved").length,
    pending: reviews.filter((r) => r.status === "pending").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Reviews Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer reviews from MongoDB</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Pending", value: stats.pending, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600 bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button onClick={fetchReviews} className="text-xs text-red-600 font-medium mt-1 hover:underline">
                Click to retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {error ? "Failed to load reviews" : "No reviews found"}
            </p>
            {!error && <p className="text-xs text-slate-400 mt-1">Reviews will appear here when customers submit them</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((review, index) => (
              <motion.div
                key={review._id || review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{review.user?.name || "Unknown"}</span>
                      <span className="text-xs text-slate-400">on</span>
                      <span className="text-sm font-medium text-blue-600">{review.product?.name || "Unknown Product"}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">{review.comment || "No comment"}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[review.status] || statusColors.pending}`}>
                      {review.status || "pending"}
                    </span>
                    <div className="flex gap-1">
                      {["approved", "pending", "rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(review._id || review.id, status)}
                          disabled={updatingId === (review._id || review.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            review.status === status
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } disabled:opacity-50`}
                        >
                          {updatingId === (review._id || review.id) ? "..." : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}