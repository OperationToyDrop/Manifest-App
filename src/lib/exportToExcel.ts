import { utils, writeFile } from 'xlsx';

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
  const wb = utils.book_new();

  // Group by chalk and door
  const grouped = personnel.reduce((acc, person) => {
    const chalk = person.chalk || 'TBD';
    const door = person.isNonExiting ? 'Non-Exiting' : person.door || 'Left';
    const key = `${chalk}-${door}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(person);
    return acc;
  }, {} as Record<string, Personnel[]>);

  for (const [sheetName, group] of Object.entries(grouped)) {
    const sheetData = [
      ['#', 'Name', 'Grade', 'Organization', 'Jump Type'],
      ...group.map((person, idx) => {
        const name = `${person.lastName}, ${person.firstName} ${person.middleInitial}`;
        const jumpType = person.jumpmasterType || person.nonJumperType || person.jumpType;
        const number = person.isNonExiting ? '////' : idx + 1;
        return [number, name, person.grade, person.organization, jumpType];
      })
    ];
    const ws = utils.aoa_to_sheet(sheetData);
    utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel sheet name max length is 31
  }

  const fileName = `Manifest_${formData.date.replace(/\s+/g, '_')}.xlsx`;
  writeFile(wb, fileName);
}
