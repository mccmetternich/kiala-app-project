'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  X,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  uploadedAt: Date | string;
  dimensions?: { width: number; height: number };
  alt?: string;
  tags: string[];
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
  multiple?: boolean;
  siteId: string;
  initialFilter?: 'all' | 'image' | 'video' | 'audio' | 'document';
}

const fileIcons = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText
};

export default function MediaLibrary({ isOpen, onClose, onSelect, multiple = false, siteId, initialFilter = 'all' }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>(initialFilter);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reset filter when modal opens with new initialFilter
  useEffect(() => {
    if (isOpen) {
      setTypeFilter(initialFilter);
    }
  }, [isOpen, initialFilter]);

  // Fetch media files from API
  useEffect(() => {
    if (isOpen && siteId) {
      fetchMedia();
    }
  }, [isOpen, siteId, typeFilter]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const typeParam = typeFilter !== 'all' ? `&type=${typeFilter}` : '';
      const response = await fetch(`/api/media?siteId=${siteId}${typeParam}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (fileId: string) => {
    if (multiple) {
      setSelectedFiles(prev =>
        prev.includes(fileId)
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      const file = files.find(f => f.id === fileId);
      if (file && onSelect) {
        onSelect(file);
        onClose();
      }
    }
  };

  const handleBulkSelect = () => {
    if (onSelect && selectedFiles.length > 0) {
      const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id));
      if (multiple) {
        selectedFileObjects.forEach(onSelect);
      } else {
        onSelect(selectedFileObjects[0]);
      }
      onClose();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || !siteId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(uploadedFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('siteId', siteId);

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
      }

      // Refresh the file list
      await fetchMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/media?id=${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
            <p className="text-gray-600 mt-1">
              {onSelect ? 'Select media files for your content' : 'Manage your media files'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="btn-primary flex items-center gap-2 cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Files'}
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="document">Documents</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <span className="text-sm font-medium text-primary-700">
                {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkSelect}
                  className="btn-primary text-sm py-1 px-3"
                >
                  Use Selected
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File List/Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-3 text-gray-600">Loading media...</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const Icon = fileIcons[file.type];
                const isSelected = selectedFiles.includes(file.id);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`group relative bg-white border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection checkbox */}
                    {multiple && (
                      <div className="absolute top-2 right-2 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    {/* File preview */}
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>

                    {/* File info */}
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                        <Badge variant="default" size="sm" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
                      {file.dimensions && (
                        <p className="text-xs text-gray-500 mt-1">
                          {file.dimensions.width} x {file.dimensions.height}
                        </p>
                      )}
                    </div>

                    {/* Actions overlay */}
                    <div
                      className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
                      onClick={() => handleFileSelect(file.id)}
                    >
                      {/* Select button - most prominent */}
                      {onSelect && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFileSelect(file.id); }}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors mb-2"
                        >
                          Select
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(file.url); }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                          title="View full size"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(file.id, e)}
                          className="p-2 bg-red-500/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/70 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const Icon = fileIcons[file.type];
                const isSelected = selectedFiles.includes(file.id);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      isSelected ? 'bg-primary-50 border border-primary-200' : 'border border-transparent'
                    }`}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFileSelect(file.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.alt || file.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                        <Badge variant="default" size="sm">{file.type}</Badge>
                        {file.dimensions && (
                          <span className="text-sm text-gray-500">
                            {file.dimensions.width} x {file.dimensions.height}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{formatDate(new Date(file.uploadedAt))}</span>
                      </div>
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.map((tag, index) => (
                            <Badge key={index} variant="default" size="sm" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(file.url); }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(file.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || typeFilter !== 'all' ? 'No files found' : 'No files uploaded yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first files to get started'
                }
              </p>
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Files
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        {onSelect && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {multiple ? 'Select multiple files and click "Use Selected"' : 'Click on a file to select it'}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>

                {multiple && selectedFiles.length > 0 && (
                  <button
                    onClick={handleBulkSelect}
                    className="btn-primary"
                  >
                    Use {selectedFiles.length} Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
