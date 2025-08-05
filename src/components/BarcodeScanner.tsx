import React, { useState, useEffect, useRef } from 'react';
import { Scan, Keyboard } from 'lucide-react';

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
  door?: 'Left' | 'Right';
}

interface BarcodeScannerProps {
  onPersonnelScanned: (personnel: Personnel) => void;
  isActive: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onPersonnelScanned, 
  isActive 
}) => {
  const [scanInput, setScanInput] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when scanner is active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Parse barcode data
  const parseBarcode = (data: string): Personnel | null => {
    try {
      // Expected format: "Last, First MI|Grade|Organization|Jump Type"
      const parts = data.split('|');
      if (parts.length !== 4) return null;

      const [nameStr, grade, organization, jumpType] = parts;
      const nameParts = nameStr.split(',').map(part => part.trim());
      
      if (nameParts.length < 2) return null;

      const lastName = nameParts[0];
      const firstNameAndMI = nameParts[1].split(' ');
      const firstName = firstNameAndMI[0] || '';
      const middleInitial = firstNameAndMI[1] || '';

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        lastName,
        firstName,
        middleInitial,
        grade: grade.trim(),
        organization: organization.trim(),
        jumpType: jumpType.trim()
      };
    } catch (error) {
      console.error('Error parsing barcode:', error);
      return null;
    }
  };

  // Handle keyboard input (USB scanner)
  const handleKeyboardInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      const personnel = parseBarcode(scanInput.trim());
      if (personnel) {
        onPersonnelScanned(personnel);
        setLastScan(scanInput);
        setScanInput('');
      }
    }
  };

  // Handle input change and auto-scan
  const handleInputChange = (value: string) => {
    setScanInput(value);
    
    // Clear existing timeout
    if (scanTimeout) {
      clearTimeout(scanTimeout);
    }
    
    // Set a delay to ensure complete scan data is captured
    const timeout = setTimeout(() => {
      if (value.trim() && value.includes('|')) {
        const personnel = parseBarcode(value.trim());
        if (personnel) {
          onPersonnelScanned(personnel);
          setLastScan(value);
          setScanInput('');
        }
      }
    }, 300); // 300ms delay to ensure complete scan
    
    setScanTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, [scanTimeout]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Barcode Scanner
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-600 text-white rounded-md text-sm">
          <Keyboard className="w-4 h-4" />
          USB Scanner
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan Barcode Data (Automatic)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={scanInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyboardInput}
            placeholder="Scan Barcode Here"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={!isActive}
          />
        </div>

        {lastScan && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Last scan: {lastScan}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Expected format: Last, First MI|Grade|Organization|Jump Type<br/>
          Example: Test, Test|E8|USACAPOC|J/A/NT/CE<br/>
          <strong>Automatic scanning enabled</strong> - Personnel will be added immediately upon scan
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-md ${
        isActive 
          ? 'bg-green-50 border border-green-200 text-green-700' 
          : 'bg-gray-50 border border-gray-200 text-gray-500'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          Scanner {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );
};