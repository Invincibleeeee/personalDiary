import React, { useState, useEffect } from 'react';
import { Search, Plus, LogOut, User, Calendar } from 'lucide-react';
import EntryCard from '../components/EntryCard';
import EntryForm from '../components/EntryForm';

import { Link } from "react-router-dom";





const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);


  const API_BASE = 'http://localhost:5000/api';

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // API call helper
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

  // Fetch user info
  const fetchUser = async () => {
    try {
      const userData = await apiCall('/me');
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Fetch entries with search/filter
  const fetchEntries = async () => {
    try {
      let url = '/entries';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDate) params.append('date', selectedDate);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const entriesData = await apiCall(url);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Create new entry
  const createEntry = async (entryData) => {
    try {
      const newEntry = await apiCall('/entries', {
        method: 'POST',
        body: JSON.stringify(entryData),
      });
      setEntries([newEntry, ...entries]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  // Update entry
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
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  // Delete entry
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

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Handle edit
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingEntry(null);
  };


  
  // Effects
  useEffect(() => {
    const initDashboard = async () => {
      await Promise.all([fetchUser(), fetchEntries()]);
      setLoading(false);
    };
    initDashboard();
  }, []);

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
      {/* Header */}
<header className="bg-[#CAE8BD] shadow-sm border-b border-[#B0DB9C]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex items-center justify-between">
      
      {/* Left Side - Title and User */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-[#2d5a27]">My Journal</h1>
        {user && (
          <div className="flex items-center space-x-2 text-[#2d5a27]">
            <User size={20} />
            <span className="text-sm">{user.username}</span>
          </div>
        )}
      </div>

      {/* Right Side - Calendar Link and Logout */}
      <div className="flex items-center space-x-3">
        <Link
          to="/calendar"
          className="flex items-center space-x-2 px-4 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors"
        >
          <Calendar size={18} />
          <span>Calendar View</span>
        </Link>

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-[#DDF6D2] rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d5a27] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your entries..."
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
            
            {/* New Entry Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors font-medium"
            >
              <Plus size={20} />
              <span>New Entry</span>
            </button>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedDate) && (
            <div className="mt-4 pt-4 border-t border-[#CAE8BD]">
              <div className="flex items-center justify-between">
                <span className="text-[#2d5a27] text-sm">
                  Showing {entries.length} entries
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDate('');
                  }}
                  className="text-[#2d5a27] text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        

        {/* Entries Grid */}
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
              {searchTerm || selectedDate ? 'No entries found matching your criteria' : 'No journal entries yet'}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors font-medium"
            >
              Create your first entry
            </button>
          </div>
        )}
      </main>

      {/* Entry Form Modal */}
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