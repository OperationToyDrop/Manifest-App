import React from 'react';
import { Download, X, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

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
  if (!isOpen) return null;

  const handlePdfExport = async () => {
    const loadPdf = async (): Promise<Uint8Array> => {
      const response = await fetch('/DA Form 1306_blank.pdf');
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    };

    const templateBytes = await loadPdf();
    const mergedPdf = await PDFDocument.create();

    const exiting = personnel.filter(p => !p.isNonExiting);
    const nonExiting = personnel.filter(p => p.isNonExiting);

    const chunks = [];
    for (let i = 0; i < exiting.length; i += 48) {
      chunks.push(exiting.slice(i, i + 48));
    }

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const pdfDoc = await PDFDocument.load(templateBytes);
      const form = pdfDoc.getForm();

      form.getTextField('DATE').setText(formData.date);
      form.getTextField('LOCATION').setText(formData.dropZone);
      form.getTextField('AIRCRAFT').setText(formData.aircraftType);
      form.getTextField('OFFICER').setText('Jumpmaster Name');

      for (let i = 0; i < Math.min(chunk.length, 19); i++) {
        const p = chunk[i];
        form.getTextField(`NAME_A_${i + 1}`).setText(`${p.lastName}, ${p.firstName} ${p.middleInitial}`);
        form.getTextField(`GRADE_A_${i + 1}`).setText(p.grade);
        form.getTextField(`ORG_A_${i + 1}`).setText(p.organization);
        form.getTextField(`TY_JUMP_${i + 1}`).setText(p.jumpType);
      }

      for (let i = 19; i < Math.min(chunk.length, 48); i++) {
        const p = chunk[i];
        const idx = i - 19 + 1;
        form.getTextField(`NAME_B_${idx}`).setText(`${p.lastName}, ${p.firstName} ${p.middleInitial}`);
        form.getTextField(`GRADE_B_${idx}`).setText(p.grade);
        form.getTextField(`ORG_B_${idx}`).setText(p.organization);
        form.getTextField(`TY_JUMP_B${idx}`).setText(p.jumpType);
      }

      const filledPages = await pdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      filledPages.forEach(page => mergedPdf.addPage(page));
    }

    // Add non-exiting personnel (new form if needed)
    if (nonExiting.length > 0) {
      const pdfDoc = await PDFDocument.load(templateBytes);
      const form = pdfDoc.getForm();

      for (let i = 0; i < Math.min(nonExiting.length, 19); i++) {
        const p = nonExiting[i];
        form.getTextField(`NAME_A_${i + 1}`).setText(`${p.lastName}, ${p.firstName} ${p.middleInitial}`);
        form.getTextField(`GRADE_A_${i + 1}`).setText(p.grade);
        form.getTextField(`ORG_A_${i + 1}`).setText(p.organization);
        form.getTextField(`TY_JUMP_${i + 1}`).setText(p.jumpmasterType || p.nonJumperType || 'NON-EXITING');
      }

      for (let i = 19; i < Math.min(nonExiting.length, 48); i++) {
        const p = nonExiting[i];
        const idx = i - 19 + 1;
        form.getTextField(`NAME_B_${idx}`).setText(`${p.lastName}, ${p.firstName} ${p.middleInitial}`);
        form.getTextField(`GRADE_B_${idx}`).setText(p.grade);
        form.getTextField(`ORG_B_${idx}`).setText(p.organization);
        form.getTextField(`TY_JUMP_B${idx}`).setText(p.jumpmasterType || p.nonJumperType || 'NON-EXITING');
      }

      const filledPages = await pdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      filledPages.forEach(page => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();
    const blob = new Blob([finalPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA-Form-1306-${formData.date || 'manifest'}.pdf`;
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
            DA Form 1306 Export
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handlePdfExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};
