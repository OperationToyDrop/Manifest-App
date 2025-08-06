import React, { useState } from 'react';
import { Download, X, FileText } from 'lucide-react';
import { exportToExcel } from '@/lib/exportToExcel';
import { exportToSheets } from '@/lib/exportToSheets';

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

  const generateDAForm1306Text = () => {
    const groupedPersonnel = personnel.reduce((groups, person) => {
      const passKey = person.pass || 1;
      if (!groups[passKey]) groups[passKey] = [];
      groups[passKey].push(person);
      return groups;
    }, {} as Record<number, Personnel[]>);

    const exitingPersonnel = personnel.filter(p => !p.isNonExiting);
    const nonExitingPersonnel = personnel.filter(p => p.isNonExiting);

    const exitingGroupedByPass = exitingPersonnel.reduce((groups, person) => {
      const passKey = person.pass || 1;
      if (!groups[passKey]) groups[passKey] = [];
      groups[passKey].push(person);
      return groups;
    }, {} as Record<number, Personnel[]>);

    const exitingGroupedByPassAndDoor = Object.keys(exitingGroupedByPass).reduce((groups, passKey) => {
      const passNumber = Number(passKey);
      const passPersonnel = exitingGroupedByPass[passNumber];
      const doorGroups = passPersonnel.reduce((doorGroup, person) => {
        const doorKey = person.door || 'Left';
        if (!doorGroup[doorKey]) doorGroup[doorKey] = [];
        doorGroup[doorKey].push(person);
        return doorGroup;
      }, {} as Record<string, Personnel[]>);
      groups[passNumber] = doorGroups;
      return groups;
    }, {} as Record<number, Record<string, Personnel[]>>);

    const sortedPasses = Object.keys(exitingGroupedByPass).map(Number).sort((a, b) => a - b);

    let content = `DA FORM 1306\nSTATEMENT OF JUMP AND LOADING MANIFEST\n\n`;
    content += `Date: ${formData.date}\n`;
    content += `Drop Zone: ${formData.dropZone}\n`;
    content += `Aircraft Type: ${formData.aircraftType}\n`;
    content += `Parachute Type: ${formData.chuteType}\n\n`;

    sortedPasses.forEach(passNumber => {
      const doorGroups = exitingGroupedByPassAndDoor[passNumber];
      Object.keys(doorGroups).sort().forEach(doorType => {
        const doorPersonnel = doorGroups[doorType];
        const firstPerson = doorPersonnel[0];
        const exitType = doorType === 'Ramp' ? 'Ramp' : `${doorType} Door`;
        const partnerInfo = formData.partnerJump === 'yes' && formData.partnerNation ? `, ${formData.partnerNation}` : '';
        content += `\nChalk ${firstPerson.chalk || 'TBD'}, Pass ${passNumber}, ${exitType}, ${formData.chuteType}${partnerInfo}\n`;
        content += `${'='.repeat(80)}\n`;
        content += `#   Name                           Grade    Organization           Jump Type\n`;
        content += `${'-'.repeat(80)}\n`;
        doorPersonnel.forEach((person, index) => {
          const number = `${index + 1}.`.padEnd(4);
          const name = `${person.lastName}, ${person.firstName} ${person.middleInitial}`.padEnd(30);
          const grade = person.grade.padEnd(8);
          const org = person.organization.padEnd(22);
          const jumpType = person.jumpType;
          content += `${number}${name} ${grade} ${org} ${jumpType}\n`;
        });
      });
    });

    if (nonExitingPersonnel.length > 0) {
      const nonExitingByChalk = nonExitingPersonnel.reduce((groups, person) => {
        const chalkKey = person.chalk || 'TBD';
        if (!groups[chalkKey]) groups[chalkKey] = [];
        groups[chalkKey].push(person);
        return groups;
      }, {} as Record<string, Personnel[]>);

      Object.keys(nonExitingByChalk).sort().forEach(chalk => {
        const chalkPersonnel = nonExitingByChalk[chalk];
        content += `\nChalk ${chalk}, Non-Exiting\n`;
        content += `${'='.repeat(80)}\n`;
        content += `#   Name                           Grade    Organization           Jump Type\n`;
        content += `${'-'.repeat(80)}\n`;
        chalkPersonnel.forEach((person) => {
          const number = '////'.padEnd(4);
          const name = `${person.lastName}, ${person.firstName} ${person.middleInitial}`.padEnd(30);
          const grade = person.grade.padEnd(8);
          const org = person.organization.padEnd(22);
          const jumpType = person.jumpmasterType || person.nonJumperType || person.jumpType;
          content += `${number}${name} ${grade} ${org} ${jumpType}\n`;
        });
      });
    }

    return content;
  };

  const handleTextPreview = () => {
    const content = generateDAForm1306Text();
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

  const previewContent = generateDAForm1306Text();

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

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-md">
            {previewContent}
          </pre>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => exportToExcel(personnel, formData)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
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
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Text Version
          </button>
        </div>
      </div>
    </div>
  );
};
