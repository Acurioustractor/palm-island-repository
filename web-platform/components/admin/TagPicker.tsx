'use client';

import { useState, useMemo } from 'react';
import { Search, Check, X, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { TagCategory, PlacementTag, getTagColorClass } from '@/lib/taxonomy/placement-tags';

interface TagPickerProps {
  categories: TagCategory[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  mode?: 'checkbox' | 'add-remove';
  showSearch?: boolean;
  showCategories?: boolean;
  maxHeight?: string;
  placeholder?: string;
}

export function TagPicker({
  categories,
  selectedTags,
  onChange,
  mode = 'checkbox',
  showSearch = true,
  showCategories = true,
  maxHeight = '300px',
  placeholder = 'Search tags...',
}: TagPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  // Filter tags based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        tags: category.tags.filter(
          (tag) =>
            tag.label.toLowerCase().includes(query) ||
            tag.id.toLowerCase().includes(query) ||
            tag.description?.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.tags.length > 0);
  }, [categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const selectAll = (categoryTags: PlacementTag[]) => {
    const tagIds = categoryTags.map((t) => t.id);
    const newTags = [...selectedTags];
    for (const id of tagIds) {
      if (!newTags.includes(id)) newTags.push(id);
    }
    onChange(newTags);
  };

  const deselectAll = (categoryTags: PlacementTag[]) => {
    const tagIds = new Set(categoryTags.map((t) => t.id));
    onChange(selectedTags.filter((t) => !tagIds.has(t)));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Search */}
      {showSearch && (
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected tags summary */}
      {selectedTags.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Selected:</span>
            {selectedTags.slice(0, 5).map((tagId) => {
              const allTags = categories.flatMap((c) => c.tags);
              const tag = allTags.find((t) => t.id === tagId);
              return (
                <span
                  key={tagId}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getTagColorClass(tagId)} ${getTagColorClass(tagId, 'text')}`}
                >
                  {tag?.label || tagId}
                  <button
                    onClick={() => toggleTag(tagId)}
                    className="hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedTags.length > 5 && (
              <span className="text-xs text-gray-500">+{selectedTags.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      {/* Tag categories */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <Tag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            No tags found
          </div>
        ) : showCategories ? (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const selectedInCategory = category.tags.filter((t) =>
              selectedTags.includes(t.id)
            ).length;

            return (
              <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{category.label}</span>
                    {selectedInCategory > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{category.tags.length} tags</span>
                </button>

                {/* Category tags */}
                {isExpanded && (
                  <div className="px-3 pb-3">
                    {/* Quick actions */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <button
                        onClick={() => selectAll(category.tags)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Select all
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => deselectAll(category.tags)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Deselect all
                      </button>
                    </div>

                    {/* Tag list */}
                    <div className="space-y-1">
                      {category.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <label
                            key={tag.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTag(tag.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${getTagColorClass(tag.id)} ${getTagColorClass(tag.id, 'text')}`}
                                >
                                  {tag.label}
                                </span>
                              </div>
                              {tag.description && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {tag.description}
                                </p>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Flat list without categories
          <div className="p-3 space-y-1">
            {filteredCategories.flatMap((c) => c.tags).map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <label
                  key={tag.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTag(tag.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getTagColorClass(tag.id)} ${getTagColorClass(tag.id, 'text')}`}
                  >
                    {tag.label}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TagPicker;
