import React from 'react';
import { Download, X, FileText } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

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

  const generateDAForm1306Text = () => {
    // Group personnel by pass number
    const groupedPersonnel = personnel.reduce((groups, person) => {
      const passKey = person.pass || 1;
      if (!groups[passKey]) {
        groups[passKey] = [];
      }
      groups[passKey].push(person);
      return groups;
    }, {} as Record<number, Personnel[]>);

    // Separate exiting and non-exiting personnel
    const exitingPersonnel = personnel.filter(p => !p.isNonExiting);
    const nonExitingPersonnel = personnel.filter(p => p.isNonExiting);

    // Group exiting personnel by pass and door
    const exitingGroupedByPass = exitingPersonnel.reduce((groups, person) => {
      const passKey = person.pass || 1;
      if (!groups[passKey]) {
        groups[passKey] = [];
      }
      groups[passKey].push(person);
      return groups;
    }, {} as Record<number, Personnel[]>);

    const exitingGroupedByPassAndDoor = Object.keys(exitingGroupedByPass).reduce((groups, passKey) => {
      const passNumber = Number(passKey);
      const passPersonnel = exitingGroupedByPass[passNumber];
      
      const doorGroups = passPersonnel.reduce((doorGroup, person) => {
        const doorKey = person.door || 'Left';
        if (!doorGroup[doorKey]) {
          doorGroup[doorKey] = [];
        }
        doorGroup[doorKey].push(person);
        return doorGroup;
      }, {} as Record<string, Personnel[]>);
      
      groups[passNumber] = doorGroups;
      return groups;
    }, {} as Record<number, Record<string, Personnel[]>>);

    const sortedPasses = Object.keys(exitingGroupedByPass)
      .map(Number)
      .sort((a, b) => a - b);

    let content = `DA FORM 1306\nSTATEMENT OF JUMP AND LOADING MANIFEST\n\n`;
    content += `Date: ${formData.date}\n`;
    content += `Drop Zone: ${formData.dropZone}\n`;
    content += `Aircraft Type: ${formData.aircraftType}\n`;
    content += `Parachute Type: ${formData.chuteType}\n\n`;

    // Process exiting personnel by pass and door
    sortedPasses.forEach(passNumber => {
      const doorGroups = exitingGroupedByPassAndDoor[passNumber];
      
      Object.keys(doorGroups).sort().forEach(doorType => {
        const doorPersonnel = doorGroups[doorType];
        const firstPerson = doorPersonnel[0];
        
        const exitType = doorType === 'Ramp' ? 'Ramp' : `${doorType} Door`;
        const partnerInfo = formData.partnerJump === 'yes' && formData.partnerNation 
          ? `, ${formData.partnerNation}` 
          : '';
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

    // Process non-exiting personnel at the end
    if (nonExitingPersonnel.length > 0) {
      // Group non-exiting personnel by chalk
      const nonExitingByChalk = nonExitingPersonnel.reduce((groups, person) => {
        const chalkKey = person.chalk || 'TBD';
        if (!groups[chalkKey]) {
          groups[chalkKey] = [];
        }
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

  const handleDownload = async () => {
    const content = generateDAForm1306Text();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA-Form-1306-${formData.date || 'manifest'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    try {
      // Try to load PDF templates in order of preference with better error handling
      const pdfTemplates = [
        '/DA Form 1306_Blank Template.pdf',
        '/DA Form 1306_blank.pdf',
        '/DA Form 1306_blank copy.pdf',
        '/Blank Manifest.pdf',
        '/DA Form 1306_Blank Version.pdf'
      ];
      
      let pdfDoc: PDFDocument;
      let templateUsed = '';
      let loadError = '';
      
      for (const template of pdfTemplates) {
        try {
          console.log(`Attempting to load PDF template: ${template}`);
          const response = await fetch(template);
          
          if (!response.ok) {
            console.log(`Failed to fetch ${template}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const templateBytes = await response.arrayBuffer();
          console.log(`Template ${template} loaded, size: ${templateBytes.byteLength} bytes`);
          
          pdfDoc = await PDFDocument.load(templateBytes);
          templateUsed = template;
          console.log(`Successfully loaded PDF template: ${template}`);
          break;
          
        } catch (error) {
          console.log(`Error loading template ${template}:`, error);
          loadError = error instanceof Error ? error.message : 'Unknown error';
          continue;
        }
      }
      
      if (!pdfDoc) {
        throw new Error(`No PDF template could be loaded. Last error: ${loadError}`);
      }

      // Analyze the PDF form
      const form = pdfDoc.getForm();
      const allFields = form.getFields();
      const textFields = allFields.filter(field => field.constructor.name === 'PDFTextField');
      const checkboxFields = allFields.filter(field => field.constructor.name === 'PDFCheckBox');
      const radioFields = allFields.filter(field => field.constructor.name === 'PDFRadioGroup');
      
      console.log('=========================');
      console.log(`Using template: ${templateUsed}`);
      console.log(`Total fields: ${allFields.length}`);
      console.log(`Text fields: ${textFields.length}`);
      console.log(`Checkbox fields: ${checkboxFields.length}`);
      console.log(`Radio fields: ${radioFields.length}`);
      console.log('All field names:', allFields.map(f => f.getName()));
      console.log('Text fields:', textFields.map(f => f.getName()));
      console.log('Checkbox fields:', checkboxFields.map(f => f.getName()));
      console.log('Radio fields:', radioFields.map(f => f.getName()));
      console.log('=========================');

      // Try to fill form fields if they exist
      if (allFields.length > 0) {
        console.log('PDF has form fields - attempting to fill them');
        
        // Helper function to try filling a field with multiple possible names
        const tryFillField = (value: string, fieldNames: string[]) => {
          for (const fieldName of fieldNames) {
            try {
              const field = form.getTextField(fieldName);
              field.setText(value);
              console.log(`Successfully filled field ${fieldName} with value: ${value}`);
              return true;
            } catch (error) {
              // Field doesn't exist, try next one
              continue;
            }
          }
          return false;
        };

        // Try various field name patterns for basic form data
        tryFillField(formData.date, [
          'DATE', 'Date', 'date', 'DATE_FIELD', 'DateField', 'FLIGHT_DATE', 'FlightDate', 'Text1', 'Text2', 'Text3'
        ]);
        
        tryFillField(formData.dropZone, [
          'DROP_ZONE', 'DropZone', 'drop_zone', 'DZ', 'dz', 'DROPZONE', 'DROP_ZONE_FIELD', 'Text4', 'Text5', 'Text6'
        ]);
        
        tryFillField(formData.aircraftType, [
          'AIRCRAFT', 'Aircraft', 'aircraft', 'AIRCRAFT_TYPE', 'AircraftType', 'ACFT', 'Text7', 'Text8', 'Text9'
        ]);
        
        tryFillField(formData.chuteType, [
          'PARACHUTE', 'Parachute', 'CHUTE', 'Chute', 'CHUTE_TYPE', 'ChuteType', 'PARACHUTE_TYPE', 'Text10', 'Text11', 'Text12'
        ]);
        
        // Try various field name patterns for personnel
        const exitingPersonnel = personnel.filter(p => !p.isNonExiting);
        exitingPersonnel.forEach((person, index) => {
          const fullName = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
          
          const nameFields = [
            `NAME_A_${index + 1}`, `Name_A_${index + 1}`, `name_a_${index + 1}`,
            `NAME${index + 1}`, `Name${index + 1}`, `name${index + 1}`,
            `Text${(index * 4) + 13}`, `Text${(index * 4) + 14}`, `Text${(index * 4) + 15}`,
            `PERSONNEL_NAME_${index + 1}`, `PersonnelName${index + 1}`
          ];
          
          const gradeFields = [
            `GRADE_A_${index + 1}`, `Grade_A_${index + 1}`, `grade_a_${index + 1}`,
            `GRADE${index + 1}`, `Grade${index + 1}`, `grade${index + 1}`,
            `Text${(index * 4) + 16}`, `Text${(index * 4) + 17}`,
            `PERSONNEL_GRADE_${index + 1}`, `PersonnelGrade${index + 1}`
          ];
          
          const orgFields = [
            `ORG_A_${index + 1}`, `Org_A_${index + 1}`, `org_a_${index + 1}`,
            `ORG${index + 1}`, `Org${index + 1}`, `org${index + 1}`,
            `ORGANIZATION_A_${index + 1}`, `Organization_A_${index + 1}`,
            `Text${(index * 4) + 18}`, `Text${(index * 4) + 19}`,
            `PERSONNEL_ORG_${index + 1}`, `PersonnelOrg${index + 1}`
          ];
          
          const jumpFields = [
            `TY_JUMP_${index + 1}`, `Ty_Jump_${index + 1}`, `ty_jump_${index + 1}`,
            `JUMP_TYPE_${index + 1}`, `JumpType_${index + 1}`, `jump_type_${index + 1}`,
            `JUMP${index + 1}`, `Jump${index + 1}`, `jump${index + 1}`,
            `Text${(index * 4) + 20}`, `Text${(index * 4) + 21}`,
            `PERSONNEL_JUMP_${index + 1}`, `PersonnelJump${index + 1}`
          ];
          
          if (!tryFillField(fullName, nameFields)) {
            console.log(`No name field found for person ${index + 1}`);
          }
          
          if (!tryFillField(person.grade, gradeFields)) {
            console.log(`No grade field found for person ${index + 1}`);
          }
          
          if (!tryFillField(person.organization, orgFields)) {
            console.log(`No organization field found for person ${index + 1}`);
          }
          
          if (!tryFillField(person.jumpType, jumpFields)) {
            console.log(`No jump type field found for person ${index + 1}`);
          }
        });
      } else {
        console.log('PDF has no form fields - using text overlay approach');
        // Use text overlay approach for non-fillable PDFs
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        // Define coordinates for form fields based on DA Form 1306 layout
        const lineHeight = 21.6; // Increased spacing between personnel rows
        
        // Bottom section coordinates (measured from bottom of page)
        const aircraftChuteY = 140; // Line after "THE PERSONNEL LISTED HEREON MADE A PARACHUTE JUMP FROM"
        const dateY = 120; // Line after "IN FLIGHT ON"
        const dropZoneY = 100; // Line after "AT"
        
        // Personnel section coordinates (measured from top of page)
        const personnelStartY = height - 180; // Start of personnel table (moved up more)
        const missionDataY = personnelStartY - 30; // First row under headers for mission data
        
        // Define personnel arrays
        const exitingPersonnel = personnel.filter(p => !p.isNonExiting);
        const nonExitingPersonnel = personnel.filter(p => p.isNonExiting);
        
        // Fill bottom section information
        if (formData.aircraftType && formData.chuteType) {
          firstPage.drawText(`${formData.aircraftType}, ${formData.chuteType}`, {
            x: 300, // Adjusted for proper alignment with form field
            y: 140, // Lowered to match form line
            size: 12,
            color: rgb(0, 0, 0),
          });
        }
        
        if (formData.date) {
          firstPage.drawText(formData.date, {
            x: 80, // Adjusted for proper alignment with form field
            y: 120, // Lowered to match form line
            size: 12,
            color: rgb(0, 0, 0),
          });
        }
        
        if (formData.dropZone) {
          firstPage.drawText(formData.dropZone, {
            x: 30, // Moved further left to align with form field
            y: 100, // Lowered to match form line
            size: 12,
            color: rgb(0, 0, 0),
          });
        }
        
        // Add mission data in first available row under column headers
        if (exitingPersonnel.length > 0) {
          const firstPerson = exitingPersonnel[0];
          const chalkInfo = `Chalk ${firstPerson.chalk || 'TBD'}`;
          const passInfo = `Pass ${firstPerson.pass || 1}`;
          const doorInfo = firstPerson.door === 'Ramp' ? 'Ramp' : `${firstPerson.door || 'Left'} Door`;
          const chuteInfo = formData.chuteType || '';
          const partnerInfo = formData.partnerJump === 'yes' && formData.partnerNation ? formData.partnerNation : '';
          
          const missionText = [chalkInfo, passInfo, doorInfo, chuteInfo, partnerInfo].filter(Boolean).join(', ');
          
          // Mission data in LAST NAME column
          firstPage.drawText(missionText, {
            x: 80, // Moved left to align with column start
            y: missionDataY,
            size: 10,
            color: rgb(0, 0, 0),
          });
        }
        
        const personnelToShow = exitingPersonnel;
        
        let currentY = missionDataY - (lineHeight * 1.5); // More space after mission data
        
        // Add exiting personnel first
        personnelToShow.forEach((person, index) => {
          if (currentY > 150) {
            const fullName = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
            
            // LINE NO - center aligned in first column
            firstPage.drawText(`${index + 1}`, {
              x: 40, // Moved left to align with column
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // LAST NAME--FIRST NAME--MIDDLE INITIAL - left aligned in second column
            firstPage.drawText(fullName, {
              x: 80, // Moved left to align with column start
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // GRADE - center aligned in third column
            firstPage.drawText(person.grade, {
              x: 300, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // ORGANIZATION - center aligned in fourth column
            firstPage.drawText(person.organization, {
              x: 380, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // TYPE OF JUMP - center aligned in fifth column
            firstPage.drawText(person.jumpType, {
              x: 480, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            currentY -= (lineHeight * 1.2); // Increased spacing between personnel rows
          }
        });
        
        // Add two blank lines for separation if there are non-exiting personnel
        if (nonExitingPersonnel.length > 0 && currentY > 150) {
          // First blank line
          currentY -= (lineHeight * 1.2);
          // Second blank line
          currentY -= (lineHeight * 1.2); // Second blank line
        }
        
        // Add non-exiting personnel after separation
        nonExitingPersonnel.forEach((person) => {
          if (currentY > 150) {
            const fullName = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
            
            // LINE NO - center aligned in first column
            firstPage.drawText('////', {
              x: 40, // Moved left to align with column
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // LAST NAME--FIRST NAME--MIDDLE INITIAL - left aligned in second column
            firstPage.drawText(fullName, {
              x: 80, // Moved left to align with column start
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // GRADE - center aligned in third column
            firstPage.drawText(person.grade, {
              x: 300, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // ORGANIZATION - center aligned in fourth column
            firstPage.drawText(person.organization, {
              x: 380, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            // TYPE OF JUMP - center aligned in fifth column
            firstPage.drawText(person.jumpmasterType || person.nonJumperType || person.jumpType, {
              x: 480, // Adjusted for proper column alignment
              y: currentY,
              size: 10,
              color: rgb(0, 0, 0),
            });
            
            currentY -= (lineHeight * 1.2); // Increased spacing between personnel rows
          }
        });
      }
      
      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DA-Form-1306-${formData.date || 'manifest'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check that the PDF template is available and try again. May need to try another PDF version.`);
    }
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
            onClick={handlePdfExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
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