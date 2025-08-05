import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';

interface PersonnelTypeSelectorProps {
  personnelType: 'Jumper' | 'Jumpmaster' | 'Non-Jumper';
  jumpmasterType: 'PJ' | 'AJ' | 'STATIC' | 'SAFETY';
  nonJumperType: 'NON-JUMPER' | 'PAO';
  onPersonnelTypeChange: (type: 'Jumper' | 'Jumpmaster' | 'Non-Jumper') => void;
  onJumpmasterTypeChange: (type: 'PJ' | 'AJ' | 'STATIC' | 'SAFETY') => void;
  onNonJumperTypeChange: (type: 'NON-JUMPER' | 'PAO') => void;
  isActive: boolean;
}

export const PersonnelTypeSelector: React.FC<PersonnelTypeSelectorProps> = ({
  personnelType,
  jumpmasterType,
  nonJumperType,
  onPersonnelTypeChange,
  onJumpmasterTypeChange,
  onNonJumperTypeChange,
  isActive
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Personnel Type Selection
      </h2>

      <div className="space-y-4">
        {/* Main Personnel Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Personnel Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => onPersonnelTypeChange('Jumper')}
              className={`p-4 rounded-lg border-2 transition-all ${
                personnelType === 'Jumper'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              disabled={!isActive}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">Jumper</span>
              </div>
              <div className="text-xs text-center">
                Regular paratrooper
              </div>
            </button>

            <button
              onClick={() => onPersonnelTypeChange('Jumpmaster')}
              className={`p-4 rounded-lg border-2 transition-all ${
                personnelType === 'Jumpmaster'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              disabled={!isActive}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Jumpmaster</span>
              </div>
              <div className="text-xs text-center">
                Jump operations personnel
              </div>
            </button>

            <button
              onClick={() => onPersonnelTypeChange('Non-Jumper')}
              className={`p-4 rounded-lg border-2 transition-all ${
                personnelType === 'Non-Jumper'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              disabled={!isActive}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserX className="w-5 h-5" />
                <span className="font-medium">Non-Jumper</span>
              </div>
              <div className="text-xs text-center">
                Non-jumping personnel
              </div>
            </button>
          </div>
        </div>

        {/* Jumpmaster Sub-Type Selection */}
        {personnelType === 'Jumpmaster' && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jumpmaster Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['PJ', 'AJ', 'STATIC', 'SAFETY'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onJumpmasterTypeChange(type)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    jumpmasterType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={!isActive}
                >
                  {type}
                </button>
              ))}
            </div>
            {(jumpmasterType === 'STATIC' || jumpmasterType === 'SAFETY') && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                <strong>Note:</strong> {jumpmasterType} personnel will not have exit assignments and will be numbered as "////"
              </div>
            )}
          </div>
        )}

        {/* Non-Jumper Sub-Type Selection */}
        {personnelType === 'Non-Jumper' && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Non-Jumper Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['NON-JUMPER', 'PAO'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onNonJumperTypeChange(type)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    nonJumperType === type
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={!isActive}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
              <strong>Note:</strong> {nonJumperType} personnel will not have exit assignments and will be numbered as "////"
            </div>
          </div>
        )}

        {/* Current Selection Summary */}
        <div className="bg-slate-50 p-3 rounded-md">
          <div className="text-sm text-slate-700">
            <strong>Current Selection:</strong> {personnelType}
            {personnelType === 'Jumpmaster' && ` - ${jumpmasterType}`}
            {personnelType === 'Non-Jumper' && ` - ${nonJumperType}`}
          </div>
        </div>
      </div>
    </div>
  );
};