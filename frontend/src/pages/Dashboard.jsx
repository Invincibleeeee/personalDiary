import React, { useState, useEffect } from 'react';
import { Search, Plus, LogOut, User, Calendar } from 'lucide-react';
import EntryCard from '../components/EntryCard';
import EntryForm from '../components/EntryForm';
import LogoutButton from '../components/LogoutButton';
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const API_BASE = 'https://personaldiary-emt4.onrender.com/api';

  const getToken = () => localStorage.getItem('token');

  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }

    return response.json();
  };

  const fetchUser = async () => {
    try {
      const userData = await apiCall('/me');
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      
      // Add date filter if selected
      if (selectedDate) {
        params.append("date", selectedDate);
        // Send timezone offset to backend (in minutes)
        const timezoneOffset = new Date().getTimezoneOffset();
        params.append("timezoneOffset", timezoneOffset.toString());
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/entries?${queryString}` : '/entries';
      
      
      const data = await apiCall(endpoint);
      
      // Filter entries by search term on the frontend
      let filteredEntries = data || [];
      
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      
      setEntries(filteredEntries);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setEntries([]);
    }
  };

  const createEntry = async (entryData) => {
    try {
      const newEntry = await apiCall('/entries', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });
      setEntries([newEntry, ...entries]);
      setShowForm(false);
      // Refresh entries to ensure proper filtering
      setTimeout(() => fetchEntries(), 100);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const updateEntry = async (entryData) => {
    try {
      const updatedEntry = await apiCall(`/entries/${editingEntry._id}`, {
        method: 'PUT',
        body: JSON.stringify(entryData),
      });
      setEntries(entries.map(entry => 
        entry._id === editingEntry._id ? updatedEntry : entry
      ));
      setEditingEntry(null);
      setShowForm(false);
      // Refresh entries to ensure proper filtering
      setTimeout(() => fetchEntries(), 100);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await apiCall(`/entries/${entryId}`, {
        method: 'DELETE',
      });
      setEntries(entries.filter(entry => entry._id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
  };

  // Initial load
  useEffect(() => {
    const initDashboard = async () => {
      await Promise.all([fetchUser(), fetchEntries()]);
      setLoading(false);
    };
    initDashboard();
  }, []);

  // Handle search and date filter changes with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchEntries();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECFAE5] flex items-center justify-center">
        <div className="text-[#2d5a27] text-xl">Loading your journal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECFAE5]">
      <header className="bg-[#CAE8BD] shadow-sm border-b border-[#B0DB9C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#2d5a27]">My Journal</h1>
              {user && (
                <div className="flex items-center space-x-2 text-[#2d5a27]">
                  <User size={20} />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/calendar"
                className="flex items-center space-x-2 px-4 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition"
              >
                <Calendar size={18} />
                <span>Calendar View</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#DDF6D2] rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d5a27] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#CAE8BD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] bg-white text-[#2d5a27]"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d5a27] w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#CAE8BD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] bg-white text-[#2d5a27]"
                />
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors font-medium"
            >
              <Plus size={20} />
              <span>New Entry</span>
            </button>
          </div>

          {(searchTerm || selectedDate) && (
            <div className="mt-4 pt-4 border-t border-[#CAE8BD]">
              <div className="flex items-center justify-between">
                <div className="text-[#2d5a27] text-sm">
                  <span>Showing {entries.length} entries</span>
                  {searchTerm && (
                    <span className="ml-2 px-2 py-1 bg-[#B0DB9C] rounded text-xs">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedDate && (
                    <span className="ml-2 px-2 py-1 bg-[#B0DB9C] rounded text-xs">
                      Date: {selectedDate}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[#2d5a27] text-sm hover:underline px-2 py-1 rounded hover:bg-[#CAE8BD]"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {entries.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={deleteEntry}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-[#2d5a27] text-lg mb-4">
              {searchTerm || selectedDate ? 
                'No entries found matching your criteria' : 
                'No journal entries yet'
              }
            </div>
            {searchTerm || selectedDate ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors font-medium mr-4"
              >
                Clear filters
              </button>
            ) : null}
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors font-medium"
            >
              Create your first entry
            </button>
          </div>
        )}
      </main>

      {showForm && (
        <EntryForm
          entry={editingEntry}
          onSave={editingEntry ? updateEntry : createEntry}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default Dashboard;