import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, Edit3, Trash2, Save, X, Plus, Tag } from "lucide-react";

export default function CalendarPage() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/entries", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (Array.isArray(res.data)) setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEntry) return;
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/entries/${selectedEntry._id}`,
        {
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIsEditing(false);
      setSelectedEntry(null);
      fetchEntries();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      setSelectedEntry(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

const handleCreate = async () => {
  setLoading(true);
  try {
    // Merge selected date with current time
    const withTime = new Date(selectedDate);
    const now = new Date();
    withTime.setHours(now.getHours());
    withTime.setMinutes(now.getMinutes());
    withTime.setSeconds(now.getSeconds());
    withTime.setMilliseconds(now.getMilliseconds());

    const res = await axios.post(
      "http://localhost:5000/api/entries",
      {
        ...formData,
        createdAt: withTime, // ✅ Date + Current Time
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    setEntries((prev) => [...prev, res.data]);
    setShowCreateForm(false);
    setFormData({ title: "", content: "", tags: "" });
  } catch (err) {
    console.error("Create failed:", err);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchEntries();
  }, []);

  const getEntriesForDate = (date) => {
    return entries.filter(
      (entry) => new Date(entry.createdAt).toDateString() === date.toDateString()
    );
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setFormData({
      title: entry.title,
      content: entry.content,
      tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : entry.tags || "",
    });
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (selectedEntry) {
      setFormData({
        title: selectedEntry.title,
        content: selectedEntry.content,
        tags: Array.isArray(selectedEntry.tags) ? selectedEntry.tags.join(", ") : selectedEntry.tags || "",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const entriesForSelectedDate = getEntriesForDate(selectedDate);


  return (
    <div className="flex h-screen bg-gradient-to-br from-[#ECFAE5] to-[#DDF6D2] text-[#2d5a27] overflow-hidden">
      {/* Sidebar Calendar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-[#B0DB9C]/30 shadow-xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#CAE8BD] to-[#B0DB9C] shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-[#2d5a27]" />
            <h1 className="text-2xl font-bold text-[#2d5a27]">My Journal</h1>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-lg border border-[#B0DB9C]/20 p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#2d5a27] mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 15 + i);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const hasEntries = getEntriesForDate(date).length > 0;
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square text-sm rounded-lg font-medium transition-all duration-300 relative
                      ${isSelected 
                        ? 'bg-[#B0DB9C] text-white shadow-lg scale-110' 
                        : isToday 
                        ? 'bg-[#CAE8BD] text-[#2d5a27] shadow-sm' 
                        : 'hover:bg-[#DDF6D2] text-[#2d5a27]'
                      }
                    `}
                  >
                    {date.getDate()}
                    {hasEntries && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2d5a27] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-[#DDF6D2] to-[#CAE8BD] rounded-xl p-4 shadow-lg">
            <div className="text-sm font-semibold text-[#2d5a27] mb-2">Quick Stats</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#2d5a27]/70">Total Entries</span>
                <span className="font-bold text-[#2d5a27]">{entries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#2d5a27]/70">This Month</span>
                <span className="font-bold text-[#2d5a27]">
                  {entries.filter(e => {
  const created = new Date(e.createdAt);
  const now = new Date();
  return (
    created.getMonth() === now.getMonth() &&
    created.getFullYear() === now.getFullYear()
  );
}).length}

                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#B0DB9C]/30 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2d5a27]">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <p className="text-[#2d5a27]/70 mt-1">
                {entriesForSelectedDate.length} entries found
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-[#B0DB9C] hover:bg-[#9cc985] text-[#2d5a27] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Entries List */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-[#B0DB9C] border-t-transparent rounded-full"></div>
              </div>
            ) : entriesForSelectedDate.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-[#B0DB9C] mx-auto mb-4" />
                <p className="text-[#2d5a27]/70 text-lg">No entries for this date</p>
                <p className="text-[#2d5a27]/50 text-sm mt-2">Create your first entry to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entriesForSelectedDate.map((entry, index) => (
                  <div
                    key={entry._id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`
                      group cursor-pointer bg-white rounded-xl border transition-all duration-500 transform hover:scale-102
                      ${selectedEntry?._id === entry._id 
                        ? 'border-[#B0DB9C] shadow-xl shadow-[#B0DB9C]/20 ring-2 ring-[#B0DB9C]/20' 
                        : 'border-[#B0DB9C]/20 hover:border-[#B0DB9C]/40 hover:shadow-lg'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-[#2d5a27] group-hover:text-[#1f4722] transition-colors line-clamp-1">
                          {entry.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-[#2d5a27]/70 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {entry.content}
                      </p>
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-[#DDF6D2] text-[#2d5a27] text-xs font-medium rounded-full"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
<div className="flex items-center justify-between text-xs text-[#2d5a27]/50">
  <div className="flex items-center gap-4">
<span className="flex items-center gap-1">
  <Clock className="w-3 h-3" />
  Created {formatDateTime(entry.createdAt)} {/* ✅ Use full date-time */}
</span>

{entry.updatedAt !== entry.createdAt && (
  <span className="flex items-center gap-1">
    <Edit3 className="w-3 h-3" />
    Updated {formatDateTime(entry.updatedAt)} {/* ✅ Full date-time */}
  </span>
)}
  </div>
</div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entry Detail/Edit Panel */}
          <div className="w-1/2 border-l border-[#B0DB9C]/30 bg-white/40 backdrop-blur-sm">
            {selectedEntry ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-[#B0DB9C]/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#2d5a27]">
                      {isEditing ? 'Edit Entry' : 'Entry Details'}
                    </h3>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-2 bg-[#CAE8BD] hover:bg-[#B0DB9C] text-[#2d5a27] px-4 py-2 rounded-lg transition-all duration-300"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#B0DB9C] hover:bg-[#9cc985] text-[#2d5a27] px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2d5a27]">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300"
                          placeholder="Enter title..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2d5a27]">Content</label>
                        <textarea
                          rows="8"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300 resize-none"
                          placeholder="Write your thoughts..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2d5a27]">Tags</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300"
                          placeholder="work, personal, ideas (comma separated)"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-2xl font-bold text-[#2d5a27] mb-4">{selectedEntry.title}</h4>
                        <div className="prose prose-lg text-[#2d5a27]/80 leading-relaxed whitespace-pre-wrap">
                          {selectedEntry.content}
                        </div>
                      </div>
                      
                      {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#2d5a27] mb-3">Tags</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedEntry.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#DDF6D2] text-[#2d5a27] text-sm font-medium rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-6 border-t border-[#B0DB9C]/20">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-[#2d5a27] block mb-1">Created</span>
                            <span className="text-[#2d5a27]/70">
                              {new Date(selectedEntry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2d5a27] block mb-1">Last Updated</span>
                            <span className="text-[#2d5a27]/70">
                              {new Date(selectedEntry.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Edit3 className="w-16 h-16 text-[#B0DB9C] mx-auto mb-4" />
                  <p className="text-[#2d5a27]/70 text-lg">Select an entry to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Entry Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-6 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2d5a27]">Create New Entry</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ title: "", content: "", tags: "" });
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#2d5a27]">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300"
                  placeholder="Enter title..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#2d5a27]">Content</label>
                <textarea
                  rows="8"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Write your thoughts..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#2d5a27]">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-[#CAE8BD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] focus:border-transparent transition-all duration-300"
                  placeholder="work, personal, ideas (comma separated)"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreate}
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#B0DB9C] hover:bg-[#9cc985] text-[#2d5a27] font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Entry'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ title: "", content: "", tags: "" });
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}