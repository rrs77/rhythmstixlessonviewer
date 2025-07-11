import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, 
  Video, 
  Music, 
  FileText, 
  Link as LinkIcon, 
  Image, 
  Volume2, 
  Edit3, 
  Save, 
  X, 
  Bold, 
  Italic, 
  Underline,
  GripVertical,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import { useDrag } from 'react-dnd';
import type { Activity } from '../contexts/DataContext';

interface ActivityCardProps {
  activity: Activity;
  onUpdate: (updatedActivity: Activity) => void;
  onDelete: (activityId: string) => void;
  onDuplicate: (activity: Activity) => void;
  isEditing?: boolean;
  onEditToggle: () => void;
  categoryColor: string;
  viewMode?: 'compact' | 'detailed' | 'minimal';
}

const categoryColors: Record<string, string> = {
  'Welcome': '#F59E0B',
  'Kodaly Songs': '#8B5CF6',
  'Kodaly Action Songs': '#F97316',
  'Action/Games Songs': '#F97316',
  'Rhythm Sticks': '#D97706',
  'Scarf Songs': '#10B981',
  'General Game': '#3B82F6',
  'Core Songs': '#84CC16',
  'Parachute Games': '#EF4444',
  'Percussion Games': '#06B6D4',
  'Teaching Units': '#6366F1',
  'Goodbye': '#14B8A6'
};

export function ActivityCard({ 
  activity, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  isEditing = false, 
  onEditToggle,
  categoryColor,
  viewMode = 'detailed'
}: ActivityCardProps) {
  const [editedActivity, setEditedActivity] = useState<Activity>(activity);
  const [showResources, setShowResources] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'activity',
    item: { activity },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    setEditedActivity(activity);
  }, [activity]);

  const handleSave = () => {
    onUpdate(editedActivity);
    onEditToggle();
  };

  const handleCancel = () => {
    setEditedActivity(activity);
    onEditToggle();
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (descriptionRef.current) {
      const updatedContent = descriptionRef.current.innerHTML;
      setEditedActivity(prev => ({ ...prev, description: updatedContent }));
    }
  };

  const resources = [
    { label: 'Video', url: activity.videoLink, icon: Video, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: 'Music', url: activity.musicLink, icon: Music, color: 'text-green-600 bg-green-50 border-green-200' },
    { label: 'Backing', url: activity.backingLink, icon: Volume2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Resource', url: activity.resourceLink, icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'Link', url: activity.link, icon: LinkIcon, color: 'text-gray-600 bg-gray-50 border-gray-200' },
    { label: 'Vocals', url: activity.vocalsLink, icon: Volume2, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { label: 'Image', url: activity.imageLink, icon: Image, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  ].filter(resource => resource.url && resource.url.trim());

  const cardColor = categoryColors[activity.category] || categoryColor;

  if (viewMode === 'minimal') {
    return (
      <div
        ref={drag}
        className={`bg-white rounded-lg shadow-sm border-l-4 p-3 transition-all duration-200 hover:shadow-md cursor-move ${
          isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
        }`}
        style={{ borderLeftColor: cardColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">{activity.activity}</h4>
            <p className="text-xs text-gray-500">{activity.category}</p>
          </div>
          {activity.time > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
              {activity.time}m
            </span>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div
        ref={drag}
        className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-move ${
          isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
        } ${isEditing ? 'ring-4 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}
        style={{ borderLeftColor: cardColor, borderLeftWidth: '6px' }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-base leading-tight">{activity.activity}</h4>
            <div className="flex items-center space-x-1 ml-2">
              {activity.time > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {activity.time}m
                </span>
              )}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{activity.category}</p>
          
          {activity.level && (
            <span 
              className="inline-block px-2 py-1 text-white text-xs font-medium rounded-full"
              style={{ backgroundColor: cardColor }}
            >
              {activity.level}
            </span>
          )}
          
          {resources.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {resources.slice(0, 3).map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <div key={index} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-3 w-3 text-gray-600" />
                  </div>
                );
              })}
              {resources.length > 3 && (
                <span className="text-xs text-gray-500">+{resources.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view (default)
  return (
    <div
      ref={drag}
      className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-move overflow-hidden ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
      } ${isEditing ? 'ring-4 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}
      style={{ borderLeftColor: cardColor, borderLeftWidth: '6px' }}
    >
      {/* Card Header */}
      <div 
        className="p-4 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}CC 100%)` 
        }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editedActivity.activity}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, activity: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded-lg px-3 py-2 text-lg font-bold"
                  placeholder="Activity name"
                />
              ) : (
                <h3 className="text-lg font-bold leading-tight">{activity.activity}</h3>
              )}
              
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm opacity-90">{activity.category}</span>
                {activity.level && (
                  <span className="px-2 py-1 bg-white bg-opacity-20 text-xs font-medium rounded-full">
                    {activity.level}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-3">
              {activity.time > 0 && (
                <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{activity.time}m</span>
                </div>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[150px] z-50">
                    <button
                      onClick={() => {
                        onEditToggle();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(activity);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => setShowResources(!showResources)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      {showResources ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showResources ? 'Hide' : 'Show'} Resources</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onDelete(activity.activity);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Description */}
        <div className="mb-4">
          {isEditing ? (
            <div>
              {/* Rich Text Toolbar */}
              <div className="flex items-center space-x-1 mb-2 p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => execCommand('bold')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand('italic')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand('underline')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </button>
              </div>
              
              <div
                ref={descriptionRef}
                contentEditable
                className="min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                dangerouslySetInnerHTML={{ __html: editedActivity.description }}
                onInput={(e) => {
                  const target = e.target as HTMLDivElement;
                  setEditedActivity(prev => ({ ...prev, description: target.innerHTML }));
                }}
              />
            </div>
          ) : (
            <div 
              className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: activity.description }}
            />
          )}
        </div>

        {/* Unit Name */}
        {(activity.unitName || isEditing) && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Unit
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedActivity.unitName}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, unitName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unit name"
              />
            ) : (
              <p className="text-sm text-gray-700 font-medium">{activity.unitName}</p>
            )}
          </div>
        )}

        {/* Resources */}
        {(showResources || isEditing) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Resources</h4>
            
            {isEditing ? (
              <div className="space-y-3">
                {[
                  { key: 'videoLink', label: 'Video', icon: Video },
                  { key: 'musicLink', label: 'Music', icon: Music },
                  { key: 'backingLink', label: 'Backing', icon: Volume2 },
                  { key: 'resourceLink', label: 'Resource', icon: FileText },
                  { key: 'link', label: 'Link', icon: LinkIcon },
                  { key: 'vocalsLink', label: 'Vocals', icon: Volume2 },
                  { key: 'imageLink', label: 'Image', icon: Image },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <input
                      type="url"
                      value={editedActivity[key as keyof Activity] as string}
                      onChange={(e) => setEditedActivity(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={`${label} URL`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {resources.map((resource, index) => {
                  const IconComponent = resource.icon;
                  return (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-sm ${resource.color}`}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{resource.label}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}