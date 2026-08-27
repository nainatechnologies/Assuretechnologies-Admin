import { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdAdd, MdClose, MdSave } from 'react-icons/md';
import type { PartnerType, PartnerCustomField } from '../types';
import Swal from 'sweetalert2';
import API from '../services/api';

export default function ManagePartnerTypes() {
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PartnerType | null>(null);

  // Form State
  const [typeName, setTypeName] = useState('');
  const [customFields, setCustomFields] = useState<PartnerCustomField[]>([]);

  const fetchPartnerTypes = async () => {
    try {
      const response = await API.get('/admin/partner-types');
      if (response.data.success) {
        setPartnerTypes(response.data.data.map((pt: any) => ({
          id: pt.id,
          name: pt.name,
          customFields: pt.custom_fields || []
        })));
      }
    } catch (error) {
      console.error('Error fetching partner types:', error);
    }
  };

  useEffect(() => {
    fetchPartnerTypes();
  }, []);

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
        // Implement delete API if available, for now just local state
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

  const handleSave = async () => {
    if (!typeName.trim()) {
      Swal.fire('Error', 'Partner Type Name is required', 'error');
      return;
    }
    
    // Validate custom fields
    if (customFields.some(f => !f.label.trim())) {
      Swal.fire('Error', 'All custom fields must have a label', 'error');
      return;
    }

    try {
      if (editingType) {
        // Assume PUT API exists or will exist. For now mock local state update if it doesn't
        setPartnerTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, name: typeName, customFields } : t));
        Swal.fire('Updated!', 'Partner Type updated successfully.', 'success');
      } else {
        const response = await API.post('/admin/partner-types', {
          name: typeName,
          custom_fields: customFields
        });
        if (response.data.success) {
          Swal.fire('Added!', 'Partner Type created successfully.', 'success');
          fetchPartnerTypes();
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save', 'error');
    }
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
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Type Name</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Custom Fields Count</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Fields Required</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {partnerTypes.length > 0 ? partnerTypes.map(type => (
              <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-3 px-4 text-sm font-medium" style={{ padding: '12px', color: '#111827' }}>
                  {type.name}
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px', color: '#4b5563' }}>
                  {type.customFields.length} Fields
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {type.customFields.map(cf => (
                      <span key={cf.id} style={{ 
                        fontSize: '11px', padding: '2px 8px', background: '#f1f5f9', 
                        border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569' 
                      }}>
                        {cf.label} {cf.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </span>
                    ))}
                    {type.customFields.length === 0 && <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>None</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => handleEditType(type)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit">
                      <MdEdit size={20} />
                    </button>
                    <button onClick={() => handleDeleteType(type.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No partner types found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {editingType ? 'Edit Partner Type' : 'Add Partner Type'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <MdClose size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Type Name (e.g. Drone, Tractor)</label>
                <input 
                  type="text" 
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Enter partner type name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', margin: 0 }}>Custom Fields Requirements</label>
                  <button onClick={handleAddField} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                    <MdAdd size={16} /> Add Field
                  </button>
                </div>

                {customFields.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', color: '#6b7280', fontSize: '14px' }}>
                    No custom fields defined. This partner type will only require standard information (Name, Mobile, Email).
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {customFields.map((field) => (
                      <div key={field.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <input 
                                type="text" 
                                value={field.label}
                                onChange={(e) => handleUpdateField(field.id, 'label', e.target.value)}
                                placeholder="Field Label (e.g. Vehicle Number)"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px' }}
                              />
                            </div>
                            <div>
                              <select 
                                value={field.type}
                                onChange={(e) => handleUpdateField(field.id, 'type', e.target.value as any)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px', backgroundColor: 'white' }}
                              >
                                <option value="text">Text Input</option>
                                <option value="file">File Upload (Document/Image)</option>
                                <option value="dropdown">Dropdown Options</option>
                              </select>
                            </div>
                          </div>

                          {field.type === 'dropdown' && (
                            <div>
                              <input 
                                type="text" 
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => {
                                  const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  handleUpdateField(field.id, 'options', opts);
                                }}
                                placeholder="Comma separated options (e.g. Manual, Mounted)"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px' }}
                              />
                            </div>
                          )}

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={field.required}
                              onChange={(e) => handleUpdateField(field.id, 'required', e.target.checked)}
                            />
                            Required Field
                          </label>
                        </div>
                        <button onClick={() => handleRemoveField(field.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} title="Remove Field">
                          <MdDelete size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb', borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MdSave size={18} /> Save Type
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
