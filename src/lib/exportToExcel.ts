import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

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

interface FormData {
  date: string;
  dropZone: string;
  aircraftType: string;
  chuteType: string;
  partnerJump: string;
  partnerNation: string;
}

export async function exportToExcel(personnel: Personnel[], formData: FormData) {
  try {
    const chalk = personnel[0]?.chalk || 'TBD';
    const exitType = personnel.find(p => !p.isNonExiting)?.door || 'Left';
    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace(/ /g, '');

    const fileName = `${formattedDate}_CHALK ${chalk}_${exitType?.toUpperCase()} DOOR_MANIFEST.xlsx`;

    // Load the template from public
    const response = await fetch('/OTD_Manifest_Clean_Template.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // Determine target sheet name
    const sheetName = `${chalk}-${exitType?.toUpperCase()}`;
    let worksheet = workbook.getWorksheet(sheetName);

    // If sheet doesn't exist, duplicate the Clean_Template
    if (!worksheet) {
      const template = workbook.getWorksheet('Clean_Template');
      worksheet = workbook.addWorksheet(sheetName, { properties: { tabColor: { argb: 'FFC0000' } } });
      worksheet.model = JSON.parse(JSON.stringify(template.model));
    }

    // Fill in metadata
    worksheet.getCell('C1').value = formData.date;
    worksheet.getCell('C2').value = formData.dropZone;
    worksheet.getCell('C3').value = formData.aircraftType;
    worksheet.getCell('C4').value = formData.chuteType;
    worksheet.getCell('C5').value = formData.partnerJump === 'yes' ? formData.partnerNation : '';

    // Split personnel into jumpers and non-jumpers
    const jumpers = personnel.filter(p => !p.isNonExiting);
    const nonJumpers = personnel.filter(p => p.isNonExiting);

    let startRow = 7;

    // Insert jumpers
    jumpers.forEach((p, i) => {
      const row = worksheet.getRow(startRow + i);
      row.getCell(1).value = i + 1;
      row.getCell(2).value = `${p.lastName}, ${p.firstName} ${p.middleInitial}`;
      row.getCell(3).value = p.grade;
      row.getCell(4).value = p.organization;
      row.getCell(5).value = p.jumpType;
      row.commit();
    });

    // Leave space and insert non-jumpers
    const nonJumperStart = startRow + jumpers.length + 6;
    nonJumpers.forEach((p, i) => {
      const row = worksheet.getRow(nonJumperStart + i);
      row.getCell(1).value = '////';
      row.getCell(2).value = `${p.lastName}, ${p.firstName} ${p.middleInitial}`;
      row.getCell(3).value = p.grade;
      row.getCell(4).value = p.organization;
      row.getCell(5).value = p.jumpmasterType || p.nonJumperType || p.jumpType;
      row.commit();
    });

    // Write summary
    const summaryRow = worksheet.getRow(67);
    summaryRow.getCell(2).value = `Total Manifested: ${personnel.length}; Total Jumpers: ${jumpers.length}; Total Non-Jumpers: ${nonJumpers.length}`;
    summaryRow.commit();

    // Export the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export failed:', error);
    alert('Error exporting Excel file. Please check the console for details.');
  }
}
