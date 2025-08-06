import React, { useState } from 'react';
import { Download, X, FileText, Printer, Save } from 'lucide-react';
import { exportToExcel } from '@/lib/exportToExcel';
import { exportToSheets } from '@/lib/exportToSheets';
import { exportDA1306Excel } from '@/lib/exportDA1306Excel';

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

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel[];
  formData: {
    date: string;
    dropZone: string;
    aircraftType: string;
    chuteType: string;
    partnerJump: string;
    partnerNation: string;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  personnel,
  formData
}) => {
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  if (!isOpen) return null;

  const handleTextPreview = () => {
    const content = `DA FORM 1306\nSTATEMENT OF JUMP AND LOADING MANIFEST\n\n` +
      `Date: ${formData.date}\n` +
      `Drop Zone: ${formData.dropZone}\n` +
      `Aircraft Type: ${formData.aircraftType}\n` +
      `Parachute Type: ${formData.chuteType}\n\n` +
      personnel.map((person, index) => {
        const name = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
        const grade = person.grade;
        const org = person.organization;
        const jumpType = person.jumpType;
        return `${index + 1}. ${name} - ${grade} - ${org} - ${jumpType}`;
      }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA-Form-1306-${formData.date || 'manifest'}-preview.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSheetsExport = async () => {
    setIsExportingSheets(true);
    try {
      await exportToSheets(personnel, formData);
      alert('Exported to Google Sheets successfully.');
    } catch (error) {
      console.error('Export to Sheets failed:', error);
      alert('Export to Google Sheets failed.');
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleDA1306ExcelExport = () => {
    try {
      exportDA1306Excel(personnel, formData);
    } catch (error) {
      console.error('Export to Excel (DA 1306) failed:', error);
      alert('Export to Excel (DA 1306) failed.');
    }
  };

  const handlePrintPreview = () => {
    window.print();
  };

  const handleSavePreview = () => {
    const content = document.querySelector(".preview-section")?.innerHTML;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA1306_Preview_${formData.date || 'manifest'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            DA Form 1306 Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] preview-section">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-md">
            {personnel.map((p, i) => `${i + 1}. ${p.lastName}, ${p.firstName} ${p.middleInitial} - ${p.grade} - ${p.organization} - ${p.jumpType}`).join('\n')}
          </pre>
        </div>

        <div className="flex justify-between items-center gap-3 p-6 border-t bg-gray-50 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handlePrintPreview}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleSavePreview}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preview
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDA1306ExcelExport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export DA1306 Excel
            </button>
            <button
              onClick={handleSheetsExport}
              disabled={isExportingSheets}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExportingSheets ? 'Exporting...' : 'Export to Sheets'}
            </button>
            <button
              onClick={handleTextPreview}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
