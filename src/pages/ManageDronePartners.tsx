import { useState, useMemo } from 'react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import type { DronePartner } from '../types';
import Swal from 'sweetalert2';
import DronePartnerModal from '../components/DronePartnerModal';

const MOCK_PARTNERS: DronePartner[] = [
  {
    id: 'DP1',
    name: 'AgriDrones AP',
    mobile: '9876543210',
    email: 'agridrones@example.com',
    location: 'Guntur, AP',
    equipmentTypes: ['Standard Spray Drone (10L)', 'Granule Spreader Drone'],
    status: 'Active',
    partnerType: 'Drone'
  },
  {
    id: 'DP2',
    name: 'Kisan Copters',
    mobile: '9876543211',
    email: 'kisancopters@example.com',
    location: 'Warangal, TS',
    equipmentTypes: ['High-Capacity Drone (20L)'],
    status: 'Active',
    partnerType: 'Drone'
  },
  {
    id: 'DP3',
    name: 'Balaji Tractors',
    mobile: '9988776655',
    email: 'balaji@example.com',
    location: 'Guntur, AP',
    equipmentTypes: ['Mahindra 575 DI', 'Swaraj 744 FE'],
    status: 'Active',
    partnerType: 'Tractor',
    vehicleNumber: 'AP 07 AB 1234'
  }
];

export default function ManageDronePartners() {
  const [dronePartners, setDronePartners] = useState<DronePartner[]>(MOCK_PARTNERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDronePartner, setEditingDronePartner] = useState<DronePartner | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSave = (data: any) => {
    if (editingDronePartner) {
      setDronePartners(prev => prev.map(p => p.id === editingDronePartner.id ? { ...p, ...data } : p));
      Swal.fire('Updated!', 'Partner has been updated successfully.', 'success');
    } else {
      const newDronePartner: DronePartner = {
        ...data,
        id: `DP${Math.floor(Math.random() * 1000)}`,
        status: 'Active'
      };
      setDronePartners(prev => [...prev, newDronePartner]);
      Swal.fire('Added!', 'Partner has been added.', 'success');
    }
    setIsModalOpen(false);
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
                  {dronePartner.equipmentTypes.map((type: string, i: number) => (
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
