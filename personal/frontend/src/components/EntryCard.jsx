import React, { useState } from 'react';
import { Edit2, Trash2, Tag, Calendar, MoreHorizontal, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const EntryCard = ({ entry, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate content for preview
  const truncateContent = (content, limit = 150) => {
    if (content.length <= limit) return content;
    return content.substring(0, limit) + '...';
  };

  // Handle delete confirmation
  const handleDelete = () => {
    onDelete(entry._id);
    setShowDeleteConfirm(false);
  };

  // Export single entry as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(entry.title, 10, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${formatDate(entry.createdAt)}`, 10, 30);

    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(entry.content, 10, 40, { maxWidth: 180 });

    if (entry.tags?.length) {
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Tags: ${entry.tags.join(', ')}`, 10, doc.lastAutoTable?.finalY || 260);
    }

    doc.save(`${entry.title.replace(/\s+/g, '_') || 'entry'}.pdf`);
  };

  return (
    <div className="bg-[#DDF6D2] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-[#CAE8BD] overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-[#CAE8BD] bg-[#CAE8BD]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#2d5a27] truncate">
              {entry.title}
            </h3>
            <div className="flex items-center mt-1 text-sm text-[#2d5a27] opacity-75">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(entry.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-3">
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 text-[#2d5a27] hover:bg-[#B0DB9C] rounded-full transition-colors"
              title="Edit entry"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-[#2d5a27] hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              title="Delete entry"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-[#2d5a27] leading-relaxed whitespace-pre-wrap">
            {isExpanded ? entry.content : truncateContent(entry.content)}
          </p>

          {/* Expand/Collapse Button */}
          {entry.content.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-[#2d5a27] text-sm hover:underline font-medium"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <Tag size={14} className="text-[#2d5a27] opacity-75" />
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#B0DB9C] text-[#2d5a27]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          className="mt-2 inline-flex items-center space-x-1 text-sm text-[#2d5a27] hover:underline"
        >
          <Download size={14} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#2d5a27] mb-2">
                Delete Entry
              </h3>
              <p className="text-[#2d5a27] opacity-75">
                Are you sure you want to delete "{entry.title}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#2d5a27] border border-[#CAE8BD] rounded-lg hover:bg-[#ECFAE5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryCard;
