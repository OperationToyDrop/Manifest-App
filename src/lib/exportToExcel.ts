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
    const templatePath = '/OTD_Manifest_Clean_Template.xlsx';
    const response = await fetch(templatePath);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const exitingPersonnel = personnel.filter(p => !p.isNonExiting);
    const nonExitingPersonnel = personnel.filter(p => p.isNonExiting);

    // Group by Chalk and Door
    const groups: Record<string, Personnel[]> = {};
    exitingPersonnel.forEach(person => {
      const chalk = person.chalk || 'TBD';
      const door = person.door || 'Left';
      const tabName = `${chalk}-${door.toUpperCase()}`;

      if (!groups[tabName]) groups[tabName] = [];
      groups[tabName].push(person);
    });

    for (const [tabName, group] of Object.entries(groups)) {
      let sheet = workbook.getWorksheet(tabName);
      if (!sheet) {
        const templateSheet = workbook.getWorksheet('Clean_Template');
        if (!templateSheet) continue;
        sheet = workbook.addWorksheet(tabName);
        sheet.model = JSON.parse(JSON.stringify(templateSheet.model));
      }

      sheet.getCell('B1').value = formData.date;
      sheet.getCell('B2').value = formData.dropZone;
      sheet.getCell('B3').value = formData.aircraftType;
      sheet.getCell('B4').value = formData.chuteType;
      if (formData.partnerJump === 'yes') {
        sheet.getCell('B5').value = formData.partnerNation;
      }

      group.forEach((person, i) => {
        const row = sheet.getRow(7 + i);
        row.getCell(1).value = i + 1;
        row.getCell(2).value = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
        row.getCell(3).value = person.grade;
        row.getCell(4).value = person.organization;
        row.getCell(5).value = person.jumpType;
        row.commit();
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `DA-Form-1306-${formData.date || 'manifest'}.xlsx`);
  } catch (err) {
    console.error('Error exporting Excel manifest:', err);
    alert('Failed to export Excel file. Check console for details.');
  }
}
