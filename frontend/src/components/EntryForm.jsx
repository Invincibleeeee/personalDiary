import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Hash } from 'lucide-react';

const EntryForm = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        tags: entry.tags || [],
      });
    }
  }, [entry]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 3) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      await onSave({
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      setErrors({ submit: 'Failed to save entry. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#ECFAE5] rounded-lg w-full max-w-2xl h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-[#CAE8BD] px-6 py-4 border-b border-[#B0DB9C] flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-[#2d5a27]">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#2d5a27] hover:bg-[#B0DB9C] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#2d5a27] mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your entry a title..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] bg-white text-[#2d5a27] ${
                  errors.title ? 'border-red-300' : 'border-[#CAE8BD]'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-[#2d5a27] opacity-60">
                {formData.title.length}/100 characters
              </p>
            </div>

{/* Content Field */}
<div className="flex-1 flex flex-col min-h-0">
  <label htmlFor="content" className="block text-sm font-medium text-[#2d5a27] mb-2">
    Content *
  </label>
  <textarea
    id="content"
    name="content"
    value={formData.content}
    onChange={handleChange}
    placeholder="Write your thoughts here..."
    className={`flex-1 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] bg-white text-[#2d5a27] resize-none min-h-[200px] ${
      errors.content ? 'border-red-300' : 'border-[#CAE8BD]'
    }`}
    maxLength={5000}
  />
  {errors.content && (
    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
  )}
  <div className="mt-1 flex justify-between text-xs text-[#2d5a27] opacity-60">
    <span>{formData.content.length}/5000 characters</span>
    <span>
      {
        formData.content
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      } words
    </span>
  </div>
</div>


            {/* Tags Field */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-[#2d5a27] mb-2">
                Tags (optional, max 3)
              </label>
              
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#B0DB9C] text-[#2d5a27]"
                    >
                      <Hash size={12} className="mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-[#2d5a27] hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              {formData.tags.length < 3 && (
                <div className="flex">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d5a27] opacity-60 w-4 h-4" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyPress}
                      placeholder="Add a tag..."
                      className="w-full pl-10 pr-4 py-2 border border-[#CAE8BD] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#B0DB9C] bg-white text-[#2d5a27]"
                      maxLength={20}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 3}
                    className="px-4 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-r-lg hover:bg-[#9cc985] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              )}
              
              <p className="mt-2 text-xs text-[#2d5a27] opacity-60">
                Press Enter or click Add to add tags. Use Backspace to remove the last tag.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#DDF6D2] px-6 py-4 border-t border-[#CAE8BD] flex justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 text-[#2d5a27] border border-[#CAE8BD] rounded-lg hover:bg-[#ECFAE5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-[#B0DB9C] text-[#2d5a27] rounded-lg hover:bg-[#9cc985] transition-colors disabled:opacity-50 font-medium"
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving...' : (entry ? 'Update' : 'Save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;

// // Demo component to show the form in action
// const Demo = () => {
//   const [showForm, setShowForm] = useState(true);

//   const handleSave = (data) => {
//     console.log('Saving entry:', data);
//     // Simulate async save
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         alert(`Saved entry: "${data.title}"`);
//         setShowForm(false);
//         resolve();
//       }, 1000);
//     });
//   };

//   const handleClose = () => {
//     setShowForm(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">Entry Form Demo</h1>
        
//         {!showForm && (
//           <button 
//             onClick={() => setShowForm(true)}
//             className="bg-[#B0DB9C] text-[#2d5a27] px-6 py-2 rounded-lg hover:bg-[#9cc985] transition-colors"
//           >
//             Open Form
//           </button>
//         )}

//         {showForm && (
//           <EntryForm
//             entry={null}
//             onSave={handleSave}
//             onClose={handleClose}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Demo;