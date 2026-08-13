import { useState, useMemo, useEffect } from 'react';
import { MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import type { Partner, PartnerType, PartnerService } from '../types';
import Swal from 'sweetalert2';
import PartnerModal from '../components/PartnerModal';
import API from '../services/api';

export default function ManagePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);
  const [partnerServices] = useState<PartnerService[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPartners = async () => {
    try {
      const response = await API.get('/admin/partners');
      if (response.data.success) {
        const mapped = response.data.data.map((p: any) => ({
          id: p.id,
          display_id: p.display_id,
          name: p.full_name,
          email: p.email,
          mobile: p.mobile,
          password: '',
          location: p.address,
          partnerTypeId: p.partner_type_id,
          customFieldValues: p.custom_field_values,
          services: p.services_provided || [],
          status: p.is_active ? 'Active' : 'Inactive'
        }));
        setPartners(mapped);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchTypesAndServices = async () => {
    try {
      // Assuming these endpoints exist or will exist shortly.
      // If not, it falls back gracefully or uses empty.
      const typesRes = await API.get('/admin/partner-types');
      if (typesRes.data.success) {
        setPartnerTypes(typesRes.data.data.map((pt: any) => ({
          id: pt.id,
          name: pt.name,
          customFields: pt.custom_fields || []
        })));
      }
      // For now services might still be mock or we can fetch them if implemented
    } catch (error) {
      console.error('Error fetching partner types:', error);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchTypesAndServices();
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const query = searchQuery.toLowerCase();
      const matchName = partner.name?.toLowerCase().includes(query) || false;
      const matchMobile = partner.mobile?.includes(query) || false;
      const matchEmail = partner.email?.toLowerCase().includes(query) || false;
      const matchLocation = partner.location?.toLowerCase().includes(query) || false;
      return matchName || matchMobile || matchEmail || matchLocation;
    });
  }, [partners, searchQuery]);

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
        // Implement delete API call if backend supports it
        setPartners(prev => prev.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Partner has been deleted.', 'success');
      }
    });
  };

  const handleSave = async (data: any) => {
    try {
      if (editingPartner) {
        // Implement update API call
        setPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...p, ...data } : p));
        Swal.fire('Updated!', 'Partner has been updated successfully.', 'success');
      } else {
        const payload = {
          full_name: data.name,
          email: data.email,
          mobile: data.mobile,
          password: data.password,
          address: data.location,
          partner_type_id: data.partnerTypeId,
          custom_field_values: data.customFieldValues,
          services_provided: data.services,
          coverage_areas: []
        };
        const response = await API.post('/admin/partners', payload);
        if (response.data.success) {
          Swal.fire('Added!', 'Partner has been added.', 'success');
          fetchPartners();
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const handleToggleStatus = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return p;
    }));
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPartner(undefined);
    setIsModalOpen(true);
  };

  const getPartnerTypeName = (id: string) => {
    return partnerTypes.find(pt => pt.id === id)?.name || 'Unknown';
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
              placeholder="Search by name, mobile..."
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
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Assigned Services</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600" style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length > 0 ? filteredPartners.map(partner => (
              <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-3 px-4 text-sm font-medium" style={{ padding: '12px' }}>{partner.display_id || partner.id}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ padding: '12px' }}>{partner.name}</td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 500,
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca'
                  }}>
                    {getPartnerTypeName(partner.partnerTypeId)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div>{partner.mobile}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{partner.email}</div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>{partner.location}</td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {partner.services.length > 0 ? partner.services.map((svc, index) => (
                      <span key={index} style={{ fontSize: '11px', padding: '2px 6px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {svc}
                      </span>
                    )) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>No services</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={partner.status === 'Active'} 
                      onChange={() => handleToggleStatus(partner.id)} 
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} 
                    />
                    <span style={{ 
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                      backgroundColor: partner.status === 'Active' ? '#10b981' : '#d1d5db', 
                      transition: '.3s', borderRadius: '24px' 
                    }}>
                      <span style={{ 
                        position: 'absolute', height: '18px', width: '18px', 
                        left: partner.status === 'Active' ? '19px' : '3px', bottom: '3px', 
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%' 
                      }}></span>
                    </span>
                  </label>
                </td>
                <td className="py-3 px-4 text-sm" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => handleEdit(partner)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                      <MdEdit size={20} />
                    </button>
                    <button onClick={() => handleDelete(partner.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
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

      <PartnerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        partner={editingPartner}
        partnerTypes={partnerTypes}
        partnerServices={partnerServices}
      />
    </div>
  );
}
