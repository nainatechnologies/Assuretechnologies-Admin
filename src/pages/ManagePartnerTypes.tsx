import { useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdClose, MdSave } from 'react-icons/md';
import type { PartnerType, PartnerCustomField } from '../types';
import { usePartnerContext } from '../context/PartnerContext';
import Swal from 'sweetalert2';

export default function ManagePartnerTypes() {
  const { partnerTypes, setPartnerTypes } = usePartnerContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PartnerType | null>(null);

  // Form State
  const [typeName, setTypeName] = useState('');
  const [customFields, setCustomFields] = useState<PartnerCustomField[]>([]);

  const handleAddType = () => {
    setEditingType(null);
    setTypeName('');
    setCustomFields([]);
    setIsModalOpen(true);
  };

  const handleEditType = (type: PartnerType) => {
    setEditingType(type);
    setTypeName(type.name);
    setCustomFields([...type.customFields]);
    setIsModalOpen(true);
  };

  const handleDeleteType = (id: string) => {
    Swal.fire({
      title: 'Delete Partner Type?',
      text: 'Are you sure you want to delete this partner type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setPartnerTypes(prev => prev.filter(t => t.id !== id));
        Swal.fire('Deleted!', 'Partner Type deleted.', 'success');
      }
    });
  };

  const handleAddField = () => {
    setCustomFields(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), label: '', type: 'text', required: false }
    ]);
  };

  const handleUpdateField = (id: string, key: keyof PartnerCustomField, value: any) => {
    setCustomFields(prev => prev.map(f => {
      if (f.id === id) {
        if (key === 'type' && value !== 'dropdown') {
          return { ...f, [key]: value, options: undefined };
        }
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (!typeName.trim()) {
      Swal.fire('Error', 'Partner Type Name is required', 'error');
      return;
    }
    
    // Validate custom fields
    if (customFields.some(f => !f.label.trim())) {
      Swal.fire('Error', 'All custom fields must have a label', 'error');
      return;
    }

    if (editingType) {
      setPartnerTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, name: typeName, customFields } : t));
      Swal.fire('Updated!', 'Partner Type updated successfully.', 'success');
    } else {
      setPartnerTypes(prev => [...prev, { id: `pt${Date.now()}`, name: typeName, customFields }]);
      Swal.fire('Added!', 'Partner Type created successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="manage-page" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Manage Partner Types</h1>
        <button onClick={handleAddType} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          + Add Partner Type
        </button>
      </div>

      <div className="content-card overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4" style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
        <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr className="border-b border-gray-200" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>ID</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Partner Type</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Custom Fields Count</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {partnerTypes.map(type => (
              <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-3 px-4 text-gray-800" style={{ padding: '12px' }}>{type.id}</td>
                <td className="py-3 px-4 text-gray-800 font-medium" style={{ padding: '12px' }}>{type.name}</td>
                <td className="py-3 px-4 text-gray-600" style={{ padding: '12px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {type.customFields.length} Fields
                  </span>
                </td>
                <td className="py-3 px-4" style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditType(type)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit">
                    <MdEdit size={20} />
                  </button>
                  <button onClick={() => handleDeleteType(type.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {partnerTypes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                  No Partner Types found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: '12px', padding: '24px', position: 'relative' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
              {editingType ? 'Edit Partner Type' : 'Add Partner Type'}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Partner Type Name <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" 
                value={typeName}
                onChange={e => setTypeName(e.target.value)}
                placeholder="e.g. Drone, Tractor, Soil Tester"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontWeight: 500, color: '#374151' }}>Custom Fields</label>
                <button type="button" onClick={handleAddField} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  <MdAdd size={18} /> Add Field
                </button>
              </div>
              
              {customFields.length === 0 ? (
                <div style={{ padding: '16px', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  No custom fields added. Click "Add Field" to define required documents or inputs.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customFields.map((field, index) => (
                    <div key={field.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Field Label (e.g. Drone License)"
                          value={field.label}
                          onChange={e => handleUpdateField(field.id, 'label', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                        />
                        {field.type === 'dropdown' && (
                          <input 
                            type="text" 
                            placeholder="Options (comma separated)"
                            value={field.options?.join(', ') || ''}
                            onChange={e => handleUpdateField(field.id, 'options', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                          />
                        )}
                      </div>
                      <select 
                        value={field.type}
                        onChange={e => handleUpdateField(field.id, 'type', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '110px' }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="file">File Upload</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginTop: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={field.required}
                          onChange={e => handleUpdateField(field.id, 'required', e.target.checked)}
                        /> Req
                      </label>
                      <button onClick={() => handleRemoveField(field.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px' }} title="Remove Field">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                Save Partner Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
