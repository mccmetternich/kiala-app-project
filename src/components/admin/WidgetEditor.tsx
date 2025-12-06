'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Settings,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  X,
  Upload,
  Type
} from 'lucide-react';
import { Widget, WidgetConfig, WidgetType } from '@/types';
import Badge from '@/components/ui/Badge';
import MediaLibrary from '@/components/admin/MediaLibrary';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { WIDGET_TYPES, CATEGORY_COLORS, getWidgetByType, getWidgetDisplayName } from '@/lib/widget-library';

interface WidgetEditorProps {
  widgets: Widget[];
  onWidgetsChange: (widgets: Widget[]) => void;
  previewMode?: boolean;
  siteId: string;
  articleId?: string;
}

// Widget types and category colors now imported from centralized library
const widgetTypes = WIDGET_TYPES;
const categoryColors = CATEGORY_COLORS;

// Pricing Options Editor - moved outside main component to prevent re-renders
const PricingOptionsEditor = ({ options, onChange }: { options: any[]; onChange: (options: any[]) => void }) => {
  const addOption = () => {
    const newOption = {
      id: `option-${Date.now()}`,
      label: 'Buy 1 Get 1 FREE',
      quantity: 1,
      price: 97,
      originalPrice: 167,
      perUnit: 97,
      savings: 'Save $70',
      popular: false,
      gifts: [],
      url: ''
    };
    onChange([...options, newOption]);
  };

  const updateOption = (index: number, field: string, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const addGift = (optionIndex: number) => {
    const updated = [...options];
    updated[optionIndex].gifts = [...(updated[optionIndex].gifts || []), { name: 'Free Gift', value: '$10.00' }];
    onChange(updated);
  };

  const updateGift = (optionIndex: number, giftIndex: number, field: string, value: string) => {
    const updated = [...options];
    updated[optionIndex].gifts[giftIndex] = { ...updated[optionIndex].gifts[giftIndex], [field]: value };
    onChange(updated);
  };

  const removeGift = (optionIndex: number, giftIndex: number) => {
    const updated = [...options];
    updated[optionIndex].gifts = updated[optionIndex].gifts.filter((_: any, i: number) => i !== giftIndex);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={option.id || index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          {/* Package Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-purple-900">Package {index + 1}</span>
              {option.popular && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Most Popular</span>
              )}
            </div>
            <button type="button" onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Package Title */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Package Title</label>
            <input
              type="text"
              value={option.label || ''}
              onChange={(e) => updateOption(index, 'label', e.target.value)}
              placeholder="e.g., Buy 1 Get 1 FREE"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price ($)</label>
              <input
                type="number"
                step="any"
                value={option.price === 0 || option.price ? option.price : ''}
                onChange={(e) => updateOption(index, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="97.00"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Original Price ($)</label>
              <input
                type="number"
                step="any"
                value={option.originalPrice === 0 || option.originalPrice ? option.originalPrice : ''}
                onChange={(e) => updateOption(index, 'originalPrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="167.00"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Savings Badge - Auto-calculated */}
          <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-700">Savings Badge (auto-calculated)</span>
              <span className="text-sm font-bold text-green-700">
                Save ${((option.originalPrice || 0) - (option.price || 0) +
                  ((option.gifts || []).reduce((sum: number, gift: any) => {
                    const value = parseFloat((gift.value || '').replace(/[^0-9.]/g, '')) || 0;
                    return sum + value;
                  }, 0))
                )}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">= (Original - Sale) + Gift Values</p>
          </div>

          {/* Badge Text */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Badge Text (optional)</label>
            <input
              type="text"
              value={option.badge || ''}
              onChange={(e) => updateOption(index, 'badge', e.target.value)}
              placeholder="e.g., MOST POPULAR, BEST VALUE, BEST RESULTS"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no badge. Shows as a ribbon on the package.</p>
          </div>

          {/* Package-specific Checkout URL */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Checkout URL (optional)</label>
            <input
              type="url"
              value={option.url || ''}
              onChange={(e) => updateOption(index, 'url', e.target.value)}
              placeholder="https://checkout.example.com/package-1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use the default CTA URL. Meta tracking params are appended automatically.</p>
          </div>

          {/* Free Gifts Section */}
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Free Gifts (optional)</label>
              <button type="button" onClick={() => addGift(index)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                + Add Gift
              </button>
            </div>
            {(option.gifts || []).length === 0 && (
              <p className="text-xs text-gray-400 italic">No gifts added yet</p>
            )}
            {(option.gifts || []).map((gift: any, giftIndex: number) => (
              <div key={giftIndex} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Gift Name</label>
                  <input
                    type="text"
                    value={gift.name || ''}
                    onChange={(e) => updateGift(index, giftIndex, 'name', e.target.value)}
                    placeholder="e.g., Free Recipe Book"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900 bg-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Value</label>
                  <input
                    type="text"
                    value={gift.value || ''}
                    onChange={(e) => updateGift(index, giftIndex, 'value', e.target.value)}
                    placeholder="$19.99"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900 bg-white"
                  />
                </div>
                <button type="button" onClick={() => removeGift(index, giftIndex)} className="text-red-500 hover:text-red-700 pb-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 text-sm font-medium text-purple-600"
      >
        <Plus className="w-4 h-4" />
        Add Pricing Package
      </button>
    </div>
  );
};

export default function WidgetEditor({ widgets, onWidgetsChange, previewMode = false, siteId, articleId }: WidgetEditorProps) {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetPalette, setShowWidgetPalette] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      position: widgets.length,
      enabled: true,
      config: getDefaultConfig(type)
    };

    onWidgetsChange([...widgets, newWidget]);
    setSelectedWidget(newWidget.id);
    setShowWidgetPalette(false);
  };

  const updateWidget = (id: string, config: Partial<WidgetConfig>) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const deleteWidget = (id: string) => {
    const filteredWidgets = widgets.filter(widget => widget.id !== id);
    onWidgetsChange(filteredWidgets);
    setSelectedWidget(null);
  };

  const duplicateWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    const duplicatedWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}`,
      position: widgets.length
    };

    onWidgetsChange([...widgets, duplicatedWidget]);
  };

  const toggleWidgetEnabled = (id: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const currentIndex = widgets.findIndex(w => w.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;

    const newWidgets = [...widgets];
    [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];

    // Update positions
    newWidgets.forEach((widget, index) => {
      widget.position = index;
    });

    onWidgetsChange(newWidgets);
  };

  // Drag and drop handlers for widget reordering
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedWidget) {
      const dragIndex = widgets.findIndex(w => w.id === draggedWidget);
      if (dragIndex === -1 || dragIndex === dropIndex) {
        setDraggedWidget(null);
        setDragOverIndex(null);
        return;
      }

      const newWidgets = [...widgets];
      const [removed] = newWidgets.splice(dragIndex, 1);
      newWidgets.splice(dropIndex, 0, removed);

      // Update positions
      newWidgets.forEach((widget, index) => {
        widget.position = index;
      });

      onWidgetsChange(newWidgets);
    }

    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  // Drag from palette to widget list
  const handlePaletteDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handlePaletteDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widgetType') as WidgetType;

    if (widgetType) {
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type: widgetType,
        position: index,
        enabled: true,
        config: getDefaultConfig(widgetType)
      };

      const newWidgets = [...widgets];
      newWidgets.splice(index, 0, newWidget);

      // Update positions
      newWidgets.forEach((widget, idx) => {
        widget.position = idx;
      });

      onWidgetsChange(newWidgets);
      setSelectedWidget(newWidget.id);
    }

    setDragOverIndex(null);
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        {widgets
          .filter(w => w.enabled)
          .sort((a, b) => a.position - b.position)
          .map(widget => (
            <WidgetPreview key={widget.id} widget={widget} />
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Widget Palette Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Page Content</h3>
        <button
          onClick={() => setShowWidgetPalette(!showWidgetPalette)}
          className="btn-primary text-sm"
        >
          + Add Widget
        </button>
      </div>

      {/* Widget Palette - Draggable */}
      {showWidgetPalette && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Widget Library</h4>
            <p className="text-sm text-gray-500">Click to add or drag to position</p>
          </div>

          {/* Group by category */}
          {['Content', 'Social Proof', 'Commerce', 'Lead Gen'].map(category => (
            <div key={category} className="mb-6">
              <h5 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[category]}`}>{category}</span>
              </h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {widgetTypes.filter(w => w.category === category).map((widgetType) => (
                  <button
                    key={widgetType.type}
                    onClick={() => addWidget(widgetType.type as WidgetType)}
                    draggable
                    onDragStart={(e) => handlePaletteDragStart(e, widgetType.type as WidgetType)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <widgetType.icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm truncate">{widgetType.name}</h5>
                        <p className="text-xs text-gray-500 truncate">{widgetType.description}</p>
                      </div>
                      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowWidgetPalette(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Close Library
            </button>
          </div>
        </div>
      )}

      {/* Widget List */}
      <div className="space-y-2">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget, index) => (
            <div
              key={widget.id}
              onDragOver={(e) => {
                handleDragOver(e, index);
                e.preventDefault();
              }}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                if (e.dataTransfer.getData('widgetType')) {
                  handlePaletteDrop(e, index);
                } else {
                  handleDrop(e, index);
                }
              }}
            >
              {/* Drop indicator */}
              {dragOverIndex === index && (
                <div className="h-1 bg-primary-500 rounded-full mb-2 animate-pulse" />
              )}

              <WidgetItem
                widget={widget}
                isSelected={selectedWidget === widget.id}
                isDragging={draggedWidget === widget.id}
                onSelect={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
                onUpdate={(config) => updateWidget(widget.id, config)}
                onDelete={() => deleteWidget(widget.id)}
                onDuplicate={() => duplicateWidget(widget.id)}
                onToggleEnabled={() => toggleWidgetEnabled(widget.id)}
                onMove={(direction) => moveWidget(widget.id, direction)}
                canMoveUp={index > 0}
                canMoveDown={index < widgets.length - 1}
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragEnd={handleDragEnd}
                siteId={siteId}
                articleId={articleId}
                allWidgets={widgets}
              />
            </div>
          ))}

        {/* Drop zone at end */}
        {widgets.length > 0 && (
          <div
            className={`h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
              dragOverIndex === widgets.length ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(widgets.length);
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              if (e.dataTransfer.getData('widgetType')) {
                handlePaletteDrop(e, widgets.length);
              } else {
                handleDrop(e, widgets.length);
              }
            }}
          >
            <span className="text-sm text-gray-400">Drop widget here</span>
          </div>
        )}
      </div>

      {widgets.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverIndex(0);
          }}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            if (e.dataTransfer.getData('widgetType')) {
              handlePaletteDrop(e, 0);
            }
          }}
        >
          <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">No content yet</h4>
          <p className="text-gray-600 mb-4">Add your first widget or drag from the library above</p>
          <button
            onClick={() => setShowWidgetPalette(true)}
            className="btn-primary"
          >
            Open Widget Library
          </button>
        </div>
      )}
    </div>
  );
}

function WidgetItem({
  widget,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleEnabled,
  onMove,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragEnd,
  siteId,
  articleId,
  allWidgets
}: {
  widget: Widget;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onUpdate: (config: Partial<WidgetConfig>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleEnabled: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  siteId: string;
  articleId?: string;
  allWidgets: Widget[];
}) {
  const widgetType = widgetTypes.find(wt => wt.type === widget.type);

  return (
    <div
      className={`bg-white border rounded-lg transition-all ${
        isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'
      } ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <GripVertical className="w-5 h-5" />
            </div>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${widget.enabled ? 'bg-primary-100' : 'bg-gray-100'}`}>
              {widgetType && <widgetType.icon className={`w-4 h-4 ${widget.enabled ? 'text-primary-600' : 'text-gray-400'}`} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${widget.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {/* Show custom label for text-blocks if set, otherwise show widget type name */}
                  {widget.type === 'text-block' && widget.config.label
                    ? widget.config.label
                    : (widgetType?.name || widget.type)}
                </h4>
                {widget.type === 'text-block' && widget.config.label && (
                  <span className="text-xs text-gray-400">(Text Block)</span>
                )}
                {!widget.enabled && (
                  <Badge variant="default" size="sm">Disabled</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate max-w-md">
                {widget.config.headline ||
                  (widget.config.content
                    ? widget.config.content.replace(/<[^>]*>/g, '').substring(0, 60) + (widget.config.content.replace(/<[^>]*>/g, '').length > 60 ? '...' : '')
                    : 'No content set')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onMove('up'); }}
              disabled={!canMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ↑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove('down'); }}
              disabled={!canMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ↓
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleEnabled(); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isSelected && (
        <WidgetConfigPanel
          widget={widget}
          onUpdate={onUpdate}
          siteId={siteId}
          articleId={articleId}
          allWidgets={allWidgets}
        />
      )}
    </div>
  );
}

// Reusable field components - defined outside to prevent re-creation on each render
function TextField({
  label,
  field,
  placeholder,
  value,
  onChange
}: {
  label: string;
  field: string;
  placeholder?: string;
  value: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}

function TextAreaField({
  label,
  field,
  placeholder,
  rows = 4,
  value,
  onChange
}: {
  label: string;
  field: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}

function SelectField({
  label,
  field,
  options,
  value,
  onChange
}: {
  label: string;
  field: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value || options[0]?.value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-gray-900"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function NumberField({
  label,
  field,
  min,
  max,
  placeholder,
  value,
  onChange,
  step = 'any'
}: {
  label: string;
  field: string;
  min?: number;
  max?: number;
  placeholder?: string;
  value: number | string;
  onChange: (field: string, value: number | undefined) => void;
  step?: string | number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(field, e.target.value ? parseFloat(e.target.value) : undefined)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}

function ImageField({
  label,
  field,
  placeholder,
  value,
  onChange,
  onOpenMediaLibrary
}: {
  label: string;
  field: string;
  placeholder?: string;
  value: string;
  onChange: (field: string, value: string) => void;
  onOpenMediaLibrary: (field: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {value && (
          <div className="relative group">
            <img
              src={value}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => onChange(field, '')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenMediaLibrary(field)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {value ? 'Change Image' : 'Select from Library'}
          </button>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder || 'Or paste image URL...'}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
        />
      </div>
    </div>
  );
}

function WidgetConfigPanel({ widget, onUpdate, siteId, articleId, allWidgets }: {
  widget: Widget;
  onUpdate: (config: Partial<WidgetConfig>) => void;
  siteId: string;
  articleId?: string;
  allWidgets: Widget[];
}) {
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<string | null>(null);

  // Helper function to get widget display name
  const getWidgetDisplayName = (w: Widget) => {
    const widgetTypeInfo = widgetTypes.find(wt => wt.type === w.type);
    const typeName = widgetTypeInfo?.name || w.type;
    return typeName;
  };

  // Handler functions for field updates - use useCallback to stabilize references
  const handleFieldChange = useCallback((field: string, value: any) => {
    // Handle nested fields like "testimonial.quote"
    if (field.includes('.')) {
      const parts = field.split('.');
      const rootField = parts[0];
      const nestedField = parts.slice(1).join('.');

      // Get current value of root field or initialize as empty object
      const currentRoot = (widget.config as any)[rootField] || {};

      // Set nested value
      if (parts.length === 2) {
        onUpdate({ [rootField]: { ...currentRoot, [parts[1]]: value } });
      } else if (parts.length === 3) {
        const midField = parts[1];
        const currentMid = currentRoot[midField] || {};
        onUpdate({ [rootField]: { ...currentRoot, [midField]: { ...currentMid, [parts[2]]: value } } });
      }
    } else {
      onUpdate({ [field]: value });
    }
  }, [onUpdate, widget.config]);

  const handleOpenMediaLibrary = useCallback((field: string) => {
    setActiveImageField(field);
    setMediaLibraryOpen(true);
  }, []);

  // Helper to get field value safely
  const getFieldValue = useCallback((field: string, defaultValue: any = '') => {
    // Handle nested fields like "testimonial.quote"
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = widget.config;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return defaultValue;
      }
      return value ?? defaultValue;
    }
    return (widget.config as any)[field] ?? defaultValue;
  }, [widget.config]);

  // Helper render functions - these return JSX directly rather than being function components
  const renderTextField = (label: string, field: string, placeholder?: string) => (
    <TextField
      key={field}
      label={label}
      field={field}
      placeholder={placeholder}
      value={getFieldValue(field, '')}
      onChange={handleFieldChange}
    />
  );

  const renderTextAreaField = (label: string, field: string, placeholder?: string, rows: number = 4) => (
    <TextAreaField
      key={field}
      label={label}
      field={field}
      placeholder={placeholder}
      rows={rows}
      value={getFieldValue(field, '')}
      onChange={handleFieldChange}
    />
  );

  const renderSelectField = (label: string, field: string, options: { value: string; label: string }[]) => (
    <SelectField
      key={field}
      label={label}
      field={field}
      options={options}
      value={getFieldValue(field, options[0]?.value)}
      onChange={handleFieldChange}
    />
  );

  const renderNumberField = (label: string, field: string, min?: number, max?: number, placeholder?: string) => (
    <NumberField
      key={field}
      label={label}
      field={field}
      min={min}
      max={max}
      placeholder={placeholder}
      value={getFieldValue(field, '')}
      onChange={handleFieldChange}
    />
  );

  const renderImageField = (label: string, field: string, placeholder?: string) => (
    <ImageField
      key={field}
      label={label}
      field={field}
      placeholder={placeholder}
      value={getFieldValue(field, '')}
      onChange={handleFieldChange}
      onOpenMediaLibrary={handleOpenMediaLibrary}
    />
  );

  // Reusable CTA Section with external/anchor options
  const renderCtaSection = (ctaTextLabel: string = 'Button Text', ctaTextDefault: string = 'Learn More →', ctaUrlDefault: string = '#') => (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
      {renderTextField(ctaTextLabel, 'ctaText', ctaTextDefault)}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
        <select
          value={widget.config.ctaType || 'external'}
          onChange={(e) => onUpdate({ ctaType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
        >
          <option value="external">Link to URL</option>
          <option value="anchor">Jump to Widget on Page</option>
        </select>
      </div>

      {widget.config.ctaType !== 'anchor' && (
        <>
          {renderTextField('Button URL', 'ctaUrl', ctaUrlDefault)}
          {renderSelectField('Open in', 'target', [
            { value: '_self', label: 'Same tab' },
            { value: '_blank', label: 'New tab' }
          ])}
        </>
      )}

      {widget.config.ctaType === 'anchor' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
          <select
            value={widget.config.anchorWidgetId || ''}
            onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a widget...</option>
            {allWidgets
              .filter((w: Widget) => w.id !== widget.id && w.enabled)
              .sort((a: Widget, b: Widget) => a.position - b.position)
              .map((w: Widget) => (
                <option key={w.id} value={w.id}>
                  {getWidgetDisplayName(w)} (Position {w.position + 1})
                </option>
              ))
            }
          </select>
          <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
        </div>
      )}
    </div>
  );

  // Checkbox field helper
  const renderCheckboxField = (label: string, field: string) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={`${widget.id}-${field}`}
        checked={!!widget.config[field]}
        onChange={(e) => onUpdate({ [field]: e.target.checked })}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
      />
      <label htmlFor={`${widget.id}-${field}`} className="text-sm text-gray-700">{label}</label>
    </div>
  );

  // CTA Type and Target selector (simplified version for use alongside renderTextField)
  const renderCtaTypeAndTarget = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
        <select
          value={widget.config.ctaType || 'external'}
          onChange={(e) => onUpdate({ ctaType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
        >
          <option value="external">Link to URL</option>
          <option value="anchor">Jump to Widget on Page</option>
        </select>
      </div>

      {widget.config.ctaType !== 'anchor' && (
        <>
          {renderTextField('Button URL', 'ctaUrl', '#')}
          {renderSelectField('Open in', 'target', [
            { value: '_self', label: 'Same tab' },
            { value: '_blank', label: 'New tab' }
          ])}
        </>
      )}

      {widget.config.ctaType === 'anchor' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
          <select
            value={widget.config.anchorWidgetId || ''}
            onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a widget...</option>
            {allWidgets
              .filter((w: Widget) => w.id !== widget.id && w.enabled)
              .sort((a: Widget, b: Widget) => a.position - b.position)
              .map((w: Widget) => (
                <option key={w.id} value={w.id}>
                  {getWidgetDisplayName(w)} (Position {w.position + 1})
                </option>
              ))
            }
          </select>
          <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
        </div>
      )}
    </>
  );

  // Multi-image field for carousels/galleries with drag-and-drop
  const ImageGalleryField = ({ label, field }: { label: string; field: string }) => {
    const images: string[] = (widget.config as any)[field] || [];
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addImage = (url: string) => {
      onUpdate({ [field]: [...images, url] });
    };

    const addMultipleImages = (urls: string[]) => {
      onUpdate({ [field]: [...images, ...urls] });
    };

    const removeImage = (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      onUpdate({ [field]: newImages });
    };

    const moveImage = (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= images.length) return;
      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      onUpdate({ [field]: newImages });
    };

    const handleFiles = async (files: FileList) => {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      setUploading(true);
      setUploadProgress(0);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('siteId', siteId);

        try {
          const response = await fetch('/api/media', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.url);
          }
        } catch (error) {
          console.error('Upload failed:', error);
        }

        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }

      if (uploadedUrls.length > 0) {
        addMultipleImages(uploadedUrls);
      }
      setUploading(false);
      setUploadProgress(0);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="space-y-2">
          {images.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-1">Use arrows to reorder. First image = highest priority.</p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, index) => (
                  <div
                    key={url + index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">
                        1st
                      </span>
                    )}
                    {/* Control buttons */}
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded text-white text-xs ${index === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'}`}
                          title="Move left"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === images.length - 1}
                          className={`p-1 rounded text-white text-xs ${index === images.length - 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'}`}
                          title="Move right"
                        >
                          →
                        </button>
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Drag and drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {uploading ? (
              <div className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">Uploading... {uploadProgress}%</span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop images here, or
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageField(field);
                      setMediaLibraryOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    Media Library
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Select multiple files at once
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Benefits List Editor
  const BenefitsListEditor = ({ benefits, onChange }: { benefits: string[]; onChange: (benefits: string[]) => void }) => {
    const addBenefit = () => {
      onChange([...benefits, 'New benefit']);
    };

    const updateBenefit = (index: number, value: string) => {
      const updated = [...benefits];
      updated[index] = value;
      onChange(updated);
    };

    const removeBenefit = (index: number) => {
      onChange(benefits.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-2">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => updateBenefit(index, e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
            />
            <button onClick={() => removeBenefit(index)} className="text-red-500 hover:text-red-700 px-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addBenefit}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Benefit
        </button>
      </div>
    );
  };

  // Handle media selection
  const handleMediaSelect = (file: { url: string }) => {
    if (activeImageField) {
      // Check if it's a nested field like "reviews.0.image" or "stats.1.icon"
      if (activeImageField.includes('.')) {
        const parts = activeImageField.split('.');
        const arrayName = parts[0]; // e.g., "reviews"
        const index = parseInt(parts[1]); // e.g., 0
        const fieldName = parts[2]; // e.g., "image"

        const array = [...((widget.config as any)[arrayName] || [])];
        if (array[index]) {
          array[index] = { ...array[index], [fieldName]: file.url };
          onUpdate({ [arrayName]: array });
        }
      } else {
        const currentValue = (widget.config as any)[activeImageField];

        // Check if it's a gallery field (array)
        if (Array.isArray(currentValue)) {
          onUpdate({ [activeImageField]: [...currentValue, file.url] });
        } else {
          onUpdate({ [activeImageField]: file.url });
        }
      }
    }
    setMediaLibraryOpen(false);
    setActiveImageField(null);
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <h5 className="font-medium text-gray-900 mb-4">Widget Settings</h5>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => {
          setMediaLibraryOpen(false);
          setActiveImageField(null);
        }}
        onSelect={handleMediaSelect}
        siteId={siteId}
        initialFilter="image"
      />

      {/* Text Block */}
      {widget.type === 'text-block' && (
        <div className="space-y-4">
          {/* Internal Label - for admin use only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label (Admin Only)</label>
            <input
              type="text"
              value={widget.config.label || ''}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="e.g., Hero Section, Intro Text, CTA Block..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">This label helps you identify the widget in the list. It won't show on the public site.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <RichTextEditor
              value={widget.config.content || ''}
              onChange={(content) => onUpdate({ content })}
              placeholder="Enter your content here..."
            />
          </div>
        </div>
      )}

      {/* Before/After Slider (Interactive) */}
      {(widget.type === 'before-after' || widget.type === 'before-after-comparison') && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Slider Widget:</strong> Users can drag to compare before/after images interactively.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderImageField('Before Image', 'beforeImage')}
            {renderImageField('After Image', 'afterImage')}
          </div>
          {renderTextField('Name', 'name', 'Sarah M.')}
          <div className="grid grid-cols-2 gap-4">
            {renderTextField('Age', 'age', '52')}
            {renderTextField('Location', 'location', 'Austin, TX')}
          </div>
          {renderTextField('Result', 'result', 'Lost 23 lbs & More Energy Than Ever')}
          {renderTextField('Timeframe', 'timeframe', '12 weeks')}
          {renderTextAreaField('Testimonial', 'testimonial', "I can't believe this is me! After following the protocol...", 3)}

          {/* Editable Stats */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Stats Display</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Lbs Lost Value</label>
                <input
                  type="text"
                  value={widget.config.lbsLost || '23'}
                  onChange={(e) => onUpdate({ lbsLost: e.target.value })}
                  placeholder="23"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Energy Multiplier</label>
                <input
                  type="text"
                  value={widget.config.energyMultiplier || '3x'}
                  onChange={(e) => onUpdate({ energyMultiplier: e.target.value })}
                  placeholder="3x"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weeks</label>
                <input
                  type="text"
                  value={widget.config.weeksValue || '12'}
                  onChange={(e) => onUpdate({ weeksValue: e.target.value })}
                  placeholder="12"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
            {renderTextField('Button Text', 'ctaText', 'Get The Same Results')}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
              <select
                value={widget.config.ctaType || 'external'}
                onChange={(e) => onUpdate({ ctaType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="external">Link to URL</option>
                <option value="anchor">Jump to Widget on Page</option>
              </select>
            </div>

            {widget.config.ctaType !== 'anchor' && (
              <>
                {renderTextField('Button URL', 'ctaUrl', '#')}
                {renderSelectField('Open in', 'target', [
                  { value: '_self', label: 'Same tab' },
                  { value: '_blank', label: 'New tab' }
                ])}
              </>
            )}

            {widget.config.ctaType === 'anchor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                <select
                  value={widget.config.anchorWidgetId || ''}
                  onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a widget...</option>
                  {allWidgets
                    .filter((w: Widget) => w.id !== widget.id && w.enabled)
                    .sort((a: Widget, b: Widget) => a.position - b.position)
                    .map((w: Widget) => (
                      <option key={w.id} value={w.id}>
                        {getWidgetDisplayName(w)} (Position {w.position + 1})
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Before/After Static (Side-by-Side) */}
      {widget.type === 'before-after-side-by-side' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-800">
              <strong>Static Widget:</strong> Shows before/after images side-by-side without interaction.
            </p>
          </div>
          {renderTextField('Headline', 'headline', 'Real Results From Real Women')}
          <div className="grid grid-cols-2 gap-4">
            {renderImageField('Before Image', 'beforeImage')}
            {renderImageField('After Image', 'afterImage')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderTextField('Before Label', 'beforeLabel', 'BEFORE')}
            {renderTextField('After Label', 'afterLabel', 'AFTER')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderTextField('Name', 'name', 'Sarah M.')}
            {renderTextField('Age', 'age', '47')}
          </div>
          {renderTextField('Location', 'location', 'Denver, CO')}
          {renderTextField('Timeframe', 'timeframe', '12 weeks')}
          {renderTextAreaField('Testimonial', 'testimonial', 'Enter their testimonial...', 3)}
          {renderSelectField('Style', 'style', [
            { value: 'detailed', label: 'Detailed (with stats)' },
            { value: 'cards', label: 'Cards' },
            { value: 'simple', label: 'Simple' }
          ])}

          {/* Before Stats Editor */}
          {(widget.config.style === 'detailed' || widget.config.style === 'cards') && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-800">Before Stats (Optional)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const stats = [...(widget.config.beforeStats || [])];
                        stats.push({ label: 'Label', value: 'Value' });
                        onUpdate({ beforeStats: stats });
                      }}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Stat
                    </button>
                  </div>
                  {(widget.config.beforeStats || []).length === 0 && (
                    <p className="text-xs text-gray-500 italic">No before stats. Add stats to show metrics under the before image.</p>
                  )}
                  <div className="space-y-2">
                    {(widget.config.beforeStats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const stats = [...(widget.config.beforeStats || [])];
                            stats[idx] = { ...stats[idx], label: e.target.value };
                            onUpdate({ beforeStats: stats });
                          }}
                          placeholder="Label"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const stats = [...(widget.config.beforeStats || [])];
                            stats[idx] = { ...stats[idx], value: e.target.value };
                            onUpdate({ beforeStats: stats });
                          }}
                          placeholder="Value"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const stats = (widget.config.beforeStats || []).filter((_: any, i: number) => i !== idx);
                            onUpdate({ beforeStats: stats });
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* After Stats Editor */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-green-800">After Stats (Optional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const stats = [...(widget.config.afterStats || [])];
                      stats.push({ label: 'Label', value: 'Value' });
                      onUpdate({ afterStats: stats });
                    }}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Add Stat
                  </button>
                </div>
                {(widget.config.afterStats || []).length === 0 && (
                  <p className="text-xs text-gray-500 italic">No after stats. Add stats to show metrics under the after image.</p>
                )}
                <div className="space-y-2">
                  {(widget.config.afterStats || []).map((stat: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const stats = [...(widget.config.afterStats || [])];
                          stats[idx] = { ...stats[idx], label: e.target.value };
                          onUpdate({ afterStats: stats });
                        }}
                        placeholder="Label"
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const stats = [...(widget.config.afterStats || [])];
                          stats[idx] = { ...stats[idx], value: e.target.value };
                          onUpdate({ afterStats: stats });
                        }}
                        placeholder="Value"
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const stats = (widget.config.afterStats || []).filter((_: any, i: number) => i !== idx);
                          onUpdate({ afterStats: stats });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={widget.config.showCta || false}
                  onChange={(e) => onUpdate({ showCta: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show CTA Button</span>
              </label>
            </div>

            {widget.config.showCta && (
              <>
                {renderTextField('Button Text', 'ctaText', 'Get The Same Results →')}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                  <select
                    value={widget.config.ctaType || 'external'}
                    onChange={(e) => onUpdate({ ctaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="external">Link to URL</option>
                    <option value="anchor">Jump to Widget on Page</option>
                  </select>
                </div>

                {(!widget.config.ctaType || widget.config.ctaType === 'external') && (
                  <>
                    {renderTextField('Button URL', 'ctaUrl', 'https://example.com')}
                    {renderSelectField('Open in', 'target', [
                      { value: '_blank', label: 'New Tab' },
                      { value: '_self', label: 'Same Tab' }
                    ])}
                  </>
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Image */}
      {widget.type === 'hero-image' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Your headline here')}
          {renderTextAreaField('Subtitle', 'subtitle', 'Supporting text...', 2)}
          {renderImageField('Hero Image', 'image')}
          {renderTextField('Image Alt Text', 'imageAlt', 'Description of image')}
          {renderTextField('Button Text', 'buttonText', 'Learn More')}
          {renderTextField('Button URL', 'buttonUrl', '/top-picks')}
        </div>
      )}

      {/* Data Overview */}
      {widget.type === 'data-overview' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'The Numbers Speak')}
          {renderTextField('Subheading', 'subheading', 'Why this matters...')}
          {renderTextField('Source Citation', 'source', 'Journal of Clinical Studies, 2023')}
          {renderSelectField('Style', 'style', [
            { value: 'cards', label: 'Cards' },
            { value: 'inline', label: 'Inline' },
            { value: 'banner', label: 'Banner' }
          ])}

          {/* Editable Stats */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Stats (4 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const stats = (widget.config.stats || []) as any[];
                  onUpdate({ stats: [...stats, { value: '', label: '', icon: 'trending', color: 'purple' }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Stat
              </button>
            </div>
            {((widget.config.stats || []) as any[]).map((stat: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Stat {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const stats = [...(widget.config.stats || []) as any[]];
                      stats.splice(idx, 1);
                      onUpdate({ stats });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Value (big number)</label>
                    <input
                      type="text"
                      value={stat.value || ''}
                      onChange={(e) => {
                        const stats = [...(widget.config.stats || []) as any[]];
                        stats[idx] = { ...stats[idx], value: e.target.value };
                        onUpdate({ stats });
                      }}
                      placeholder="96%"
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Icon</label>
                    <select
                      value={stat.icon || 'trending'}
                      onChange={(e) => {
                        const stats = [...(widget.config.stats || []) as any[]];
                        stats[idx] = { ...stats[idx], icon: e.target.value };
                        onUpdate({ stats });
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white"
                    >
                      <option value="trending">Trending</option>
                      <option value="users">Users</option>
                      <option value="alert">Alert</option>
                      <option value="clock">Clock</option>
                      <option value="percent">Percent</option>
                      <option value="heart">Heart</option>
                      <option value="target">Target</option>
                      <option value="zap">Zap</option>
                      <option value="check">Check</option>
                      <option value="activity">Activity</option>
                      <option value="chart">Chart</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const stats = [...(widget.config.stats || []) as any[]];
                      stats[idx] = { ...stats[idx], label: e.target.value };
                      onUpdate({ stats });
                    }}
                    placeholder="of women over 40 experience hormonal imbalance"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms Checker */}
      {widget.type === 'symptoms-checker' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Could Your Hormones Be Out of Balance?')}
          {renderTextField('Subheading', 'subheading', 'Check the symptoms you\'re experiencing:')}
          {renderNumberField('Min Symptoms Threshold', 'minSymptoms', 1, 10, '3')}
          {renderTextField('Conclusion Headline', 'conclusionHeadline', 'If you checked 3 or more, this article was written for YOU')}
          {renderTextAreaField('Conclusion Text', 'conclusionText', 'These symptoms aren\'t just "part of getting older"...', 3)}

          {/* Editable Symptoms */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Symptoms (10 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const symptoms = (widget.config.symptoms || []) as any[];
                  onUpdate({ symptoms: [...symptoms, { text: '', category: 'General' }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Symptom
              </button>
            </div>
            {((widget.config.symptoms || []) as any[]).map((symptom: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">Symptom {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const symptoms = [...(widget.config.symptoms || []) as any[]];
                      symptoms.splice(idx, 1);
                      onUpdate({ symptoms });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={symptom.text || symptom.label || ''}
                    onChange={(e) => {
                      const symptoms = [...(widget.config.symptoms || []) as any[]];
                      symptoms[idx] = { ...symptoms[idx], text: e.target.value };
                      onUpdate({ symptoms });
                    }}
                    placeholder="Unexplained weight gain, especially around the midsection"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <select
                    value={symptom.category || 'General'}
                    onChange={(e) => {
                      const symptoms = [...(widget.config.symptoms || []) as any[]];
                      symptoms[idx] = { ...symptoms[idx], category: e.target.value };
                      onUpdate({ symptoms });
                    }}
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  >
                    <option value="Metabolism">Metabolism</option>
                    <option value="Energy">Energy</option>
                    <option value="Mood">Mood</option>
                    <option value="Mental">Mental</option>
                    <option value="Hormones">Hormones</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Physical">Physical</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* CTA in Reveal Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call-to-Action in Reveal</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="showCta"
                checked={widget.config.showCta || false}
                onChange={(e) => onUpdate({ showCta: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="showCta" className="text-sm text-gray-700">Show CTA button in reveal section</label>
            </div>

            {widget.config.showCta && (
              <div className="space-y-3 pl-4 border-l-2 border-primary-200">
                {renderTextField('Button Text', 'ctaText', 'See The Solution →')}

                {renderSelectField('Button Action', 'ctaType', [
                  { value: 'external', label: 'Link to URL' },
                  { value: 'anchor', label: 'Jump to Widget on Page' }
                ])}

                {widget.config.ctaType !== 'anchor' && (
                  renderTextField('Button URL', 'ctaUrl', 'https://kialanutrition.com')
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ingredient List Grid */}
      {widget.type === 'ingredient-list-grid' && (
        <div className="space-y-4">
          {/* Style Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={widget.config.style || 'simple'}
              onChange={(e) => onUpdate({ style: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
            >
              <option value="simple">Simple (clean cards)</option>
              <option value="default">Default (with banner)</option>
            </select>
          </div>

          {widget.config.style === 'default' && (
            <>
              {renderTextField('Headline', 'headline', 'Powerful Ingredients, Proven Results')}
              {renderTextField('Banner Text', 'bannerText', '✨ 6 Clinically-Backed Superfoods in Every Scoop')}
            </>
          )}

          {/* Columns Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grid Columns</label>
            <select
              value={widget.config.columns || 2}
              onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          {/* Editable Ingredients */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Ingredients</label>
              <button
                type="button"
                onClick={() => {
                  const ingredients = (widget.config.ingredients || []) as any[];
                  onUpdate({ ingredients: [...ingredients, { name: '', description: '', image: '' }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Ingredient
              </button>
            </div>
            {((widget.config.ingredients || []) as any[]).map((ingredient: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">Ingredient {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const ingredients = [...(widget.config.ingredients || []) as any[]];
                      ingredients.splice(idx, 1);
                      onUpdate({ ingredients });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={ingredient.name || ''}
                      onChange={(e) => {
                        const ingredients = [...(widget.config.ingredients || []) as any[]];
                        ingredients[idx] = { ...ingredients[idx], name: e.target.value };
                        onUpdate({ ingredients });
                      }}
                      placeholder="Ashwagandha"
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea
                      value={ingredient.description || ''}
                      onChange={(e) => {
                        const ingredients = [...(widget.config.ingredients || []) as any[]];
                        ingredients[idx] = { ...ingredients[idx], description: e.target.value };
                        onUpdate({ ingredients });
                      }}
                      placeholder="Adaptogen that helps balance cortisol levels..."
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Avatar Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient.image || ''}
                        onChange={(e) => {
                          const ingredients = [...(widget.config.ingredients || []) as any[]];
                          ingredients[idx] = { ...ingredients[idx], image: e.target.value };
                          onUpdate({ ingredients });
                        }}
                        placeholder="https://..."
                        className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveImageField(`ingredients.${idx}.image`);
                          setMediaLibraryOpen(true);
                        }}
                        className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-3 py-2 rounded text-sm font-medium"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                    {ingredient.image && (
                      <div className="mt-2">
                        <img src={ingredient.image} alt={ingredient.name || 'Ingredient'} className="w-12 h-12 rounded-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Ingredients Callout */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Additional Ingredients Callout</label>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={widget.config.showAdditional !== false}
                  onChange={(e) => onUpdate({ showAdditional: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show "+X more" callout</span>
              </label>
            </div>

            {widget.config.showAdditional !== false && (
              <div className="space-y-3 bg-purple-50 p-3 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Additional Count</label>
                  <input
                    type="number"
                    value={widget.config.additionalCount || 20}
                    onChange={(e) => onUpdate({ additionalCount: parseInt(e.target.value) || 0 })}
                    placeholder="20"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Additional Text</label>
                  <input
                    type="text"
                    value={widget.config.additionalText || 'hormone-supporting, gut-healing superfoods in every scoop'}
                    onChange={(e) => onUpdate({ additionalText: e.target.value })}
                    placeholder="hormone-supporting, gut-healing superfoods in every scoop"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <input
                type="checkbox"
                checked={widget.config.showCta || false}
                onChange={(e) => onUpdate({ showCta: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show CTA Button
            </label>
            {widget.config.showCta && (
              <div className="space-y-3 pl-6">
                {renderTextField('CTA Text', 'ctaText', 'Learn More →')}
                {renderTextField('CTA Subtext (small text below button)', 'ctaSubtext', '')}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                  <select
                    value={widget.config.ctaType || 'external'}
                    onChange={(e) => onUpdate({ ctaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="external">Link to URL</option>
                    <option value="anchor">Jump to Widget on Page</option>
                  </select>
                </div>

                {widget.config.ctaType !== 'anchor' && (
                  <>
                    {renderTextField('CTA URL', 'ctaUrl', 'https://kialanutrition.com')}
                    {renderSelectField('Open in', 'target', [
                      { value: '_self', label: 'Same tab' },
                      { value: '_blank', label: 'New tab' }
                    ])}
                  </>
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline / Expectation Timeline */}
      {(widget.type === 'timeline' || widget.type === 'expectation-timeline') && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Your Transformation Journey')}
          {renderTextField('Subheading', 'subheading', 'What to expect when you start')}

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
            {renderTextField('Button Text', 'ctaText', 'Start Your Journey →')}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
              <select
                value={widget.config.ctaType || 'external'}
                onChange={(e) => onUpdate({ ctaType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="external">Link to URL</option>
                <option value="anchor">Jump to Widget on Page</option>
              </select>
            </div>

            {widget.config.ctaType !== 'anchor' && (
              <>
                {renderTextField('Button URL', 'ctaUrl', '/top-picks')}
                {renderSelectField('Open in', 'target', [
                  { value: '_self', label: 'Same tab' },
                  { value: '_blank', label: 'New tab' }
                ])}
              </>
            )}

            {widget.config.ctaType === 'anchor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                <select
                  value={widget.config.anchorWidgetId || ''}
                  onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a widget...</option>
                  {allWidgets
                    .filter((w: Widget) => w.id !== widget.id && w.enabled)
                    .sort((a: Widget, b: Widget) => a.position - b.position)
                    .map((w: Widget) => (
                      <option key={w.id} value={w.id}>
                        {getWidgetDisplayName(w)} (Position {w.position + 1})
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Bottom Stats</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weeks Total</label>
                <input
                  type="text"
                  value={widget.config.weeksTotal || '12'}
                  onChange={(e) => onUpdate({ weeksTotal: e.target.value })}
                  placeholder="12"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Success Stories</label>
                <input
                  type="text"
                  value={widget.config.successStories || '10k+'}
                  onChange={(e) => onUpdate({ successStories: e.target.value })}
                  placeholder="10k+"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Results %</label>
                <input
                  type="text"
                  value={widget.config.resultsPercent || '94%'}
                  onChange={(e) => onUpdate({ resultsPercent: e.target.value })}
                  placeholder="94%"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Editable Steps */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Timeline Steps (4 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const steps = (widget.config.steps || []) as any[];
                  onUpdate({ steps: [...steps, { period: 'Month X', title: '', subtitle: '', description: '', benefits: [], icon: 'zap' }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Step
              </button>
            </div>
            {((widget.config.steps || []) as any[]).map((step: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Step {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const steps = [...(widget.config.steps || []) as any[]];
                      steps.splice(idx, 1);
                      onUpdate({ steps });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Period (e.g., Week 1-2)</label>
                    <input
                      type="text"
                      value={step.period || step.week || ''}
                      onChange={(e) => {
                        const steps = [...(widget.config.steps || []) as any[]];
                        steps[idx] = { ...steps[idx], period: e.target.value };
                        onUpdate({ steps });
                      }}
                      placeholder="Week 1-2"
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Icon</label>
                    <select
                      value={step.icon || 'zap'}
                      onChange={(e) => {
                        const steps = [...(widget.config.steps || []) as any[]];
                        steps[idx] = { ...steps[idx], icon: e.target.value };
                        onUpdate({ steps });
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                    >
                      <option value="zap">Zap (Energy)</option>
                      <option value="leaf">Leaf (Nature)</option>
                      <option value="moon">Moon (Sleep/Rest)</option>
                      <option value="trending">Trending Up</option>
                      <option value="sun">Sun (Vitality)</option>
                      <option value="crown">Crown (Achievement)</option>
                      <option value="heart">Heart</option>
                      <option value="star">Star</option>
                      <option value="check">Check</option>
                      <option value="sparkles">Sparkles</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Title (Main heading for this phase)</label>
                  <input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => {
                      const steps = [...(widget.config.steps || []) as any[]];
                      steps[idx] = { ...steps[idx], title: e.target.value };
                      onUpdate({ steps });
                    }}
                    placeholder="Inflammation Reset Begins"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Ingredients/Subtitle (Key ingredients working)</label>
                  <input
                    type="text"
                    value={step.subtitle || ''}
                    onChange={(e) => {
                      const steps = [...(widget.config.steps || []) as any[]];
                      steps[idx] = { ...steps[idx], subtitle: e.target.value };
                      onUpdate({ steps });
                    }}
                    placeholder="Probiotics • Digestive Enzymes • Ginger Root • Turmeric"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Tagline (What's happening in your body)</label>
                  <input
                    type="text"
                    value={step.description || ''}
                    onChange={(e) => {
                      const steps = [...(widget.config.steps || []) as any[]];
                      steps[idx] = { ...steps[idx], description: e.target.value };
                      onUpdate({ steps });
                    }}
                    placeholder="Your Body Starts Calming Down"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Benefits (comma-separated)</label>
                  <input
                    type="text"
                    value={(step.benefits || []).join(', ')}
                    onChange={(e) => {
                      const steps = [...(widget.config.steps || []) as any[]];
                      steps[idx] = { ...steps[idx], benefits: e.target.value.split(',').map((b: string) => b.trim()).filter((b: string) => b) };
                      onUpdate({ steps });
                    }}
                    placeholder="Digestion feels smoother → bloating reduced, Morning puffiness eases, First boost of clean energy"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial */}
      {widget.type === 'testimonial' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Success Stories')}
          {renderTextField('Subheading', 'subheading', 'Real results from real women')}
          <ImageGalleryField label="Testimonial Photos" field="images" />
          {renderSelectField('Style', 'style', [
            { value: 'featured', label: 'Featured' },
            { value: 'carousel', label: 'Carousel' },
            { value: 'grid', label: 'Grid' }
          ])}
        </div>
      )}

      {/* Top Ten List */}
      {(widget.type === 'top-ten' || widget.type === 'top-ten-list') && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Top 10 Foods for Hormone Balance')}
          {renderTextField('Subheading', 'subheading', 'Research-backed recommendations')}
          {renderTextField('Button Text', 'buttonText', 'Download Full List →')}
          {renderTextField('Button URL', 'buttonUrl', '/top-picks')}
          {renderSelectField('Style', 'style', [
            { value: 'numbered', label: 'Numbered' },
            { value: 'cards', label: 'Cards' },
            { value: 'checklist', label: 'Checklist' }
          ])}
        </div>
      )}

      {/* Shop Now */}
      {widget.type === 'shop-now' && (
        <div className="space-y-4">
          {/* Doctor Header Section */}
          <div className="border-b pb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Doctor Header (Top Bar)</label>
            <div className="space-y-3 bg-purple-50 p-3 rounded-lg">
              {renderTextField('Doctor Name', 'doctorName', 'Dr. Amy')}
              {renderImageField('Doctor Image', 'doctorImage')}
              {renderTextField('Badge Text', 'badgeText', '#1 BEST SELLER')}
            </div>
          </div>

          {renderTextField('Product Name', 'name', 'Kiala Greens')}
          {renderTextAreaField('Description', 'description', 'The all-in-one solution for naturally balancing your hormones and boosting your metabolism after 40.', 3)}

          {/* Product Images Gallery */}
          <ImageGalleryField label="Product Images (up to 6)" field="images" />
          <p className="text-xs text-gray-500">Upload up to 6 product images for the gallery carousel.</p>

          <div className="grid grid-cols-2 gap-4">
            {renderNumberField('Rating (1-5)', 'rating', 1, 5, '4.7')}
            {renderTextField('Review Count', 'reviewCount', '1.2M')}
          </div>
          {renderTextField('Loved By Count', 'lovedByCount', '1,000,000+')}

          {/* Pricing Options */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Options (Packages)</label>
            <PricingOptionsEditor
              options={(widget.config as any).pricingOptions || []}
              onChange={(options) => onUpdate({ pricingOptions: options })}
            />
          </div>

          {/* Benefits Grid - 6 individual benefits */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (6 checkmarks in 3 rows × 2 columns)</label>
            <div className="space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                {renderTextField('Benefit 1', 'benefit1', 'Clinically studied ingredients')}
                {renderTextField('Benefit 2', 'benefit2', '30-day supply')}
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                {renderTextField('Benefit 3', 'benefit3', 'Hormone support blend')}
                {renderTextField('Benefit 4', 'benefit4', 'No artificial sweeteners')}
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-3">
                {renderTextField('Benefit 5', 'benefit5', 'Made in USA')}
                {renderTextField('Benefit 6', 'benefit6', 'GMP certified')}
              </div>
            </div>
          </div>

          {renderTextField('Button Text', 'ctaText', 'START NOW')}
          {renderTextField('Button URL', 'ctaUrl', 'https://trygreens.com/dr-amy')}
          {renderSelectField('Open in', 'target', [
            { value: '_self', label: 'Same tab' },
            { value: '_blank', label: 'New tab' }
          ])}
          {renderTextField('Guarantee Text', 'guaranteeText', '90-Day Money-Back Guarantee')}

          {/* Testimonial */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Featured Testimonial</label>
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="showTestimonial"
                  checked={(widget.config as any).showTestimonial !== false}
                  onChange={(e) => onUpdate({ showTestimonial: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="showTestimonial" className="text-sm text-gray-700">Show testimonial</label>
              </div>
              {renderTextAreaField('Quote', 'testimonialQuote', 'This completely changed my energy levels and mood. I feel like myself again after just 3 weeks!', 3)}
              {renderTextField('Customer Name', 'testimonialName', 'Sarah M., 47')}
              {renderImageField('Customer Avatar', 'testimonialAvatar')}
            </div>
          </div>
        </div>
      )}

      {/* Product Showcase */}
      {widget.type === 'product-showcase' && (
        <div className="space-y-4">
          {/* Product Info */}
          {renderTextField('Product Name', 'name', 'Complete Hormone Reset')}
          {renderTextAreaField('Description', 'description', 'Product description...', 3)}
          {renderImageField('Product Image', 'image')}
          <div className="grid grid-cols-2 gap-4">
            {renderNumberField('Price', 'price', 0)}
            {renderNumberField('Original Price', 'originalPrice', 0)}
          </div>
          <BenefitsListEditor
            benefits={widget.config.benefits || []}
            onChange={(benefits: string[]) => onUpdate({ benefits })}
          />

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Call to Action</h6>
            {renderTextField('Button Text', 'buttonText', 'Get Instant Access →')}
            {renderCtaTypeAndTarget()}
          </div>

          {/* CTA Bullets */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Trust Badges (under button)</h6>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badges (one per line)</label>
              <textarea
                value={(widget.config.ctaBullets || ['Free Shipping', '60-Day Guarantee', '24/7 Support']).join('\n')}
                onChange={(e) => onUpdate({ ctaBullets: e.target.value.split('\n').filter(b => b.trim()) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                rows={3}
                placeholder="Free Shipping&#10;60-Day Guarantee&#10;24/7 Support"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Rating Display</h6>
            {renderCheckboxField('Show Rating', 'showRating')}
            {widget.config.showRating !== false && (
              <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary-200">
                {renderNumberField('Star Rating', 'ratingStars', 1, 5, '5')}
                {renderTextField('Review Count', 'ratingCount', '2,847 reviews')}
              </div>
            )}
          </div>

          {/* Testimonial */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Testimonial</h6>
            {renderCheckboxField('Show Testimonial', 'showTestimonial')}
            {widget.config.showTestimonial && (
              <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary-200">
                {renderImageField('Customer Photo', 'testimonialImage')}
                {renderTextAreaField('Quote', 'testimonialQuote', '"This product changed my life!"', 2)}
                {renderTextField('Author', 'testimonialAuthor', 'Sarah M., Texas')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ Accordion */}
      {(widget.type === 'faq' || widget.type === 'faq-accordion') && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Frequently Asked Questions')}
          {renderTextField('Subheading', 'subheading', 'Everything you need to know')}
          {renderTextField('Support Email', 'supportEmail', 'support@example.com')}
          {renderSelectField('Style', 'style', [
            { value: 'accordion', label: 'Accordion' },
            { value: 'expanded', label: 'All Expanded' },
            { value: 'grid', label: 'Grid' }
          ])}
          <p className="text-xs text-gray-500">FAQ items are configured in the article defaults. Edit the JSON directly for custom questions.</p>
        </div>
      )}

      {/* Countdown Timer */}
      {widget.type === 'countdown-timer' && (
        <div className="space-y-4">
          {/* Header */}
          {renderTextField('Banner Message', 'headline', 'Flash Sale - 40% Off Today Only!')}
          {renderTextField('Timer Label', 'subheading', 'Offer expires in:')}

          {/* Product Info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Product Details</h6>
            {renderImageField('Product Image', 'productImage')}
            {renderTextField('Product Name', 'productName', 'Hormone Balance Complete Kit')}
            {renderTextAreaField('Product Description', 'productDescription', 'Everything you need to start your hormone reset journey.', 2)}
            <div className="grid grid-cols-2 gap-4">
              {renderTextField('Sale Price', 'salePrice', '$89')}
              {renderTextField('Original Price', 'originalPrice', '$147')}
            </div>
          </div>

          {/* Timer Settings */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Timer Settings</h6>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timer Duration (hours)</label>
              <input
                type="number"
                min={1}
                max={168}
                value={Math.floor((widget.config.timer || 86400000) / 3600000)}
                onChange={(e) => onUpdate({ timer: parseInt(e.target.value) * 3600000 })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Call to Action</h6>
            {renderTextField('Button Text', 'ctaText', 'Claim Your Discount Now')}
            {renderCtaTypeAndTarget()}
          </div>

          {/* Trust Badges */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Trust Badges</h6>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
              <textarea
                value={(widget.config.benefits || ['Free Shipping', '60-Day Guarantee', '24/7 Support']).join('\n')}
                onChange={(e) => onUpdate({ benefits: e.target.value.split('\n').filter(b => b.trim()) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                rows={3}
                placeholder="Free Shipping&#10;60-Day Guarantee&#10;24/7 Support"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Capture */}
      {widget.type === 'email-capture' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Get My Free Guide')}
          {renderTextField('Subheading', 'subheading', 'Join thousands getting weekly insights')}
          {renderImageField('Lead Magnet Image', 'leadMagnetImage')}
          {renderTextField('Button Text', 'buttonText', 'Send Me The Guide')}
          {renderSelectField('Style', 'style', [
            { value: 'default', label: 'Default' },
            { value: 'minimal', label: 'Minimal' },
            { value: 'featured', label: 'Featured' },
            { value: 'inline', label: 'Inline' }
          ])}
        </div>
      )}

      {/* CTA Button */}
      {widget.type === 'cta-button' && (
        <div className="space-y-4">
          {/* Title and Subtitle */}
          {renderTextField('Title', 'title', 'Ready to Transform Your Health?')}
          {renderTextField('Subtitle', 'subtitle', 'Join thousands of women who have taken control')}

          {/* Button Settings */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Button Settings</h6>
            {renderTextField('Button Text', 'buttonText', 'Take Action Now →')}
            {renderSelectField('Style', 'style', [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' }
            ])}
            {renderCtaTypeAndTarget()}
          </div>

          {/* Social Proof */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Social Proof</h6>
            {renderCheckboxField('Show Social Proof', 'showSocialProof')}
            {widget.config.showSocialProof && (
              <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary-200">
                <ImageGalleryField label="Customer Avatars" field="socialProofAvatars" />
                {renderNumberField('Star Rating', 'socialProofStars', 1, 5, '5')}
                {renderTextField('Review Text', 'socialProofText', '10,000+ happy customers')}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Trust Badges</h6>
            {renderCheckboxField('Show Badges', 'showBadges')}
            {widget.config.showBadges && (
              <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badges (one per line)</label>
                  <textarea
                    value={(widget.config.badges || ['Free Shipping', '90-Day Guarantee', 'Made in USA']).join('\n')}
                    onChange={(e) => onUpdate({ badges: e.target.value.split('\n').filter(b => b.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    rows={3}
                    placeholder="Free Shipping&#10;90-Day Guarantee&#10;Made in USA"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter each badge text on a new line</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Proof */}
      {widget.type === 'social-proof' && (
        <div className="space-y-4">
          {renderTextField('Message', 'message', '247 women joined today!')}
          {renderImageField('Icon/Avatar', 'icon')}
          {renderSelectField('Style', 'style', [
            { value: 'ticker', label: 'Ticker' },
            { value: 'banner', label: 'Banner' },
            { value: 'popup', label: 'Popup' }
          ])}
        </div>
      )}

      {/* Special Offer */}
      {widget.type === 'special-offer' && (
        <div className="space-y-4">
          {/* Header */}
          {renderTextField('Banner Headline', 'headline', 'EXCLUSIVE READER OFFER')}
          {renderTextField('Title', 'subheading', 'Unlock Your Complete Hormone Reset Kit')}
          {renderTextAreaField('Description', 'description', 'Get instant access to everything you need...', 3)}

          {/* Product Image */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Product Image</h6>
            {renderImageField('Product Image', 'productImage')}
            <p className="text-xs text-gray-500 mt-1">Optional: Display a product image alongside the offer details</p>
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Pricing</h6>
            <div className="grid grid-cols-2 gap-4">
              {renderNumberField('Sale Price', 'price', 0)}
              {renderNumberField('Original Price', 'originalPrice', 0)}
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Features</h6>
            <BenefitsListEditor
              benefits={widget.config.features || []}
              onChange={(features: string[]) => onUpdate({ features })}
            />
          </div>

          {/* Urgency */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Urgency Settings</h6>
            {renderNumberField('Limited Spots', 'limitedSpots', 50)}
            {renderNumberField('Recent Redemptions', 'redemptionCount', 1247)}
          </div>

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Call to Action</h6>
            {renderTextField('Button Text', 'buttonText', 'Claim Your Spot Now →')}
            {renderCtaTypeAndTarget()}
          </div>
        </div>
      )}

      {/* Us Vs Them Comparison */}
      {widget.type === 'us-vs-them-comparison' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'See The Difference')}

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
            {renderTextField('Button Text', 'buttonText', 'Try Kiala Greens →')}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
              <select
                value={widget.config.ctaType || 'external'}
                onChange={(e) => onUpdate({ ctaType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="external">Link to URL</option>
                <option value="anchor">Jump to Widget on Page</option>
              </select>
            </div>

            {widget.config.ctaType !== 'anchor' && (
              <>
                {renderTextField('Button URL', 'buttonUrl', '/top-picks')}
                {renderSelectField('Open in', 'target', [
                  { value: '_self', label: 'Same tab' },
                  { value: '_blank', label: 'New tab' }
                ])}
              </>
            )}

            {widget.config.ctaType === 'anchor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                <select
                  value={widget.config.anchorWidgetId || ''}
                  onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a widget...</option>
                  {allWidgets
                    .filter((w: Widget) => w.id !== widget.id && w.enabled)
                    .sort((a: Widget, b: Widget) => a.position - b.position)
                    .map((w: Widget) => (
                      <option key={w.id} value={w.id}>
                        {getWidgetDisplayName(w)} (Position {w.position + 1})
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
              </div>
            )}
          </div>

          {/* Column 1 (Us / Kiala) */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-purple-500"></span>
              Column 1 (Our Product)
            </h4>
            {renderImageField('Column 1 Image', 'column1Image')}
            {renderTextField('Column 1 Title', 'column1Title', 'Kiala Greens')}

            {/* Column 1 Features */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Column 1 Features</label>
                <button
                  type="button"
                  onClick={() => {
                    const features = (widget.config.column1Features || []) as string[];
                    onUpdate({ column1Features: [...features, ''] });
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Feature
                </button>
              </div>
              {((widget.config.column1Features || []) as string[]).map((feature: string, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const features = [...(widget.config.column1Features || []) as string[]];
                      features[idx] = e.target.value;
                      onUpdate({ column1Features: features });
                    }}
                    placeholder="Enter feature..."
                    className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const features = [...(widget.config.column1Features || []) as string[]];
                      features.splice(idx, 1);
                      onUpdate({ column1Features: features });
                    }}
                    className="text-red-500 hover:text-red-600 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 (Them / Others) */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              Column 2 (Competitor)
            </h4>
            {renderImageField('Column 2 Image', 'column2Image')}
            {renderTextField('Column 2 Title', 'column2Title', 'Other Greens')}

            {/* Column 2 Features */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Column 2 Features</label>
                <button
                  type="button"
                  onClick={() => {
                    const features = (widget.config.column2Features || []) as string[];
                    onUpdate({ column2Features: [...features, ''] });
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Feature
                </button>
              </div>
              {((widget.config.column2Features || []) as string[]).map((feature: string, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const features = [...(widget.config.column2Features || []) as string[]];
                      features[idx] = e.target.value;
                      onUpdate({ column2Features: features });
                    }}
                    placeholder="Enter feature..."
                    className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const features = [...(widget.config.column2Features || []) as string[]];
                      features.splice(idx, 1);
                      onUpdate({ column2Features: features });
                    }}
                    className="text-red-500 hover:text-red-600 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stacked Quotes */}
      {widget.type === 'stacked-quotes' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Real Results from Real Women')}
          {renderTextField('Subheading', 'subheading', 'Join thousands who transformed their health')}
          {renderTextField('Review Count Display', 'reviewCount', '1.2M')}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={widget.config.showVerifiedBadge !== false}
              onChange={(e) => onUpdate({ showVerifiedBadge: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Show verified badges</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={widget.config.showEmailCapture === true}
              onChange={(e) => onUpdate({ showEmailCapture: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Show email capture form</label>
          </div>

          {/* Editable Quotes */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Quotes (4 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const quotes = (widget.config.quotes || []) as any[];
                  const newId = `quote-${Date.now()}`;
                  onUpdate({ quotes: [...quotes, { id: newId, name: '', location: '', result: '', image: '', rating: 5, content: '', verified: true }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Quote
              </button>
            </div>
            {((widget.config.quotes || []) as any[]).map((quote: any, idx: number) => (
              <div key={quote.id || idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Quote {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const quotes = [...(widget.config.quotes || []) as any[]];
                      quotes.splice(idx, 1);
                      onUpdate({ quotes });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={quote.name || ''}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], name: e.target.value };
                        onUpdate({ quotes });
                      }}
                      placeholder="Sarah M."
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={quote.location || ''}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], location: e.target.value };
                        onUpdate({ quotes });
                      }}
                      placeholder="Austin, TX"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Result Badge</label>
                    <input
                      type="text"
                      value={quote.result || ''}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], result: e.target.value };
                        onUpdate({ quotes });
                      }}
                      placeholder="Lost 23 lbs"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rating (1-5)</label>
                    <select
                      value={quote.rating || 5}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], rating: parseInt(e.target.value) };
                        onUpdate({ quotes });
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Quote Content</label>
                  <textarea
                    value={quote.content || ''}
                    onChange={(e) => {
                      const quotes = [...(widget.config.quotes || []) as any[]];
                      quotes[idx] = { ...quotes[idx], content: e.target.value };
                      onUpdate({ quotes });
                    }}
                    placeholder="After following the protocol for just 8 weeks, I've lost 23 pounds and feel more energetic..."
                    rows={3}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Profile Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={quote.image || ''}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], image: e.target.value };
                        onUpdate({ quotes });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 border border-gray-300 rounded p-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageField(`quotes.${idx}.image`);
                        setMediaLibraryOpen(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 px-2 rounded"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={quote.verified !== false}
                      onChange={(e) => {
                        const quotes = [...(widget.config.quotes || []) as any[]];
                        quotes[idx] = { ...quotes[idx], verified: e.target.checked };
                        onUpdate({ quotes });
                      }}
                      className="rounded"
                    />
                    Verified Member
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {widget.type === 'comparison-table' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'How Our Solution Compares')}
          {renderTextField('Subtitle', 'subtitle', 'See why thousands of women are making the switch')}
          <div className="grid grid-cols-2 gap-4">
            {renderTextField('Left Column Header', 'leftColumnHeader', 'Standard')}
            {renderTextField('Right Column Header', 'rightColumnHeader', 'Premium')}
          </div>

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Call to Action</h6>
            {renderCheckboxField('Show CTA Button', 'showCta')}
            {widget.config.showCta && (
              <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary-200">
                {renderTextField('Button Text', 'ctaText', 'Get Started →')}
                {renderTextField('Subtext', 'ctaSubtext', 'Free shipping on all orders')}
                {renderCtaTypeAndTarget()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guarantee Box */}
      {widget.type === 'guarantee-box' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', '100% Satisfaction Guaranteed')}
          {renderTextAreaField('Description', 'description', 'Our guarantee details...', 3)}
          {renderTextField('Badge Text', 'badgeText', '60-DAY GUARANTEE')}
          {renderImageField('Guarantee Badge/Seal', 'badgeImage')}
        </div>
      )}

      {/* Video Embed */}
      {widget.type === 'video-embed' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Watch This')}
          {renderTextField('Video URL (YouTube/Vimeo embed)', 'videoUrl', 'https://www.youtube.com/embed/...')}
          {renderImageField('Video Thumbnail', 'thumbnailUrl')}
          {renderTextField('Caption', 'caption', 'Optional caption text')}
        </div>
      )}

      {/* Trust Badges */}
      {widget.type === 'trust-badges' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'As Seen In')}
          <ImageGalleryField label="Trust Badge Images" field="badges" />
          <p className="text-xs text-gray-500">Add logos of publications, certifications, or partners.</p>
        </div>
      )}

      {/* Exclusive Product */}
      {widget.type === 'exclusive-product' && (
        <div className="space-y-4">
          {/* Product Image first */}
          {renderImageField('Product Image', 'image')}
          {renderTextField('Product Name', 'name', 'Dr. Amy\'s Recommended Solution')}
          {renderTextAreaField('Description', 'description', 'Product description...', 3)}

          {/* Benefits List - right after description */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Benefits (green checkmarks)</label>
              <button
                type="button"
                onClick={() => {
                  const benefits = (widget.config.benefits || []) as string[];
                  onUpdate({ benefits: [...benefits, ''] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Benefit
              </button>
            </div>
            <div className="space-y-2">
              {((widget.config.benefits || []) as string[]).map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const benefits = [...(widget.config.benefits || [])] as string[];
                      benefits[idx] = e.target.value;
                      onUpdate({ benefits });
                    }}
                    placeholder={`Benefit ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const benefits = [...(widget.config.benefits || [])] as string[];
                      benefits.splice(idx, 1);
                      onUpdate({ benefits });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              {((widget.config.benefits || []) as string[]).length === 0 && (
                <p className="text-xs text-gray-500 italic">No benefits added. Click "+ Add Benefit" to add up to 5 bullet points.</p>
              )}
            </div>
          </div>

          {/* Trust Badge Text (shown below CTA button) */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Trust Badges (below CTA)</label>
            <p className="text-xs text-gray-500 mb-3">These appear as small text with icons below the button</p>
            <div className="space-y-3">
              {renderTextField('Shipping', 'shippingBadgeText', 'Free Shipping')}
              {renderTextField('Guarantee', 'guaranteeBadgeText', '90-Day Guarantee')}
              {renderTextField('Third Badge', 'evaluatedBadgeText', 'Medically Evaluated')}
            </div>
          </div>

          {/* Pricing section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Pricing</label>
            <div className="grid grid-cols-2 gap-4">
              {renderNumberField('Price', 'price', 0)}
              {renderNumberField('Original Price', 'originalPrice', 0)}
            </div>
            {renderTextField('Savings Text (optional)', 'savingsText', 'Leave empty to auto-calculate')}
            <p className="text-xs text-gray-500 -mt-2">If empty, will show "You save $X (Y% off)" based on prices above.</p>
          </div>

          {/* Doctor/Header section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Header Bar</label>
            {renderImageField('Doctor/Expert Photo', 'doctorImage')}
            {renderTextField('Doctor Name', 'doctorName', 'Dr. Amy')}
          </div>

          {/* Button/CTA */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Call to Action</label>
            {renderTextField('Button Text', 'ctaText', 'TRY IT NOW')}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
              <select
                value={widget.config.ctaType || 'external'}
                onChange={(e) => onUpdate({ ctaType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="external">Link to URL</option>
                <option value="anchor">Jump to Widget on Page</option>
              </select>
            </div>

            {widget.config.ctaType !== 'anchor' && (
              <>
                {renderTextField('Button URL', 'ctaUrl', 'https://kialanutrition.com')}
                {renderSelectField('Open in', 'target', [
                  { value: '_self', label: 'Same tab' },
                  { value: '_blank', label: 'New tab' }
                ])}
              </>
            )}

            {widget.config.ctaType === 'anchor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                <select
                  value={widget.config.anchorWidgetId || ''}
                  onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a widget...</option>
                  {allWidgets
                    .filter((w: Widget) => w.id !== widget.id && w.enabled)
                    .sort((a: Widget, b: Widget) => a.position - b.position)
                    .map((w: Widget) => (
                      <option key={w.id} value={w.id}>
                        {getWidgetDisplayName(w)} (Position {w.position + 1})
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
              </div>
            )}
          </div>

          {/* Testimonial Section */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Testimonial (below product image)</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={widget.config.showTestimonial !== false}
                  onChange={(e) => onUpdate({ showTestimonial: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-600">Show</span>
              </label>
            </div>
            <div className="space-y-3">
              {renderImageField('Avatar Photo', 'testimonialAvatar')}
              {renderTextField('Customer Name', 'testimonialName', 'Sarah M., 47')}
              {renderTextAreaField('Quote', 'testimonialQuote', 'This product changed my life...', 3)}
            </div>
          </div>
        </div>
      )}

      {/* Dual Offer Comparison */}
      {widget.type === 'dual-offer-comparison' && (
        <div className="space-y-4">
          {/* Header */}
          {renderTextField('Headline', 'headline', 'Choose Your Path to Transformation')}
          {renderTextField('Subheading', 'subheading', 'Select the option that fits your goals')}

          {/* Exclusive Banner */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Exclusive Banner</h6>
            {renderCheckboxField('Show Exclusive Banner', 'showExclusiveBanner')}
            {widget.config.showExclusiveBanner !== false && (
              <div className="mt-3 pl-4 border-l-2 border-primary-200">
                {renderTextField('Banner Text', 'exclusiveText', 'Community Exclusive - Limited Time Pricing')}
              </div>
            )}
          </div>

          {/* Left Offer */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Left Offer (Starter)</h6>
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              {renderTextField('Offer Name', 'leftOffer.name', 'Basic Protocol')}
              {renderTextField('Description', 'leftOffer.description', 'Great for getting started')}
              {renderImageField('Offer Image', 'leftOffer.image')}
              <div className="grid grid-cols-2 gap-4">
                {renderNumberField('Price', 'leftOffer.price', 47)}
                {renderNumberField('Original Price', 'leftOffer.originalPrice', 0)}
              </div>
              {renderTextField('Badge Text', 'leftOffer.badge', 'STARTER')}
              {renderTextField('Button Text', 'leftOffer.ctaText', 'Get Basic')}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                <select
                  value={(widget.config.leftOffer as any)?.ctaType || 'external'}
                  onChange={(e) => onUpdate({ leftOffer: { ...(widget.config.leftOffer as any || {}), ctaType: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  <option value="external">Link to URL</option>
                  <option value="anchor">Jump to Widget on Page</option>
                </select>
              </div>
              {(widget.config.leftOffer as any)?.ctaType !== 'anchor' && (
                renderTextField('Button URL', 'leftOffer.ctaUrl', '#')
              )}
              {(widget.config.leftOffer as any)?.ctaType === 'anchor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                  <select
                    value={(widget.config.leftOffer as any)?.anchorWidgetId || ''}
                    onChange={(e) => onUpdate({ leftOffer: { ...(widget.config.leftOffer as any || {}), anchorWidgetId: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  >
                    <option value="">Select a widget...</option>
                    {allWidgets
                      .filter((w: Widget) => w.id !== widget.id && w.enabled)
                      .sort((a: Widget, b: Widget) => a.position - b.position)
                      .map((w: Widget) => (
                        <option key={w.id} value={w.id}>
                          {getWidgetDisplayName(w)} (Position {w.position + 1})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right Offer */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h6 className="font-medium text-gray-900 mb-3">Right Offer (Best Value)</h6>
            <div className="space-y-3 pl-4 border-l-2 border-primary-200">
              {renderTextField('Offer Name', 'rightOffer.name', 'Complete Reset Kit')}
              {renderTextField('Description', 'rightOffer.description', 'Everything you need for transformation')}
              {renderImageField('Offer Image', 'rightOffer.image')}
              <div className="grid grid-cols-2 gap-4">
                {renderNumberField('Price', 'rightOffer.price', 97)}
                {renderNumberField('Original Price', 'rightOffer.originalPrice', 197)}
              </div>
              {renderTextField('Badge Text', 'rightOffer.badge', 'BEST VALUE')}
              {renderCheckboxField('Highlight as Recommended', 'rightOffer.highlighted')}
              {renderTextField('Button Text', 'rightOffer.ctaText', 'Get Complete Kit →')}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                <select
                  value={(widget.config.rightOffer as any)?.ctaType || 'external'}
                  onChange={(e) => onUpdate({ rightOffer: { ...(widget.config.rightOffer as any || {}), ctaType: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                >
                  <option value="external">Link to URL</option>
                  <option value="anchor">Jump to Widget on Page</option>
                </select>
              </div>
              {(widget.config.rightOffer as any)?.ctaType !== 'anchor' && (
                renderTextField('Button URL', 'rightOffer.ctaUrl', '#')
              )}
              {(widget.config.rightOffer as any)?.ctaType === 'anchor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                  <select
                    value={(widget.config.rightOffer as any)?.anchorWidgetId || ''}
                    onChange={(e) => onUpdate({ rightOffer: { ...(widget.config.rightOffer as any || {}), anchorWidgetId: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  >
                    <option value="">Select a widget...</option>
                    {allWidgets
                      .filter((w: Widget) => w.id !== widget.id && w.enabled)
                      .sort((a: Widget, b: Widget) => a.position - b.position)
                      .map((w: Widget) => (
                        <option key={w.id} value={w.id}>
                          {getWidgetDisplayName(w)} (Position {w.position + 1})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Stars */}
      {widget.type === 'rating-stars' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Customer Reviews')}
          {renderNumberField('Rating (1-5)', 'rating', 1, 5)}
          {renderNumberField('Total Reviews', 'reviewCount')}
          {renderTextField('Review Source', 'source', 'Verified Purchases')}
        </div>
      )}

      {/* Review Grid */}
      {widget.type === 'review-grid' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Real Results From Real Women')}
          {renderTextField('Subheading', 'subheading', 'Join thousands who have transformed their health')}
          {renderTextField('Button Text', 'buttonText', 'Try It Now →')}
          {renderTextField('Button URL', 'buttonUrl', 'https://kialanutrition.com/products/kiala-greens')}
          {renderSelectField('Open in', 'target', [
            { value: '_self', label: 'Same tab' },
            { value: '_blank', label: 'New tab' }
          ])}

          {/* Editable Reviews */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Reviews (4 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const reviews = (widget.config.reviews || []) as any[];
                  onUpdate({ reviews: [...reviews, { name: '', title: '', review: '', image: '', bottomImage: '', rating: 5, verified: true }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Review
              </button>
            </div>
            {((widget.config.reviews || []) as any[]).map((review: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Review {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const reviews = [...(widget.config.reviews || []) as any[]];
                      reviews.splice(idx, 1);
                      onUpdate({ reviews });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={review.name || ''}
                      onChange={(e) => {
                        const reviews = [...(widget.config.reviews || []) as any[]];
                        reviews[idx] = { ...reviews[idx], name: e.target.value };
                        onUpdate({ reviews });
                      }}
                      placeholder="Jennifer M."
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rating (1-5)</label>
                    <select
                      value={review.rating || 5}
                      onChange={(e) => {
                        const reviews = [...(widget.config.reviews || []) as any[]];
                        reviews[idx] = { ...reviews[idx], rating: parseInt(e.target.value) };
                        onUpdate({ reviews });
                      }}
                      className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Review Title</label>
                  <input
                    type="text"
                    value={review.title || ''}
                    onChange={(e) => {
                      const reviews = [...(widget.config.reviews || []) as any[]];
                      reviews[idx] = { ...reviews[idx], title: e.target.value };
                      onUpdate({ reviews });
                    }}
                    placeholder="Finally flat stomach!"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Review Text</label>
                  <textarea
                    value={review.review || ''}
                    onChange={(e) => {
                      const reviews = [...(widget.config.reviews || []) as any[]];
                      reviews[idx] = { ...reviews[idx], review: e.target.value };
                      onUpdate({ reviews });
                    }}
                    placeholder="The bloating I had for years is completely gone..."
                    rows={2}
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Profile Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={review.image || ''}
                        onChange={(e) => {
                          const reviews = [...(widget.config.reviews || []) as any[]];
                          reviews[idx] = { ...reviews[idx], image: e.target.value };
                          onUpdate({ reviews });
                        }}
                        placeholder="https://..."
                        className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveImageField(`reviews.${idx}.image`);
                          setMediaLibraryOpen(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 px-3 rounded text-gray-700"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bottom Image (optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={review.bottomImage || ''}
                        onChange={(e) => {
                          const reviews = [...(widget.config.reviews || []) as any[]];
                          reviews[idx] = { ...reviews[idx], bottomImage: e.target.value };
                          onUpdate({ reviews });
                        }}
                        placeholder="https://..."
                        className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveImageField(`reviews.${idx}.bottomImage`);
                          setMediaLibraryOpen(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 px-3 rounded text-gray-700"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={review.verified !== false}
                      onChange={(e) => {
                        const reviews = [...(widget.config.reviews || []) as any[]];
                        reviews[idx] = { ...reviews[idx], verified: e.target.checked };
                        onUpdate({ reviews });
                      }}
                      className="rounded"
                    />
                    Verified Purchase
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Press Logos */}
      {widget.type === 'press-logos' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'As Featured In')}

          {/* Editable Press Items */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Press Items (6 recommended)</label>
              <button
                type="button"
                onClick={() => {
                  const items = (widget.config.items || []) as any[];
                  onUpdate({ items: [...items, { publication: '', quote: '', logo: '' }] });
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Press Item
              </button>
            </div>
            {((widget.config.items || []) as any[]).map((item: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Press Item {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(widget.config.items || []) as any[]];
                      items.splice(idx, 1);
                      onUpdate({ items });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Publication Name</label>
                  <input
                    type="text"
                    value={item.publication || ''}
                    onChange={(e) => {
                      const items = [...(widget.config.items || []) as any[]];
                      items[idx] = { ...items[idx], publication: e.target.value };
                      onUpdate({ items });
                    }}
                    placeholder="Forbes"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Quote</label>
                  <input
                    type="text"
                    value={item.quote || ''}
                    onChange={(e) => {
                      const items = [...(widget.config.items || []) as any[]];
                      items[idx] = { ...items[idx], quote: e.target.value };
                      onUpdate({ items });
                    }}
                    placeholder='"A game-changer for women&apos;s health"'
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Logo Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.logo || ''}
                      onChange={(e) => {
                        const items = [...(widget.config.items || []) as any[]];
                        items[idx] = { ...items[idx], logo: e.target.value };
                        onUpdate({ items });
                      }}
                      placeholder="Upload or paste URL"
                      className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageField(`items.${idx}.logo`);
                        setMediaLibraryOpen(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 px-3 rounded text-gray-700"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Leave empty to display publication name as text</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrolling Thumbnails */}
      {widget.type === 'scrolling-thumbnails' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Join 1,000,000+ Happy Customers')}
          {renderNumberField('Image Size (px)', 'imageHeight', 50, 300, '200')}
          {renderNumberField('Scroll Speed', 'speed', 10, 100, '30')}
          <ImageGalleryField label="Customer Photos" field="customImages" />
          <p className="text-xs text-gray-500">Upload customer photos for the scrolling gallery. Only your uploaded photos will be shown (stock photos only appear if no images uploaded).</p>
        </div>
      )}

      {/* Testimonial Hero - No CTA */}
      {widget.type === 'testimonial-hero-no-cta' && (
        <div className="space-y-4">
          {renderImageField('Testimonial Photo', 'image')}
          {renderTextField('Title', 'headline', 'I Lost 22 lbs and My Energy is Through the Roof!')}
          {renderTextAreaField('Testimonial Body', 'body', 'Full testimonial text...', 6)}
        </div>
      )}

      {/* Testimonial Hero - With CTA */}
      {widget.type === 'testimonial-hero' && (
        <div className="space-y-4">
          {renderImageField('Testimonial Photo', 'image')}
          {renderTextField('Title', 'headline', 'I Lost 22 lbs and My Energy is Through the Roof!')}
          {renderTextAreaField('Testimonial Body', 'body', 'Full testimonial text...', 6)}
          {renderTextField('Button Text', 'buttonText', 'TRY NOW - SAVE 50%')}

          {/* CTA Type Selection */}
          {renderSelectField('Button Action', 'ctaType', [
            { value: 'external', label: 'Link to URL' },
            { value: 'anchor', label: 'Jump to Widget on Page' }
          ])}

          {/* Show URL field if external link */}
          {(widget.config.ctaType !== 'anchor') && (
            <>
              {renderTextField('Button URL', 'buttonUrl', 'https://kialanutrition.com/products/kiala-greens')}
              {renderSelectField('Open in', 'target', [
                { value: '_self', label: 'Same tab' },
                { value: '_blank', label: 'New tab' }
              ])}
            </>
          )}

          {/* Show widget selector if anchor link */}
          {widget.config.ctaType === 'anchor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
              <select
                value={widget.config.anchorWidgetId || ''}
                onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a widget...</option>
                {allWidgets
                  .filter((w: Widget) => w.id !== widget.id && w.enabled)
                  .sort((a: Widget, b: Widget) => a.position - b.position)
                  .map((w: Widget) => (
                    <option key={w.id} value={w.id}>
                      {getWidgetDisplayName(w)} (Position {w.position + 1})
                    </option>
                  ))
                }
              </select>
              <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
            </div>
          )}

          <p className="text-xs text-gray-500">Benefit icons (90-day guarantee, no risk, free gifts) are shown by default.</p>
        </div>
      )}

      {/* Opening Hook */}
      {widget.type === 'opening-hook' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Attention-grabbing headline')}
          {renderTextAreaField('Hook Text', 'content', 'Your compelling opening...', 4)}
          {renderImageField('Supporting Image', 'image')}
        </div>
      )}

      {/* Main Content */}
      {widget.type === 'main-content' && (
        <div className="space-y-4">
          {renderTextField('Section Title', 'headline', 'Section headline')}
          {renderTextAreaField('Content (HTML)', 'content', 'Main content...', 8)}
          <ImageGalleryField label="Inline Images" field="images" />
        </div>
      )}

      {/* Final CTA */}
      {widget.type === 'final-cta' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Ready to Transform?')}
          {renderTextAreaField('Description', 'description', 'Final call to action message...', 3)}
          {renderImageField('CTA Image', 'image')}
          {renderTextField('Button Text', 'buttonText', 'Get Started Now →')}
          {renderTextField('Button URL', 'buttonUrl', '/checkout')}
        </div>
      )}

      {widget.type === 'poll' && (
        <div className="space-y-4">
          {renderTextField('Question', 'question', 'What is your biggest health challenge?')}

          {/* Poll Options Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Poll Options</label>
            <div className="space-y-3">
              {(widget.config.options || []).map((option: any, idx: number) => (
                <div key={option.id || idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex gap-3 items-start">
                    <span className="text-gray-500 font-medium text-sm pt-2">{idx + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const updated = [...(widget.config.options || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          onUpdate({ options: updated });
                        }}
                        placeholder="Option label"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Votes</label>
                          <input
                            type="number"
                            value={option.votes}
                            onChange={(e) => {
                              const updated = [...(widget.config.options || [])];
                              updated[idx] = { ...updated[idx], votes: parseInt(e.target.value) || 0 };
                              onUpdate({ options: updated });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">% (optional)</label>
                          <input
                            type="number"
                            value={option.percentage || ''}
                            onChange={(e) => {
                              const updated = [...(widget.config.options || [])];
                              updated[idx] = { ...updated[idx], percentage: e.target.value ? parseInt(e.target.value) : undefined };
                              onUpdate({ options: updated });
                            }}
                            placeholder="Auto"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (widget.config.options || []).filter((_: any, i: number) => i !== idx);
                        onUpdate({ options: updated });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...(widget.config.options || [])];
                  updated.push({
                    id: `option-${Date.now()}`,
                    label: 'New option',
                    votes: 0
                  });
                  onUpdate({ options: updated });
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>
          </div>

          {renderTextField('Total Votes', 'totalVotes', '12447')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results Message</label>
            <textarea
              value={widget.config.resultsMessage || ''}
              onChange={(e) => onUpdate({ resultsMessage: e.target.value })}
              placeholder="You're not alone! {winner_percentage}% chose the same answer."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Variables: {'{winner_percentage}'}, {'{winner_label}'}, {'{total_votes}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={widget.config.style || 'default'}
              onChange={(e) => onUpdate({ style: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="default">Default</option>
              <option value="highlighted">Highlighted (purple gradient)</option>
              <option value="results-only">Results Only (no voting)</option>
            </select>
          </div>

          {renderTextField('Source', 'source', 'Dr. Amy Heart Community Survey, 2024')}

          {/* CTA Section */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <input
                type="checkbox"
                checked={widget.config.showCta || false}
                onChange={(e) => onUpdate({ showCta: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show CTA Button after voting
            </label>
            {widget.config.showCta && (
              <div className="space-y-3 pl-6">
                {renderTextField('CTA Text', 'ctaText', 'See The Solution →')}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                  <select
                    value={widget.config.ctaType || 'external'}
                    onChange={(e) => onUpdate({ ctaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="external">Link to URL</option>
                    <option value="anchor">Jump to Widget on Page</option>
                  </select>
                </div>

                {widget.config.ctaType !== 'anchor' && (
                  <>
                    {renderTextField('CTA URL', 'ctaUrl', 'https://kialanutrition.com')}
                    {renderSelectField('Open in', 'target', [
                      { value: '_self', label: 'Same tab' },
                      { value: '_blank', label: 'New tab' }
                    ])}
                  </>
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {widget.type === 'community-survey-results' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'Community Survey Results')}
          {renderTextField('Subheading', 'subheading', 'Based on feedback from verified community members')}

          {/* Results Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Survey Results</label>
            <div className="space-y-3">
              {(widget.config.results || []).map((result: any, idx: number) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={result.label}
                        onChange={(e) => {
                          const updated = [...(widget.config.results || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          onUpdate({ results: updated });
                        }}
                        placeholder="Result label"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={result.percentage}
                            onChange={(e) => {
                              const updated = [...(widget.config.results || [])];
                              updated[idx] = { ...updated[idx], percentage: parseInt(e.target.value) || 0 };
                              onUpdate({ results: updated });
                            }}
                            placeholder="78"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          />
                        </div>
                        <span className="text-gray-500">%</span>
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={result.highlighted || false}
                            onChange={(e) => {
                              const updated = [...(widget.config.results || [])];
                              updated[idx] = { ...updated[idx], highlighted: e.target.checked };
                              onUpdate({ results: updated });
                            }}
                            className="rounded border-gray-300"
                          />
                          Highlight
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (widget.config.results || []).filter((_: any, i: number) => i !== idx);
                        onUpdate({ results: updated });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...(widget.config.results || [])];
                  updated.push({ label: 'New result', percentage: 50, highlighted: false });
                  onUpdate({ results: updated });
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Result
              </button>
            </div>
          </div>

          {renderTextField('Total Respondents', 'totalRespondents', '10,000+')}
          {renderTextField('Source', 'source', 'Dr. Amy Heart Community Challenge, 2024')}
          {renderTextAreaField('Highlight Text', 'highlightText', 'Compare that 83% to the 8% who succeed with traditional New Year resolutions.', 2)}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={widget.config.style || 'default'}
              onChange={(e) => onUpdate({ style: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="default">Default (list view)</option>
              <option value="compact">Compact (grid)</option>
              <option value="featured">Featured (gradient header)</option>
            </select>
          </div>

          {/* CTA Section */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <input
                type="checkbox"
                checked={widget.config.showCta || false}
                onChange={(e) => onUpdate({ showCta: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show CTA Button
            </label>
            {widget.config.showCta && (
              <div className="space-y-3 pl-6">
                {renderTextField('CTA Text', 'ctaText', 'See How They Did It →')}
                {renderTextField('CTA Subtext (small text below button)', 'ctaSubtext', 'Join thousands of women over 40...')}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                  <select
                    value={widget.config.ctaType || 'external'}
                    onChange={(e) => onUpdate({ ctaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="external">Link to URL</option>
                    <option value="anchor">Jump to Widget on Page</option>
                  </select>
                </div>

                {widget.config.ctaType !== 'anchor' && (
                  <>
                    {renderTextField('CTA URL', 'ctaUrl', 'https://kialanutrition.com')}
                    {renderSelectField('Open in', 'target', [
                      { value: '_self', label: 'Same tab' },
                      { value: '_blank', label: 'New tab' }
                    ])}
                  </>
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {widget.type === 'product-reveal' && (
        <div className="space-y-4">
          {renderTextField('Headline', 'headline', 'After Months of Research, I Found It')}
          {renderTextField('Subheadline', 'subheadline', 'The one formula I can confidently recommend')}
          {renderTextField('Badge', 'badge', "Doctor's #1 Pick")}
          {renderTextField('Product Name', 'productName', 'Product Name')}
          {renderTextAreaField('Product Description', 'productDescription', 'A clinically-backed formula...', 3)}

          {/* Product Images - Carousel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (for carousel)</label>
            <div className="space-y-2">
              {(widget.config.productImages || [widget.config.productImage] || []).filter(Boolean).map((img: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const images = [...(widget.config.productImages || [widget.config.productImage] || [])].filter(Boolean);
                      images[idx] = e.target.value;
                      onUpdate({ productImages: images, productImage: images[0] });
                    }}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const images = (widget.config.productImages || [widget.config.productImage] || []).filter(Boolean).filter((_: any, i: number) => i !== idx);
                      onUpdate({ productImages: images, productImage: images[0] || '' });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const images = [...(widget.config.productImages || [widget.config.productImage] || [])].filter(Boolean);
                  images.push('');
                  onUpdate({ productImages: images });
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Add multiple images to show a thumbnail carousel below the main image</p>
          </div>

          {renderTextAreaField('Doctor Quote', 'doctorQuote', "In 15 years of practice, I've never endorsed a specific supplement—until now.", 3)}

          <div className="grid grid-cols-2 gap-3">
            {renderTextField('Rating', 'rating', '4.8')}
            {renderTextField('Review Count', 'reviewCount', '10,000+')}
          </div>

          {/* Key Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Benefits</label>
            <div className="space-y-2">
              {(widget.config.keyBenefits || []).map((benefit: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const updated = [...(widget.config.keyBenefits || [])];
                      updated[idx] = e.target.value;
                      onUpdate({ keyBenefits: updated });
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (widget.config.keyBenefits || []).filter((_: any, i: number) => i !== idx);
                      onUpdate({ keyBenefits: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...(widget.config.keyBenefits || []), 'New benefit'];
                  onUpdate({ keyBenefits: updated });
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Benefit
              </button>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Proof Stats</label>
            <div className="space-y-2">
              {(widget.config.socialProofStats || []).map((stat: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...(widget.config.socialProofStats || [])];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      onUpdate({ socialProofStats: updated });
                    }}
                    placeholder="83%"
                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const updated = [...(widget.config.socialProofStats || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      onUpdate({ socialProofStats: updated });
                    }}
                    placeholder="still taking after 60 days"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (widget.config.socialProofStats || []).filter((_: any, i: number) => i !== idx);
                      onUpdate({ socialProofStats: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [...(widget.config.socialProofStats || []), { value: '', label: '' }];
                  onUpdate({ socialProofStats: updated });
                }}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            </div>
          </div>

          {renderTextField('CTA Text', 'ctaText', 'Learn More →')}
          {renderTextField('CTA URL', 'ctaUrl', '#')}

          {/* Community Exclusive */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <input
                type="checkbox"
                checked={widget.config.communityExclusive !== false}
                onChange={(e) => onUpdate({ communityExclusive: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show "Community Exclusive" badge
            </label>
            {widget.config.communityExclusive !== false && (
              <div className="pl-6">
                {renderTextField('Exclusive Text', 'communityExclusiveText', 'Exclusive to our community members')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist Widget */}
      {widget.type === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-rose-800">
              <strong>Interactive Checklist:</strong> Users can check items. When threshold is hit, an alert appears with optional CTA.
            </p>
          </div>

          {renderTextField('Headline', 'headline', 'Signs Your Foundation Needs Support')}
          {renderTextField('Subheading', 'subheading', 'Check all that apply to you')}

          {renderSelectField('Style', 'style', [
            { value: 'assessment', label: 'Assessment (with alert threshold)' },
            { value: 'interactive', label: 'Interactive (checkable, no alert)' },
            { value: 'default', label: 'Static (non-interactive)' }
          ])}

          {/* Checklist Items Editor */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-800">Checklist Items</label>
              <button
                type="button"
                onClick={() => {
                  const items = [...(widget.config.items || [])];
                  items.push({ id: `item-${Date.now()}`, text: 'New item', checked: false });
                  onUpdate({ items });
                }}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {(widget.config.items || []).map((item: any, idx: number) => (
                <div key={item.id || idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-gray-400 text-sm w-6">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const items = [...(widget.config.items || [])];
                      items[idx] = { ...items[idx], text: e.target.value };
                      onUpdate({ items });
                    }}
                    placeholder="Checklist item text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const items = (widget.config.items || []).filter((_: any, i: number) => i !== idx);
                      onUpdate({ items });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(widget.config.items || []).length === 0 && (
                <p className="text-xs text-gray-500 italic p-2">No items yet. Add checklist items above.</p>
              )}
            </div>
          </div>

          {/* Alert Settings - only for assessment style */}
          {widget.config.style === 'assessment' && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Alert Settings</label>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alert Threshold (items checked)</label>
                  <input
                    type="number"
                    value={widget.config.alertThreshold || 3}
                    onChange={(e) => onUpdate({ alertThreshold: parseInt(e.target.value) || 3 })}
                    min={1}
                    max={widget.config.items?.length || 10}
                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert appears when user checks this many items</p>
                </div>
                {renderTextField('Alert Headline', 'alertHeadline', "⚠️ You've hit the threshold!")}
                {renderTextAreaField('Alert Message', 'alertMessage', "With this many signs, it's time to take action.", 2)}
              </div>
            </div>
          )}

          {renderTextAreaField('Footer Text (optional)', 'footer', 'Optional footer message...', 2)}

          {/* CTA Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <input
                type="checkbox"
                checked={widget.config.showCta || false}
                onChange={(e) => onUpdate({ showCta: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show CTA Button {widget.config.style === 'assessment' ? '(appears in alert)' : ''}
            </label>
            {widget.config.showCta && (
              <div className="space-y-3 pl-6">
                {renderTextField('CTA Text', 'ctaText', 'See The Solution →')}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Action</label>
                  <select
                    value={widget.config.ctaType || 'external'}
                    onChange={(e) => onUpdate({ ctaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="external">Link to URL</option>
                    <option value="anchor">Jump to Widget on Page</option>
                  </select>
                </div>

                {widget.config.ctaType !== 'anchor' && (
                  <>
                    {renderTextField('CTA URL', 'ctaUrl', 'https://kialanutrition.com')}
                    {renderSelectField('Open in', 'target', [
                      { value: '_self', label: 'Same tab' },
                      { value: '_blank', label: 'New tab' }
                    ])}
                  </>
                )}

                {widget.config.ctaType === 'anchor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jump to Widget</label>
                    <select
                      value={widget.config.anchorWidgetId || ''}
                      onChange={(e) => onUpdate({ anchorWidgetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a widget...</option>
                      {allWidgets
                        .filter((w: Widget) => w.id !== widget.id && w.enabled)
                        .sort((a: Widget, b: Widget) => a.position - b.position)
                        .map((w: Widget) => (
                          <option key={w.id} value={w.id}>
                            {getWidgetDisplayName(w)} (Position {w.position + 1})
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Button will smoothly scroll to the selected widget</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {widget.type === 'two-approaches' && (
        <div className="space-y-6">
          {renderTextField('Headline', 'headline', 'Two Paths Forward')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select
              value={widget.config.style || 'contrast'}
              onChange={(e) => onUpdate({ style: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="contrast">Contrast (red vs green)</option>
              <option value="gradient">Gradient (gray vs brand)</option>
              <option value="default">Default (minimal)</option>
            </select>
          </div>

          {/* Left Column */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-900 mb-3">Left Column (The "Wrong" Way)</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={widget.config.leftColumn?.header || ''}
                onChange={(e) => onUpdate({
                  leftColumn: { ...widget.config.leftColumn, header: e.target.value }
                })}
                placeholder="Header (e.g., The Old Way)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={widget.config.leftColumn?.subheader || ''}
                onChange={(e) => onUpdate({
                  leftColumn: { ...widget.config.leftColumn, subheader: e.target.value }
                })}
                placeholder="Subheader"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Items</label>
                {(widget.config.leftColumn?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const items = [...(widget.config.leftColumn?.items || [])];
                        items[idx] = { ...items[idx], text: e.target.value };
                        onUpdate({ leftColumn: { ...widget.config.leftColumn, items } });
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = (widget.config.leftColumn?.items || []).filter((_: any, i: number) => i !== idx);
                        onUpdate({ leftColumn: { ...widget.config.leftColumn, items } });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(widget.config.leftColumn?.items || []), { text: 'New item', negative: true }];
                    onUpdate({ leftColumn: { ...widget.config.leftColumn, items } });
                  }}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <input
                type="text"
                value={widget.config.leftColumn?.result || ''}
                onChange={(e) => onUpdate({
                  leftColumn: { ...widget.config.leftColumn, result: e.target.value }
                })}
                placeholder="Result (e.g., 92% fail by March)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3">Right Column (The "Right" Way)</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={widget.config.rightColumn?.header || ''}
                onChange={(e) => onUpdate({
                  rightColumn: { ...widget.config.rightColumn, header: e.target.value }
                })}
                placeholder="Header (e.g., The New Way)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={widget.config.rightColumn?.subheader || ''}
                onChange={(e) => onUpdate({
                  rightColumn: { ...widget.config.rightColumn, subheader: e.target.value }
                })}
                placeholder="Subheader"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Items</label>
                {(widget.config.rightColumn?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const items = [...(widget.config.rightColumn?.items || [])];
                        items[idx] = { ...items[idx], text: e.target.value };
                        onUpdate({ rightColumn: { ...widget.config.rightColumn, items } });
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = (widget.config.rightColumn?.items || []).filter((_: any, i: number) => i !== idx);
                        onUpdate({ rightColumn: { ...widget.config.rightColumn, items } });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const items = [...(widget.config.rightColumn?.items || []), { text: 'New item', positive: true }];
                    onUpdate({ rightColumn: { ...widget.config.rightColumn, items } });
                  }}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <input
                type="text"
                value={widget.config.rightColumn?.result || ''}
                onChange={(e) => onUpdate({
                  rightColumn: { ...widget.config.rightColumn, result: e.target.value }
                })}
                placeholder="Result (e.g., 83% still going at 60 days)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WidgetPreview({ widget }: { widget: Widget }) {
  // This would render the actual widget component for preview
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-sm text-gray-600 mb-2">
        {widgetTypes.find(wt => wt.type === widget.type)?.name} Preview
      </div>
      <div className="text-xs text-gray-500">
        {widget.config.headline || widget.config.content?.substring(0, 100) || 'Widget content preview would appear here'}
      </div>
    </div>
  );
}

function getDefaultConfig(type: WidgetType): WidgetConfig {
  const defaults: Record<WidgetType, WidgetConfig> = {
    'text-block': {
      content: '<p class="text-lg leading-relaxed text-gray-700 mb-6">Enter your content here...</p>'
    },
    'product-showcase': {
      headline: "Dr. Heart's #1 Recommendation",
      buttonText: 'Shop Now →',
      size: 'medium',
      target: '_self'
    },
    'countdown-timer': {
      headline: 'Limited Time Offer',
      subheading: 'Special pricing ends soon',
      timer: 86400000, // 24 hours
      buttonText: 'Claim Discount Now',
      style: 'default'
    },
    'email-capture': {
      headline: 'Want More Health Tips?',
      subheading: 'Join thousands getting weekly wellness insights',
      buttonText: 'Subscribe'
    },
    'cta-button': {
      buttonText: 'Take Action Now →',
      buttonUrl: '#',
      target: '_self'
    },
    'testimonial': {
      headline: 'Success Stories',
      subheading: 'Real results from real women'
    },
    'comparison-table': {
      headline: 'How Our Solution Compares',
      buttonText: 'Choose the Better Option →',
      target: '_self'
    },
    'rating-stars': {
      headline: 'Customer Reviews'
    },
    // New widget defaults
    'before-after-comparison': {
      name: 'Sarah M.',
      age: '52',
      location: 'Austin, TX',
      result: 'Lost 23 lbs & More Energy Than Ever',
      timeframe: '12 weeks',
      testimonial: "I can't believe this is me! After following the protocol, I feel like I've turned back the clock 10 years."
    },
    'top-ten-list': {
      headline: "Dr. Heart's Daily Routine",
      subheading: 'Follow these steps for optimal health',
      buttonText: 'Download the Full Protocol →'
    },
    'expectation-timeline': {
      headline: 'Your Transformation Timeline',
      subheading: 'What to expect when you start',
      buttonText: 'Start Your Journey →'
    },
    'special-offer': {
      headline: 'EXCLUSIVE READER OFFER',
      subheading: 'Unlock Your Complete Kit',
      buttonText: 'Claim Your Spot Now →',
      target: '_self'
    },
    'exclusive-product': {
      headline: '#1 Recommendation',
      buttonText: 'Get Instant Access →',
      target: '_self'
    },
    'dual-offer-comparison': {
      headline: 'Choose Your Path',
      subheading: 'Select the option that fits your goals'
    },
    'stacked-quotes': {
      headline: 'Real Results from Real Women',
      subheading: 'Join thousands who have transformed their health',
      reviewCount: '1.2M',
      showVerifiedBadge: true,
      showEmailCapture: false,
      quotes: [
        {
          id: '1',
          name: 'Sarah M.',
          location: 'Austin, TX',
          result: 'Lost 23 lbs',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "After following Dr. Heart's protocol for just 8 weeks, I've lost 23 pounds and feel more energetic than I have in years. My husband says I'm like a different person!",
          verified: true
        },
        {
          id: '2',
          name: 'Jennifer K.',
          location: 'Phoenix, AZ',
          result: 'Energy restored',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "I was skeptical at first, but the transformation has been incredible. My energy levels have completely changed - I went from barely making it through the day to having energy to spare.",
          verified: true
        },
        {
          id: '3',
          name: 'Michelle R.',
          location: 'Seattle, WA',
          result: 'Hormones balanced',
          image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "Finally, something that actually works! After years of trying different approaches, this protocol balanced my hormones naturally. No more mood swings, no more brain fog. I feel like myself again.",
          verified: true
        },
        {
          id: '4',
          name: 'Lisa T.',
          location: 'Denver, CO',
          result: 'Better sleep',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "The sleep improvements alone were worth it. I'm falling asleep faster, staying asleep all night, and waking up actually refreshed. I didn't know I could feel this good at 55!",
          verified: true
        }
      ]
    },
    'faq-accordion': {
      headline: 'Frequently Asked Questions',
      subheading: 'Everything you need to know'
    },
    'shop-now': {
      name: 'Kiala Greens',
      description: 'The all-in-one solution for naturally balancing your hormones and boosting your metabolism after 40.',
      images: [],
      rating: 4.7,
      reviewCount: '1.2M',
      lovedByCount: '1,000,000+',
      // Doctor header props
      doctorName: 'Dr. Amy',
      doctorImage: '', // Set via admin
      badgeText: '#1 BEST SELLER',
      pricingOptions: [
        {
          id: 'single',
          label: 'Buy 1 Get 1 FREE',
          quantity: 1,
          price: 97,
          originalPrice: 167,
          perUnit: 97,
          savings: 'Save $70',
          gifts: [{ name: 'Free Shipping', value: '$10.00' }],
          url: ''
        },
        {
          id: 'double',
          label: 'Buy 2 Get 2 FREE',
          quantity: 2,
          price: 167,
          originalPrice: 287,
          perUnit: 83.50,
          savings: 'Save $120',
          popular: true,
          gifts: [
            { name: 'Free Shipping', value: '$10.00' },
            { name: 'Free Frother', value: '$10.00' }
          ],
          url: ''
        },
        {
          id: 'triple',
          label: 'Buy 3 Get 3 FREE',
          quantity: 3,
          price: 227,
          originalPrice: 377,
          perUnit: 75.67,
          savings: 'Save $150',
          gifts: [
            { name: 'Free Shipping', value: '$10.00' },
            { name: 'Free Frother', value: '$10.00' },
            { name: 'Free Wellness Guide', value: '$10.00' }
          ],
          url: ''
        }
      ],
      benefits: [
        'Clinically-backed hormone support formula',
        '90-day transformation protocol',
        'Complete meal plan & recipes',
        'Weekly coaching video series',
        'Private community access'
      ],
      benefitsRow2: [],
      ctaText: 'START NOW',
      ctaUrl: 'https://trygreens.com/dr-amy',
      target: '_blank',
      guaranteeText: '90-Day Money-Back Guarantee',
      showTestimonial: true,
      testimonialQuote: 'This completely changed my energy levels and mood. I feel like myself again after just 3 weeks!',
      testimonialName: 'Sarah M., 47',
      testimonialAvatar: '' // Set via admin
    },
    'data-overview': {
      headline: 'The Numbers Speak',
      subheading: 'Why this matters for women over 40',
      source: 'Journal of Clinical Endocrinology, 2023',
      style: 'cards',
      stats: [
        {
          value: '96%',
          label: 'of women over 40 experience hormonal imbalance symptoms',
          icon: 'users'
        },
        {
          value: '73%',
          label: "don't know the cause of their fatigue and weight gain",
          icon: 'alert'
        },
        {
          value: '45',
          label: 'average age when symptoms typically begin',
          icon: 'clock'
        },
        {
          value: '15%',
          label: 'lose weight successfully without addressing hormone health first',
          icon: 'trending'
        }
      ]
    },
    'symptoms-checker': {
      headline: 'Are These Your Symptoms?',
      subheading: 'Check the symptoms you\'re currently experiencing',
      minSymptoms: 3,
      conclusionHeadline: 'If you checked 3 or more, this article was written for YOU',
      conclusionText: "These symptoms aren't just \"part of getting older\" — they're signs of hormonal imbalance that can be addressed naturally.",
      symptoms: [
        { text: 'Unexplained weight gain, especially around the midsection', category: 'Metabolism' },
        { text: "Constant fatigue, even after a full night's sleep", category: 'Energy' },
        { text: 'Mood swings, irritability, or feeling "off"', category: 'Mood' },
        { text: 'Difficulty concentrating or "brain fog"', category: 'Mental' },
        { text: 'Hot flashes or night sweats', category: 'Hormones' },
        { text: 'Trouble falling or staying asleep', category: 'Sleep' },
        { text: 'Low libido or changes in intimate health', category: 'Hormones' },
        { text: 'Cravings for sugar or carbs', category: 'Metabolism' },
        { text: 'Thinning hair or dry skin', category: 'Physical' },
        { text: 'Feeling anxious or overwhelmed more than usual', category: 'Mood' }
      ]
    },
    // Existing empty defaults
    'hero-story': {},
    'article-grid': {},
    'trust-badges': {},
    'social-proof': {},
    'top-recommendations': {},
    'before-after': {},
    'media-block': {},
    'price-comparison': {},
    'bundle-offer': {},
    'popup-trigger': {},
    // New widget types
    'before-after-side-by-side': {
      headline: 'Real Results From Real Women',
      name: 'Sarah M.',
      age: '52',
      location: 'Austin, TX',
      beforeLabel: 'BEFORE',
      afterLabel: 'AFTER',
      timeframe: '12 weeks',
      style: 'detailed'
    },
    'timeline': {
      headline: 'Your Transformation Timeline',
      subheading: 'What to expect when you start the Hormone Reset Protocol',
      weeksTotal: '12',
      successStories: '10k+',
      resultsPercent: '94%',
      ctaText: 'Start Your Journey Today →',
      ctaUrl: '#',
      steps: [
        {
          period: 'Week 1-2',
          title: 'Initial Reset',
          description: 'Your body begins adjusting to the new protocol',
          benefits: ['Reduced bloating', 'Better sleep quality', 'Less brain fog'],
          icon: 'zap'
        },
        {
          period: 'Week 3-4',
          title: 'Energy Surge',
          description: 'Noticeable improvements in daily energy levels',
          benefits: ['Sustained energy all day', 'Fewer cravings', 'Improved mood'],
          icon: 'trending'
        },
        {
          period: 'Week 5-8',
          title: 'Deep Transformation',
          description: 'Hormones begin to balance naturally',
          benefits: ['Weight loss begins', 'Better metabolism', 'Clearer skin'],
          icon: 'heart'
        },
        {
          period: 'Week 9-12',
          title: 'Full Results',
          description: 'Complete hormone optimization achieved',
          benefits: ['Optimal hormone levels', 'Sustained weight loss', 'Vibrant health'],
          icon: 'star'
        }
      ]
    },
    'top-ten': {
      headline: "Top 10 Recommendations",
      subheading: 'Expert-backed tips',
      style: 'numbered'
    },
    'guarantee-box': {
      headline: 'Money-Back Guarantee',
      description: 'Try risk-free',
      style: 'bordered'
    },
    'faq': {
      headline: 'Frequently Asked Questions',
      subheading: 'Everything you need to know',
      style: 'accordion'
    },
    'video-embed': {
      headline: 'Watch This',
      style: 'featured'
    },
    'review-grid': {
      headline: 'Real Results From Real Women',
      subheading: 'Join thousands who have transformed their health',
      buttonText: 'Try It Now →',
      buttonUrl: 'https://kialanutrition.com/products/kiala-greens',
      target: '_self',
      reviews: [
        {
          name: 'Jennifer M.',
          verified: true,
          rating: 5,
          title: 'Finally flat stomach!',
          review: 'The bloating I had for years is completely gone. I feel lighter and my clothes fit so much better!',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face'
        },
        {
          name: 'Sarah K.',
          verified: true,
          rating: 5,
          title: 'Energy is through the roof',
          review: 'No more 3pm crashes. I have consistent energy all day and sleep better at night too.',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
        },
        {
          name: 'Michelle R.',
          verified: true,
          rating: 5,
          title: 'Lost 15 lbs in 8 weeks',
          review: "The stubborn belly fat that wouldn't budge for years finally started coming off!",
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
        },
        {
          name: 'Linda P.',
          verified: true,
          rating: 5,
          title: 'Brain fog is GONE',
          review: 'I can think clearly again. My focus and memory are so much better. Game changer!',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'
        }
      ]
    },
    'press-logos': {
      headline: 'As Featured In',
      items: [
        { logo: '', publication: 'Forbes', quote: '"A game-changer for women\'s health"' },
        { logo: '', publication: 'Vogue', quote: '"The greens powder that\'s taking over wellness"' },
        { logo: '', publication: 'Cosmopolitan', quote: '"The viral supplement that actually works"' },
        { logo: '', publication: 'Elle', quote: '"Every woman over 40 needs this"' },
        { logo: '', publication: 'Today Show', quote: '"The wellness trend doctors are recommending"' },
        { logo: '', publication: 'Glamour', quote: '"Backed by science, loved by women"' }
      ]
    },
    'scrolling-thumbnails': {
      headline: 'Join 1,000,000+ Happy Customers',
      speed: 30,
      imageHeight: 200,
      customImages: []
    },
    'testimonial-hero-no-cta': {
      headline: 'I Lost 22 lbs and My Energy is Through the Roof!',
      body: `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."

— Jennifer M., 52, Austin TX`
    },
    'testimonial-hero': {
      headline: 'I Lost 22 lbs and My Energy is Through the Roof!',
      body: `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."

— Jennifer M., 52, Austin TX`,
      buttonText: 'TRY NOW - SAVE 50%',
      buttonUrl: 'https://kialanutrition.com/products/kiala-greens',
      target: '_self',
      benefits: [
        '90-Day Money Back Guarantee',
        'No Risk',
        'Free Gifts Included'
      ]
    },
    'hero-image': {
      headline: 'Your Headline Here',
      buttonText: 'Learn More'
    },
    'ingredient-list-grid': {
      headline: 'Powerful Ingredients, Proven Results',
      bannerText: '✨ 6 Clinically-Backed Superfoods in Every Scoop',
      columns: 3,
      ingredients: [
        { name: 'Ashwagandha', description: 'Adaptogen that helps balance cortisol levels and reduce stress-related weight gain', image: '' },
        { name: 'Maca Root', description: 'Peruvian superfood that supports hormone balance and boosts energy naturally', image: '' },
        { name: 'Spirulina', description: 'Nutrient-dense blue-green algae packed with protein and essential vitamins', image: '' },
        { name: 'Chlorella', description: 'Powerful detoxifier that helps remove toxins and supports cellular health', image: '' },
        { name: 'Green Tea Extract', description: 'Metabolism booster with antioxidants that support healthy weight management', image: '' },
        { name: 'Turmeric', description: 'Anti-inflammatory powerhouse that supports joint health and digestion', image: '' }
      ],
      showAdditional: true,
      additionalCount: 20,
      additionalText: 'hormone-supporting, gut-healing superfoods in every scoop'
    },
    'opening-hook': {
      headline: 'The Shocking Truth',
      content: ''
    },
    'main-content': {
      headline: '',
      content: ''
    },
    'final-cta': {
      headline: 'Ready to Transform?',
      buttonText: 'Get Started →'
    },
    'us-vs-them-comparison': {
      headline: 'See The Difference',
      column1Title: 'Kiala Greens',
      column1Features: [
        'Clinically validated Spectra® blend',
        'Organic, non-GMO ingredients',
        'No added sugars or artificial sweeteners',
        'Proper therapeutic dosing',
        'Delicious taste you\'ll actually enjoy',
        'Formulated specifically for women 40+'
      ],
      column2Title: 'Other Greens',
      column2Features: [
        'Unproven proprietary blends',
        'Synthetic fillers and additives',
        'Hidden sugars and sweeteners',
        'Under-dosed "pixie dust" ingredients',
        'Chalky, unpleasant taste',
        'Generic one-size-fits-all formula'
      ],
      buttonText: 'Try Kiala Greens Risk-Free →',
      buttonUrl: 'https://trygreens.com/dr-amy',
      guaranteeBadge: '90-Day Money Back Guarantee',
      satisfactionBadge: 'Dr. Amy Community Approved'
    },
    'doctor-assessment': {
      doctorName: 'Dr. Amy Heart',
      doctorImage: '/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg',
      doctorCredentials: 'Board Certified, 15+ Years Experience',
      headline: 'My Professional Assessment',
      paragraphs: [
        'In 15 years of practice, I\'ve never endorsed a specific supplement—until now.',
        'This product earned my recommendation through rigorous evaluation and consistent results.',
        'I\'ve watched women who "tried everything" finally see results.'
      ],
      signature: '— Dr. Amy Heart',
      highlightText: 'This product earned my recommendation through rigorous evaluation and consistent results.',
      badgeText: 'Professional Assessment'
    },
    'doctor-closing-word': {
      doctorName: 'Dr. Amy Heart',
      doctorImage: '/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg',
      headline: 'A Final Word From Dr. Amy',
      paragraphs: [
        'I know how frustrating this journey can be.',
        'You\'re not alone. Your body is responding to real biological changes.',
        'Give it 90 days. If it doesn\'t work for you, you get every penny back.'
      ],
      closingLine: 'Here\'s to your health,',
      signature: '— Dr. Amy Heart',
      highlightParagraph: 1
    },
    // Page-specific widgets
    'social-validation-tile': {
      headline: 'Join Our Community',
      showCommunityCount: true
    },
    'profile-hero': {
      name: 'Dr. Amy',
      tagline: 'Your trusted health advisor',
      quote: "True wellness comes from understanding your body's unique needs.",
      credentials: ['Board Certified', 'MS Nutrition', '15+ Years Experience'],
      showAudioPlayer: true
    },
    'bio-section': {
      headline: 'My Story',
      bio: 'I am dedicated to helping women achieve optimal health through evidence-based approaches.',
      showExtendedStory: true
    },
    'lead-magnet-form': {
      headline: 'Get Your Free Guide',
      subheading: 'Get instant access to my most popular health guide - absolutely free.',
      buttonText: 'Get Instant Access',
      showPdfDownload: true
    },
    'articles-header': {
      headline: 'Health Articles',
      subheading: 'Evidence-based insights for your wellness journey',
      showCommunityCount: true
    },
    'top-picks-grid': {
      showRatings: true,
      showBadges: true
    },
    'success-stories-grid': {
      showTestimonials: true,
      showBeforeAfter: true
    },
    'poll': {
      question: 'What is your biggest health challenge?',
      options: [
        { id: 'energy', label: 'Low energy', votes: 2847 },
        { id: 'sleep', label: 'Poor sleep', votes: 1923 },
        { id: 'weight', label: 'Weight management', votes: 3156 },
        { id: 'hormones', label: 'Hormonal imbalance', votes: 4521 }
      ],
      totalVotes: 12447,
      showResults: false,
      resultsMessage: "You're not alone! Thousands of women share your experience.",
      style: 'default',
      showCta: false,
      ctaText: 'See The Solution →',
      ctaUrl: '#'
    },
    'myth-buster': {
      headline: 'Myth vs. Reality',
      subheading: 'What you\'ve been told vs what\'s actually true',
      myths: [
        { myth: 'Common misconception here', truth: 'The actual truth', icon: 'brain' },
        { myth: 'Another myth people believe', truth: 'The reality is different', icon: 'heart' }
      ],
      style: 'cards',
      showCta: false,
      ctaText: 'Learn The Truth →',
      ctaUrl: '#'
    },
    'warning-box': {
      headline: 'The Cascade Nobody Warned You About',
      content: 'These signs build on each other:',
      warnings: [
        { text: 'Warning item 1', severity: 'low' },
        { text: 'Warning item 2', severity: 'medium' },
        { text: 'Warning item 3', severity: 'high' }
      ],
      footer: 'The good news? This cascade can be reversed.',
      style: 'cascade',
      showCta: false,
      ctaText: 'Break The Cycle →',
      ctaUrl: '#'
    },
    'dr-tip': {
      tip: 'Enter your professional insight here...',
      name: 'Dr. Amy Heart',
      credentials: 'MD, PhD - Hormone Specialist',
      style: 'highlighted',
      showCta: false,
      ctaText: 'Get My Protocol →',
      ctaUrl: '#'
    },
    'checklist': {
      headline: 'Signs Your Foundation Needs Support',
      subheading: 'Check all that apply to you',
      items: [
        { id: '1', text: 'First sign to check', checked: false },
        { id: '2', text: 'Second sign to check', checked: false },
        { id: '3', text: 'Third sign to check', checked: false },
        { id: '4', text: 'Fourth sign to check', checked: false },
        { id: '5', text: 'Fifth sign to check', checked: false }
      ],
      alertThreshold: 3,
      alertHeadline: "⚠️ You've hit the threshold!",
      alertMessage: "With this many signs, it's time to take action. The good news? There's a solution.",
      style: 'assessment',
      showCta: true,
      ctaText: 'See The Solution →',
      ctaUrl: '#'
    },
    'product-reveal': {
      headline: 'After Months of Research, I Found It',
      subheadline: 'The one formula I can confidently recommend',
      productName: 'Product Name',
      productDescription: 'A clinically-backed formula designed specifically for women over 40.',
      productImage: 'https://via.placeholder.com/400x400',
      doctorQuote: "In 15 years of practice, I've never endorsed a specific supplement—until now.",
      rating: 4.8,
      reviewCount: '10,000+',
      keyBenefits: [
        'Key benefit one',
        'Key benefit two',
        'Key benefit three',
        'Key benefit four'
      ],
      socialProofStats: [
        { value: '83%', label: 'success rate' },
        { value: '10K+', label: 'community members' },
        { value: '4.8', label: 'average rating' }
      ],
      ctaText: 'Learn More →',
      ctaUrl: '#',
      badge: "Doctor's #1 Pick"
    },
    'community-survey-results': {
      headline: 'Community Survey Results',
      subheading: 'Based on feedback from verified community members',
      results: [
        { label: 'Reported positive results by week 3', percentage: 78 },
        { label: 'Said habits became easier', percentage: 71 },
        { label: 'Still using after 60 days', percentage: 83, highlighted: true },
        { label: 'Would recommend to a friend', percentage: 91 }
      ],
      totalRespondents: '1,000+',
      source: 'Community Survey, 2024',
      highlightText: 'The results speak for themselves.',
      style: 'featured'
    },
    'two-approaches': {
      headline: 'Two Paths Forward',
      leftColumn: {
        header: 'The Old Way',
        subheader: "What hasn't worked",
        items: [
          { text: 'Set ambitious goals', negative: true },
          { text: 'Rely on willpower alone', negative: true },
          { text: 'Force yourself to stick with it', negative: true },
          { text: 'Feel guilty when you fail', negative: true }
        ],
        result: 'Result: Same cycle repeats'
      },
      rightColumn: {
        header: 'The New Way',
        subheader: 'What actually works',
        items: [
          { text: 'Fix the foundation first', positive: true },
          { text: 'Support your biology', positive: true },
          { text: 'Let habits become easier', positive: true },
          { text: 'Build momentum naturally', positive: true }
        ],
        result: 'Result: Lasting change'
      },
      style: 'contrast'
    }
  };

  return defaults[type] || {};
}

