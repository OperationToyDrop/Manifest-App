import React from 'react';
import { Calendar, MapPin, Plane, PackageSearch as Parachute, Globe } from 'lucide-react';

interface FormDataProps {
  formData: {
    date: string;
    dropZone: string;
    aircraftType: string;
    chuteType: string;
    partnerJump: string;
    partnerNation: string;
  };
  onFormDataChange: (data: any) => void;
  onAircraftChange?: (aircraft: string) => void;
  onChuteChange?: (chute: string) => void;
}

export const FormData: React.FC<FormDataProps> = ({ 
  formData, 
  onFormDataChange, 
  onAircraftChange, 
  onChuteChange 
}) => {
  const partnerNations = [
    'Brazil', 'Canada', 'Chile', 'Colombia', 'Czech Republic', 'Ecuador',
    'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Jordan', 'Kenya',
    'Netherlands', 'Poland', 'Portugal', 'Qatar', 'Spain', 'Tunisia', 'UK'
  ];

  const handleChange = (field: string, value: string) => {
    // Call specific handlers for aircraft and chute changes
    if (field === 'aircraftType' && onAircraftChange) {
      onAircraftChange(value);
    }
    if (field === 'chuteType' && onChuteChange) {
      onChuteChange(value);
    }
    
    // Reset partner nation if partner jump is set to no
    let updatedData = {
      ...formData,
      [field]: value
    };
    
    if (field === 'partnerJump' && value === 'no') {
      updatedData.partnerNation = '';
    }
    
    onFormDataChange(updatedData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">DA Form 1306 Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Drop Zone
          </label>
          <select
            value={formData.dropZone}
            onChange={(e) => handleChange('dropZone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="">Select Drop Zone</option>
            <option value="Sicily DZ">Sicily DZ</option>
            <option value="Holland DZ">Holland DZ</option>
            <option value="Luzon DZ">Luzon DZ</option>
            <option value="St Mere DZ">St Mere DZ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Type of Aircraft
          </label>
          <select
            value={formData.aircraftType}
            onChange={(e) => handleChange('aircraftType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="">Select Aircraft</option>
            <option value="C-130">C-130</option>
            <option value="C-17">C-17</option>
            <option value="C-27">C-27</option>
            <option value="CASA-212">CASA-212</option>
            <option value="UH-60">UH-60</option>
            <option value="CH-47">CH-47</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Parachute className="w-4 h-4" />
            Type of Chute
          </label>
          <select
            value={formData.chuteType}
            onChange={(e) => handleChange('chuteType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="">Select Chute</option>
            <option value="MC-6">MC-6</option>
            <option value="T-11">T-11</option>
            <option value="RA-1">RA-1</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Partner Jump
          </label>
          <select
            value={formData.partnerJump}
            onChange={(e) => handleChange('partnerJump', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {formData.partnerJump === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Partner Nation
            </label>
            <select
              value={formData.partnerNation}
              onChange={(e) => handleChange('partnerNation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Select Partner Nation</option>
              {partnerNations.map(nation => (
                <option key={nation} value={nation}>{nation}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};