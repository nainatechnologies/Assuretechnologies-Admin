import { useState, useEffect } from 'react';
import { MdEdit, MdClose, MdSave } from 'react-icons/md';

import type { PricingType } from '../types';
import Swal from 'sweetalert2';
import API from '../services/api';

export default function ManagePricingTypes() {
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PricingType | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');

  const fetchPricingTypes = async () => {
    try {
      const response = await API.get('/admin/pricing-types');
      if (response.data.success) {
        setPricingTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pricing types:', error);
    }
  };

  useEffect(() => {
    fetchPricingTypes();
  }, []);

  const handleAddType = () => {
    setEditingType(null);
    setName('');
    setLabel('');
    setIsModalOpen(true);
  };

  const handleEditType = (type: PricingType) => {
    setEditingType(type);
    setName(type.name);
    setLabel(type.label);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (type: PricingType) => {
    try {
      const newStatus = !(type.is_active ?? true);
      // TODO: Replace with actual PATCH API once backend is built
      // const response = await API.patch(`/admin/pricing-types/${type.id}/status`, { is_active: newStatus });
      // if (response.data.success) { ... }
      
      setPricingTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_active: newStatus } : t));
      Swal.fire('Updated!', `Pricing Type is now ${newStatus ? 'Active' : 'Inactive'}.`, 'success');
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !label.trim()) {
      Swal.fire('Error', 'Both Name and Label are required', 'error');
      return;
    }

    try {
      if (editingType) {
        setPricingTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, name, label } : t));
        Swal.fire('Updated!', 'Pricing Type updated successfully.', 'success');
      } else {
        const response = await API.post('/admin/pricing-types', { name, label });
        if (response.data.success) {
          Swal.fire('Added!', 'Pricing Type created successfully.', 'success');
          fetchPricingTypes();
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Manage Pricing Types</h1>
        <button onClick={handleAddType} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          + Add Pricing Type
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>NAME</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>FRONTEND LABEL</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>IS ACTIVE</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563', fontSize: '13px', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pricingTypes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No pricing types found.
                </td>
              </tr>
            ) : (
              pricingTypes.map(type => (
                <tr key={type.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontWeight: 500, color: '#111827' }}>{type.name}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{type.label}</td>
                  <td style={{ padding: '16px' }}>
                    <label className="switch" title="Toggle Status" style={{ margin: 0, position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={type.is_active ?? true}
                        onChange={() => handleToggleStatus(type)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: (type.is_active ?? true) ? '#10B981' : '#ccc', transition: '.4s', borderRadius: '24px' 
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                          transform: (type.is_active ?? true) ? 'translateX(16px)' : 'translateX(0)'
                        }}></span>
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEditType(type)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '4px' }}
                      title="Edit"
                    >
                      <MdEdit size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {editingType ? 'Edit Pricing Type' : 'Add Pricing Type'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <MdClose size={24} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Name (e.g. Per Acre)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Frontend Label (e.g. Number of Acres)</label>
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter label"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f9fafb', borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MdSave size={18} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
