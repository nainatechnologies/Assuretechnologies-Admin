import { useState, useMemo, useEffect } from 'react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import type { DronePartner } from '../types';
import Swal from 'sweetalert2';
import API from '../services/api';
import DronePartnerModal from '../components/DronePartnerModal';

export default function ManageDronePartners() {
  const [dronePartners, setDronePartners] = useState<DronePartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDronePartner, setEditingDronePartner] = useState<DronePartner | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPartners = async () => {
    try {
      const response = await API.get('/admin/partners');
      if (response.data.success) {
        const mappedPartners: DronePartner[] = response.data.data.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          mobile: p.mobile,
          email: p.email,
          location: p.address || '',
          coverageAreas: Array.isArray(p.coverage_areas) ? p.coverage_areas.join(', ') : '',
          equipmentTypes: Array.isArray(p.services_provided) ? p.services_provided : [],
          status: p.is_active ? 'Active' : 'Inactive',
          partnerType: 'Drone'
        }));
        setDronePartners(mappedPartners);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      Swal.fire('Error', 'Failed to load partners', 'error');
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    return dronePartners.filter(partner => {
      const query = searchQuery.toLowerCase();
      const matchName = partner.name?.toLowerCase().includes(query) || false;
      const matchMobile = partner.mobile?.includes(query) || false;
      const matchEmail = partner.email?.toLowerCase().includes(query) || false;
      const matchLocation = partner.location?.toLowerCase().includes(query) || false;
      const matchEquipment = partner.equipmentTypes?.some(eq => eq.toLowerCase().includes(query)) || false;
      return matchName || matchMobile || matchEmail || matchLocation || matchEquipment;
    });
  }, [dronePartners, searchQuery]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Partner?',
      text: "Are you sure you want to delete this partner?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setDronePartners(prev => prev.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Partner has been deleted.', 'success');
      }
    });
  };

  const handleSave = async (data: any) => {
    if (editingDronePartner) {
      setDronePartners(prev => prev.map(p => p.id === editingDronePartner.id ? { ...p, ...data } : p));
      Swal.fire('Updated!', 'Partner has been updated successfully.', 'success');
      setIsModalOpen(false);
    } else {
      try {
        const payload = {
          email: data.email,
          mobile: data.mobile,
          password: data.password || 'TempPass123!',
          full_name: data.name,
          address: data.location,
          coverage_areas: data.location ? data.location.split(',').map((s: string) => s.trim()) : [],
          services_provided: data.equipmentTypes || []
        };
        const response = await API.post('/admin/partners', payload);
        if (response.data.success) {
          Swal.fire('Added!', 'Partner has been added.', 'success');
          fetchPartners();
          setIsModalOpen(false);
        }
      } catch (error: any) {
        console.error('Create partner error:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to create partner', 'error');
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    setDronePartners(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return p;
    }));
  };

  const handleEdit = (dronePartner: DronePartner) => {
    setEditingDronePartner(dronePartner);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDronePartner(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="manage-page" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Manage Partners</h1>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <MdSearch size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, mobile, pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>
          <button onClick={handleAdd} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            + Add Partner
          </button>
        </div>
      </div>
      
      <div className="content-card overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4" style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
        <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr className="border-b border-gray-200" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>ID</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Name</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Type</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Contact</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Location</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Equipment Types</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length > 0 ? filteredPartners.map(dronePartner => (
              <tr key={dronePartner.id} className="border-b border-gray-100 hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>{dronePartner.id}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ padding: '12px' }}>{dronePartner.name}</td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 500,
                    backgroundColor: dronePartner.partnerType === 'Tractor' ? '#ffedd5' : '#e0e7ff',
                    color: dronePartner.partnerType === 'Tractor' ? '#c2410c' : '#4338ca'
                  }}>
                    {dronePartner.partnerType || 'Drone'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div>{dronePartner.mobile}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{dronePartner.email}</div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>{dronePartner.location}</td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  {(dronePartner.equipmentTypes || []).map((type: string, i: number) => (
                    <span key={i} style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', marginRight: '4px', marginBottom: '4px' }}>
                      {type}
                    </span>
                  ))}
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={dronePartner.status === 'Active'} 
                      onChange={() => handleToggleStatus(dronePartner.id)} 
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} 
                    />
                    <span style={{ 
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                      backgroundColor: dronePartner.status === 'Active' ? '#10b981' : '#d1d5db', 
                      transition: '.3s', borderRadius: '24px' 
                    }}>
                      <span style={{ 
                        position: 'absolute', height: '18px', width: '18px', 
                        left: dronePartner.status === 'Active' ? '19px' : '3px', bottom: '3px', 
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%' 
                      }}></span>
                    </span>
                  </label>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => handleEdit(dronePartner)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                      <MdEdit size={20} />
                    </button>
                    <button onClick={() => handleDelete(dronePartner.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                  No partners found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DronePartnerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        dronePartner={editingDronePartner}
      />
    </div>
  );
}
