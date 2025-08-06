import { Personnel } from '@/types';

export async function exportToSheets(
  personnel: Personnel[],
  formData: {
    date: string;
    dropZone: string;
    aircraftType: string;
    chuteType: string;
    partnerJump: string;
    partnerNation: string;
  }
) {
  const waveDate = new Date(formData.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '').toUpperCase(); // e.g., 08DEC2025

  const waveNumber = '1'; // You can make this dynamic later

  const groupedByChalkDoor = personnel.reduce((acc, person) => {
    if (person.isNonExiting) return acc;
    const chalk = person.chalk || 'TBD';
    const door = person.door || 'Left';
    const key = `${chalk}-${door.toUpperCase()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(person);
    return acc;
  }, {} as Record<string, Personnel[]>);

  for (const [chalkDoor, entries] of Object.entries(groupedByChalkDoor)) {
    const [chalk, door] = chalkDoor.split('-');
    const body = {
      waveDate,
      waveNumber,
      chalk,
      door,
      formData,
      entries
    };

    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbwI9NI2oNYa8XNWcDgbAcIzE5-RGQEdbL-jeORyjLx80L40AOjuyLspbD3oB8UYEV_Caw/exec', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();

      if (result.status !== 'success') {
        alert(`Error exporting to Google Sheets for ${chalkDoor}`);
        console.error(result);
      }
    } catch (err) {
      console.error('Error pushing to Google Sheets:', err);
      alert(`Error exporting manifest for ${chalkDoor}`);
    }
  }

  alert('Manifest data exported to Google Sheets.');
}

