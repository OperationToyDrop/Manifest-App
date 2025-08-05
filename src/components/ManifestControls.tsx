import React from 'react';
import { Settings, Users, MapPin, Plane } from 'lucide-react';

interface ManifestControlsProps {
  chalk: string;
  pass: number;
  door: 'Left' | 'Right' | 'Ramp';
  onChalkChange: (chalk: string) => void;
  onPassChange: (pass: number) => void;
  onDoorChange: (door: 'Left' | 'Right' | 'Ramp') => void;
  isActive: boolean;
  totalPersonnel: number;
  personnel: Personnel[];
  formData: {
    aircraftType: string;
    chuteType: string;
  };
}

interface Personnel {
  id: string;
  lastName: string;
  firstName: string;
  middleInitial: string;
  grade: string;
  organization: string;
  jumpType: string;
  chalk?: string;
  pass?: number;
  door?: 'Left' | 'Right' | 'Ramp';
}

export const ManifestControls: React.FC<ManifestControlsProps> = ({
  chalk,
  pass,
  door,
  onChalkChange,
  onPassChange,
  onDoorChange,
  isActive,
  totalPersonnel,
  personnel,
  formData
}) => {
  // Calculate counts per pass and door
  const getPassDoorCounts = () => {
    const counts: Record<number, Record<string, number>> = {};
    
    personnel.forEach(person => {
      const personPass = person.pass || 1;
      const personDoor = person.door || 'Left';
      
      if (!counts[personPass]) {
        counts[personPass] = {};
      }
      if (!counts[personPass][personDoor]) {
        counts[personPass][personDoor] = 0;
      }
      counts[personPass][personDoor]++;
    });
    
    return counts;
  };

  const passDoorCounts = getPassDoorCounts();
  const currentPassCount = passDoorCounts[pass] || {};
  const currentDoorCount = currentPassCount[door] || 0;

  // Determine available door options based on aircraft and chute type
  const getAvailableDoors = () => {
    const { aircraftType, chuteType } = formData;
    
    // CASA-212 and CH-47: Only Ramp
    if (aircraftType === 'CASA-212' || aircraftType === 'CH-47') {
      return ['Ramp'];
    }
    
    // UH-60: No door options (disable all)
    if (aircraftType === 'UH-60') {
      return [];
    }
    
    // C-17 with RA-1: Only Ramp
    if (aircraftType === 'C-17' && chuteType === 'RA-1') {
      return ['Ramp'];
    }
    
    // Default: All options available
    return ['Left', 'Right', 'Ramp'];
  };

  const availableDoors = getAvailableDoors();
  const isUH60 = formData.aircraftType === 'UH-60';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Manifest Controls
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="text-right">
            <div className="text-xs text-gray-500">Pass {pass} - {door}</div>
            <div className="font-semibold">{currentDoorCount} Personnel</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-semibold flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalPersonnel}
            </div>
          </div>
        </div>
      </div>

      {/* Pass & Door Summary */}
      {Object.keys(passDoorCounts).length > 0 && (
        <div className="mb-4 p-3 bg-slate-50 rounded-md">
          <div className="text-sm font-medium text-slate-700 mb-2">Personnel Distribution:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {Object.keys(passDoorCounts)
              .map(Number)
              .sort((a, b) => a - b)
              .map(passNum => (
                <div key={passNum} className="space-y-1">
                  <div className="font-medium text-slate-600">Pass {passNum}:</div>
                  {Object.entries(passDoorCounts[passNum]).map(([doorType, count]) => (
                    <div key={doorType} className="flex justify-between text-slate-500">
                      <span>{doorType}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chalk Number
          </label>
          <input
            type="text"
            value={chalk}
            onChange={(e) => onChalkChange(e.target.value)}
            placeholder="101"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={!isActive}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pass Number
          </label>
          <div className="space-y-2">
            <input
              type="number"
              value={pass}
              onChange={(e) => onPassChange(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={!isActive}
            />
            <button
              onClick={() => onPassChange(pass + 1)}
              disabled={!isActive}
              className="w-full px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              Next Pass
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of Exit {isUH60 && <span className="text-xs text-amber-600">(N/A for UH-60)</span>}
          </label>
          {isUH60 ? (
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-center">
              No exit selection for UH-60
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onDoorChange('Left')}
              className={`px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                door === 'Left'
                  ? 'bg-slate-600 text-white'
                  : availableDoors.includes('Left')
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isActive || !availableDoors.includes('Left')}
            >
              Left
            </button>
            <button
              onClick={() => onDoorChange('Right')}
              className={`px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                door === 'Right'
                  ? 'bg-slate-600 text-white'
                  : availableDoors.includes('Right')
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isActive || !availableDoors.includes('Right')}
            >
              Right
            </button>
            <button
              onClick={() => onDoorChange('Ramp')}
              className={`px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                door === 'Ramp'
                  ? 'bg-slate-600 text-white'
                  : availableDoors.includes('Ramp')
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isActive || !availableDoors.includes('Ramp')}
            >
              Ramp
            </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-md">
        <div className="text-sm text-slate-700">
          <strong>Current Configuration:</strong> Chalk {chalk}, Pass {pass}, {door} {door === 'Ramp' ? '' : 'Door'}
          {currentDoorCount > 0 && (
            <span className="ml-2 text-slate-500">({currentDoorCount} personnel)</span>
          )}
        </div>
      </div>
    </div>
  );
};