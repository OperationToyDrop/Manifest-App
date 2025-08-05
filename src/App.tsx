import React, { useState } from 'react';
import { Play, Square, FileText } from 'lucide-react';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ManifestControls } from './components/ManifestControls';
import { PersonnelList } from './components/PersonnelList';
import { FormData } from './components/FormData';
import { PersonnelTypeSelector } from './components/PersonnelTypeSelector';
import { ExportModal } from './components/ExportModal';
import { PDFPreview } from './components/PDFPreview';

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
  personnelType?: 'Jumper' | 'Jumpmaster' | 'Non-Jumper';
  jumpmasterType?: 'PJ' | 'AJ' | 'STATIC' | 'SAFETY';
  nonJumperType?: 'NON-JUMPER' | 'PAO';
  isNonExiting?: boolean;
}

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [currentChalk, setCurrentChalk] = useState('101');
  const [currentPass, setCurrentPass] = useState(1);
  const [currentDoor, setCurrentDoor] = useState<'Left' | 'Right' | 'Ramp'>('Left');
  const [personnelType, setPersonnelType] = useState<'Jumper' | 'Jumpmaster' | 'Non-Jumper'>('Jumper');
  const [jumpmasterType, setJumpmasterType] = useState<'PJ' | 'AJ' | 'STATIC' | 'SAFETY'>('PJ');
  const [nonJumperType, setNonJumperType] = useState<'NON-JUMPER' | 'PAO'>('NON-JUMPER');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dropZone: '',
    aircraftType: '',
    chuteType: '',
    partnerJump: 'no',
    partnerNation: ''
  });

  const handlePersonnelScanned = (newPerson: Personnel) => {
    // Determine if this person is non-exiting
    const isNonExiting = 
      (personnelType === 'Jumpmaster' && (jumpmasterType === 'STATIC' || jumpmasterType === 'SAFETY')) ||
      personnelType === 'Non-Jumper';

    // Override jump type based on personnel type selection
    let overrideJumpType = newPerson.jumpType;
    if (personnelType === 'Jumpmaster') {
      overrideJumpType = jumpmasterType;
    } else if (personnelType === 'Non-Jumper') {
      overrideJumpType = nonJumperType;
    }
    const personnelWithManifestInfo = {
      ...newPerson,
      jumpType: overrideJumpType,
      chalk: currentChalk,
      pass: currentPass,
      door: isNonExiting ? undefined : currentDoor,
      personnelType,
      jumpmasterType: personnelType === 'Jumpmaster' ? jumpmasterType : undefined,
      nonJumperType: personnelType === 'Non-Jumper' ? nonJumperType : undefined,
      isNonExiting
    };
    
    setPersonnel(prev => [...prev, personnelWithManifestInfo]);
  };

  const handlePersonnelUpdate = (updatedPersonnel: Personnel[]) => {
    setPersonnel(updatedPersonnel);
  };

  const handlePersonnelDelete = (id: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
  };

  const handleStartScanning = () => {
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handlePreview = () => {
    setShowPDFPreview(true);
  };

  // Calculate counts
  const totalPersonnel = personnel.length;
  const exitingPersonnel = personnel.filter(p => !p.isNonExiting).length;
  const nonExitingPersonnel = personnel.filter(p => p.isNonExiting).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Military Personnel Manifest Scanner</h1>
              <p className="text-slate-300 mt-1">DA Form 1306 Generator</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-slate-300">Total Personnel</div>
                <div className="text-xl font-semibold">{totalPersonnel}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-slate-300">Exiting</div>
                <div className="text-lg font-semibold text-green-400">{exitingPersonnel}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-slate-300">Non-Exiting</div>
                <div className="text-lg font-semibold text-amber-400">{nonExitingPersonnel}</div>
              </div>
              <div className="flex gap-2">
                {!isScanning ? (
                  <button
                    onClick={handleStartScanning}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={handleStopScanning}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Scanning
                  </button>
                )}
                <button
                  onClick={handleExport}
                  disabled={personnel.length === 0}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export DA Form 1306
                </button>
                <button
                  onClick={handlePreview}
                  disabled={personnel.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Preview PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Form Data */}
        <FormData 
          formData={formData}
          onFormDataChange={setFormData}
          onAircraftChange={(aircraft) => {
            // Auto-set door restrictions based on aircraft
            if (aircraft === 'CASA-212' || aircraft === 'CH-47') {
              setCurrentDoor('Ramp');
            } else if (aircraft === 'UH-60') {
              // UH-60 has no door options, keep current selection
            } else if (aircraft === 'C-17' && formData.chuteType === 'RA-1') {
              setCurrentDoor('Ramp');
            }
          }}
          onChuteChange={(chute) => {
            // Auto-set door restrictions based on chute type
            if (chute === 'RA-1' && formData.aircraftType === 'C-17') {
              setCurrentDoor('Ramp');
            }
          }}
        />

        {/* Personnel Type Selection */}
        <PersonnelTypeSelector
          personnelType={personnelType}
          jumpmasterType={jumpmasterType}
          nonJumperType={nonJumperType}
          onPersonnelTypeChange={setPersonnelType}
          onJumpmasterTypeChange={setJumpmasterType}
          onNonJumperTypeChange={setNonJumperType}
          isActive={isScanning}
        />

        {/* Scanner and Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarcodeScanner 
            onPersonnelScanned={handlePersonnelScanned}
            isActive={isScanning}
          />
          <ManifestControls
            chalk={currentChalk}
            pass={currentPass}
            door={currentDoor}
            onChalkChange={setCurrentChalk}
            onPassChange={setCurrentPass}
            onDoorChange={setCurrentDoor}
            isActive={isScanning}
            totalPersonnel={totalPersonnel}
            personnel={personnel}
            formData={{
              aircraftType: formData.aircraftType,
              chuteType: formData.chuteType
            }}
          />
        </div>

        {/* Personnel List */}
        <PersonnelList
          personnel={personnel}
          onPersonnelUpdate={handlePersonnelUpdate}
          onPersonnelDelete={handlePersonnelDelete}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        personnel={personnel}
        formData={formData}
      />

      {/* PDF Preview Modal */}
      <PDFPreview
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        personnel={personnel}
        formData={formData}
      />
    </div>
  );
}

export default App;