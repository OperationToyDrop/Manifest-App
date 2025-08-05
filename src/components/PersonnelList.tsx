import React, { useState } from 'react';
import { GripVertical, Edit2, Check, X, Trash2 } from 'lucide-react';

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

interface PersonnelListProps {
  personnel: Personnel[];
  onPersonnelUpdate: (personnel: Personnel[]) => void;
  onPersonnelDelete: (id: string) => void;
}

const jumpTypeOptions = [
  'J/A/NT',
  'J/A/NT/CE',
  'A/NT',
  'SAFETY',
  'JUMPMASTER',
  'STUDENT',
  'INSTRUCTOR'
];

export const PersonnelList: React.FC<PersonnelListProps> = ({
  personnel,
  onPersonnelUpdate,
  onPersonnelDelete
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingJumpType, setEditingJumpType] = useState('');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = personnel.findIndex(p => p.id === draggedItem);
    const targetIndex = personnel.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPersonnel = [...personnel];
    const [draggedPerson] = newPersonnel.splice(draggedIndex, 1);
    newPersonnel.splice(targetIndex, 0, draggedPerson);

    onPersonnelUpdate(newPersonnel);
    setDraggedItem(null);
  };

  const handleEditJumpType = (person: Personnel) => {
    setEditingId(person.id);
    setEditingJumpType(person.jumpType);
  };

  const handleSaveJumpType = () => {
    if (!editingId) return;
    
    const updatedPersonnel = personnel.map(p =>
      p.id === editingId ? { ...p, jumpType: editingJumpType } : p
    );
    
    onPersonnelUpdate(updatedPersonnel);
    setEditingId(null);
    setEditingJumpType('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingJumpType('');
  };

  // Group personnel by pass number
  const groupedPersonnel = personnel.reduce((groups, person) => {
    const passKey = person.pass || 1;
    if (!groups[passKey]) {
      groups[passKey] = [];
    }
    groups[passKey].push(person);
    return groups;
  }, {} as Record<number, Personnel[]>);

  // Further group by door within each pass (non-exiting personnel go to a special group)
  const groupedByPassAndDoor = Object.keys(groupedPersonnel).reduce((groups, passKey) => {
    const passNumber = Number(passKey);
    const passPersonnel = groupedPersonnel[passNumber];
    
    const doorGroups = passPersonnel.reduce((doorGroup, person) => {
      const doorKey = person.isNonExiting ? 'Non-Exiting' : (person.door || 'Left');
      if (!doorGroup[doorKey]) {
        doorGroup[doorKey] = [];
      }
      doorGroup[doorKey].push(person);
      return doorGroup;
    }, {} as Record<string, Personnel[]>);
    
    groups[passNumber] = doorGroups;
    return groups;
  }, {} as Record<number, Record<string, Personnel[]>>);

  const sortedPasses = Object.keys(groupedPersonnel)
    .map(Number)
    .sort((a, b) => a - b);

  if (personnel.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Personnel Manifest</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No personnel scanned yet</div>
          <div className="text-sm">Start scanning barcodes to populate the manifest</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Personnel Manifest</h2>
      
      <div className="space-y-6">
        {sortedPasses.map(passNumber => (
          <div key={passNumber} className="space-y-2">
            <div className="bg-slate-100 px-4 py-2 rounded-md">
              <h3 className="font-semibold text-slate-700">
                Pass #{passNumber} - Chalk {groupedPersonnel[passNumber][0]?.chalk || 'TBD'}
              </h3>
            </div>
            
            {Object.keys(groupedByPassAndDoor[passNumber] || {}).sort().map(doorType => {
              const doorPersonnel = groupedByPassAndDoor[passNumber][doorType];
              return (
                <div key={`${passNumber}-${doorType}`} className="space-y-2">
                  <div className={`px-4 py-2 rounded-md border-l-4 ${
                    doorType === 'Non-Exiting' 
                      ? 'bg-gray-50 border-gray-400' 
                      : 'bg-amber-50 border-amber-400'
                  }`}>
                    <h4 className={`font-medium ${
                      doorType === 'Non-Exiting' 
                        ? 'text-gray-800' 
                        : 'text-amber-800'
                    }`}>
                      {doorType === 'Non-Exiting' 
                        ? 'Non-Exiting Personnel' 
                        : `${doorType} ${doorType === 'Ramp' ? '' : 'Door'}`
                      }
                    </h4>
                  </div>
                  
                  {doorPersonnel.map((person, index) => (
                    <div
                      key={person.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, person.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, person.id)}
                      className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                        draggedItem === person.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="w-12 text-sm font-medium text-gray-500">
                        {person.isNonExiting ? '////' : `${index + 1}.`}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="font-medium">
                            {person.lastName}, {person.firstName} {person.middleInitial}
                          </div>
                        </div>
                        <div className="text-gray-600">{person.grade}</div>
                        <div className="text-gray-600">{person.organization}</div>
                        <div>
                          {editingId === person.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editingJumpType}
                                onChange={(e) => setEditingJumpType(e.target.value)}
                                className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                              >
                                {jumpTypeOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <button
                                onClick={handleSaveJumpType}
                                className="p-1 text-green-600 hover:text-green-800"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-gray-600 hover:text-gray-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                person.isNonExiting 
                                  ? 'bg-gray-100 text-gray-600' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {person.isNonExiting 
                                  ? (person.jumpmasterType || person.nonJumperType || person.jumpType)
                                  : person.jumpType
                                }
                              </span>
                              <button
                                onClick={() => handleEditJumpType(person)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => onPersonnelDelete(person.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};