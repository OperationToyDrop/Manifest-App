import React from 'react';
import { X, FileText } from 'lucide-react';

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

interface PDFPreviewProps {
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

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  isOpen,
  onClose,
  personnel,
  formData
}) => {
  if (!isOpen) return null;

  const allPersonnel = personnel;
  const firstPerson = allPersonnel[0];
  const missionData = firstPerson ? {
    chalk: firstPerson.chalk || 'TBD',
    pass: firstPerson.pass || 1,
    door: firstPerson.door === 'Ramp' ? 'Ramp' : `${firstPerson.door || 'Left'} Door`,
    chute: formData.chuteType,
    partner: formData.partnerJump === 'yes' && formData.partnerNation ? formData.partnerNation : ''
  } : null;

  const missionText = missionData ? 
    [
      `Chalk ${missionData.chalk}`,
      `Pass ${missionData.pass}`,
      missionData.door,
      missionData.chute,
      missionData.partner
    ].filter(Boolean).join(', ') : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            DA Form 1306 PDF Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[85vh] pdf-preview-content">
          <div className="bg-white border-2 border-gray-300 p-8 font-mono text-sm leading-relaxed max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-lg font-bold">DA FORM 1306</div>
              <div className="text-base font-semibold">STATEMENT OF JUMP AND LOADING MANIFEST</div>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-5 gap-2 border-b-2 border-black pb-2 mb-2 font-bold text-center">
                <div>LINE NO</div>
                <div>LAST NAME--FIRST NAME--MIDDLE INITIAL</div>
                <div>GRADE</div>
                <div>ORGANIZATION</div>
                <div>TYPE OF JUMP</div>
              </div>

              {missionText && (
                <div className="grid grid-cols-5 gap-2 py-1 border-b border-gray-300">
                  <div className="text-center"></div>
                  <div className="text-left font-semibold text-blue-600">{missionText}</div>
                  <div className="text-center"></div>
                  <div className="text-center"></div>
                  <div className="text-center"></div>
                </div>
              )}

              {allPersonnel.filter(p => !p.isNonExiting).map((person, index) => (
                <div key={person.id} className="grid grid-cols-5 gap-2 py-1 border-b border-gray-200">
                  <div className="text-center">{index + 1}</div>
                  <div className="text-left">{person.lastName}, {person.firstName} {person.middleInitial}</div>
                  <div className="text-center">{person.grade}</div>
                  <div className="text-center">{person.organization}</div>
                  <div className="text-center">{person.jumpType}</div>
                </div>
              ))}

              {allPersonnel.filter(p => p.isNonExiting).length > 0 && (
                <>
                  <div className="grid grid-cols-5 gap-2 py-1 border-b border-gray-200">
                    <div className="text-center">___</div>
                    <div className="text-left">_________________________________</div>
                    <div className="text-center">______</div>
                    <div className="text-center">______________</div>
                    <div className="text-center">__________</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 py-1 border-b border-gray-200">
                    <div className="text-center">___</div>
                    <div className="text-left">_________________________________</div>
                    <div className="text-center">______</div>
                    <div className="text-center">______________</div>
                    <div className="text-center">__________</div>
                  </div>
                </>
              )}

              {allPersonnel.filter(p => p.isNonExiting).map((person) => (
                <div key={person.id} className="grid grid-cols-5 gap-2 py-1 border-b border-gray-200">
                  <div className="text-center">////</div>
                  <div className="text-left">{person.lastName}, {person.firstName} {person.middleInitial}</div>
                  <div className="text-center">{person.grade}</div>
                  <div className="text-center">{person.organization}</div>
                  <div className="text-center">{person.jumpmasterType || person.nonJumperType || person.jumpType}</div>
                </div>
              ))}

              {Array.from({ length: Math.max(0, 15 - allPersonnel.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="grid grid-cols-5 gap-2 py-1 border-b border-gray-200">
                  <div className="text-center text-gray-300">___</div>
                  <div className="text-left text-gray-300">_________________________________</div>
                  <div className="text-center text-gray-300">______</div>
                  <div className="text-center text-gray-300">______________</div>
                  <div className="text-center text-gray-300">__________</div>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span>THE PERSONNEL LISTED HEREON MADE A PARACHUTE JUMP FROM</span>
                <span className="border-b border-black px-2 min-w-[200px] text-center font-semibold">
                  {formData.aircraftType && formData.chuteType ? 
                    `${formData.aircraftType}, ${formData.chuteType}` : 
                    '________________________________'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>IN FLIGHT ON</span>
                <span className="border-b border-black px-2 min-w-[150px] text-center font-semibold">
                  {formData.date || '________________________'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>AT</span>
                <span className="border-b border-black px-2 min-w-[200px] text-center font-semibold">
                  {formData.dropZone || '________________________________'}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-8">
                <div>
                  <div className="border-b border-black mb-1">JUMPMASTER</div>
                  <div className="text-xs text-gray-500">(Signature)</div>
                </div>
                <div>
                  <div className="border-b border-black mb-1">DATE</div>
                  <div className="text-xs text-gray-500">(Date)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Preview Notes:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Mission Data:</strong> Shows in first row under headers (blue text)</li>
              <li>• <strong>Personnel:</strong> {allPersonnel.length} total personnel will be listed</li>
              <li>• <strong>Alignment:</strong> LINE NO, GRADE, ORGANIZATION, TYPE OF JUMP are center-aligned</li>
              <li>• <strong>Names:</strong> LAST NAME--FIRST NAME--MIDDLE INITIAL is left-aligned</li>
              <li>• <strong>Bottom Fields:</strong> Aircraft/Chute, Date, and Drop Zone populate the form lines</li>
              <li>• <strong>Non-Exiting Personnel:</strong> Shown with "////" line numbers and appropriate jump types</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              Print
            </button>
            <button
              onClick={() => {
                const content = document.querySelector(".pdf-preview-content")?.innerHTML;
                if (!content) return;
                const blob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `DA1306_Preview_${new Date().toISOString().split('T')[0]}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              Save Preview
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
