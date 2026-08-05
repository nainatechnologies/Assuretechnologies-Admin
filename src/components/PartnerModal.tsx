import { useState, useEffect } from 'react';
import type { Partner, PartnerType, PartnerService } from '../types';
import './TechnicianModal.css';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Partner | Omit<Partner, 'id' | 'status'>) => void;
  partner?: Partner;
  partnerTypes: PartnerType[];
  partnerServices: PartnerService[];
}

export default function PartnerModal({ isOpen, onClose, onSave, partner, partnerTypes, partnerServices }: PartnerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    password: '',
    partnerTypeId: '',
    services: [] as string[]
  });

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodesList, setPincodesList] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        mobile: partner.mobile || '',
        email: partner.email || '',
        location: partner.location || '',
        password: partner.password || '',
        partnerTypeId: partner.partnerTypeId || '',
        services: partner.services || []
      });
      setCustomFieldValues(partner.customFieldValues || {});
      if (partner.location) {
        setPincodesList(partner.location.split(',').map(p => p.trim()).filter(Boolean));
      } else {
        setPincodesList([]);
      }
    } else {
      setFormData({ name: '', mobile: '', email: '', location: '', password: '', partnerTypeId: '', services: [] });
      setCustomFieldValues({});
      setPincodesList([]);
    }
    setErrors({});
  }, [partner, isOpen]);

  if (!isOpen) return null;

  const selectedPartnerType = partnerTypes.find(pt => pt.id === formData.partnerTypeId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'mobile') {
      newValue = value.replace(/\D/g, ''); 
    } else if (name === 'pincodeInput') {
      newValue = value.replace(/\D/g, '');
      setPincodeInput(newValue);
      setErrors(prev => ({ ...prev, location: '' }));
      return;
    } else if (name === 'serviceInput') {
      setServiceInput(newValue);
      setErrors(prev => ({ ...prev, services: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (name === 'partnerTypeId') {
      setCustomFieldValues({}); // reset custom fields when type changes
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAddService = () => {
    const s = serviceInput.trim();
    if (!s) return;
    if (formData.services.includes(s)) {
      setErrors(prev => ({ ...prev, services: 'Service already added' }));
      return;
    }
    setFormData(prev => ({ ...prev, services: [...prev.services, s] }));
    setServiceInput('');
    setErrors(prev => ({ ...prev, services: '' }));
  };

  const handleRemoveService = (s: string) => {
    setFormData(prev => ({ ...prev, services: prev.services.filter(svc => svc !== s) }));
  };

  const handleAddPincode = () => {
    const code = pincodeInput.trim();
    if (!/^\d{6}$/.test(code)) {
      setErrors(prev => ({ ...prev, location: 'Enter a valid 6-digit pincode' }));
      return;
    }
    if (pincodesList.includes(code)) {
      setErrors(prev => ({ ...prev, location: 'Pincode already added' }));
      return;
    }
    const newList = [...pincodesList, code];
    setPincodesList(newList);
    setFormData(prev => ({ ...prev, location: newList.join(', ') }));
    setPincodeInput('');
    setErrors(prev => ({ ...prev, location: '' }));
  };

  const handleRemovePincode = (code: string) => {
    const newList = pincodesList.filter(p => p !== code);
    setPincodesList(newList);
    setFormData(prev => ({ ...prev, location: newList.join(', ') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    let hasError = false;

    if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      hasError = true;
    }
    if (formData.mobile.length !== 10) {
      newErrors.mobile = "Must be exactly 10 digits";
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }
    if (!formData.location || pincodesList.length === 0) {
      newErrors.location = "Please add at least one pincode";
      hasError = true;
    }
    if (!formData.partnerTypeId) {
      newErrors.partnerTypeId = "Please select a partner type";
      hasError = true;
    }
    if (!partner && formData.password.length < 6) {
      newErrors.password = "Must be at least 6 characters long";
      hasError = true;
    }
    if (formData.services.length === 0) {
      newErrors.services = "Please add at least one service";
      hasError = true;
    }

    // Validate custom fields
    if (selectedPartnerType) {
      selectedPartnerType.customFields.forEach(field => {
        if (field.required && !customFieldValues[field.id]) {
          newErrors[`cf_${field.id}`] = "This field is required";
          hasError = true;
        }
      });
    }

    setErrors(newErrors);

    if (hasError) return;

    const submittedData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      location: formData.location,
      password: formData.password,
      partnerTypeId: formData.partnerTypeId,
      services: formData.services,
      customFieldValues
    };

    if (partner) {
      onSave({ ...partner, ...submittedData });
    } else {
      onSave(submittedData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="modal-content technician-modal" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>{partner ? 'Edit Partner' : 'Add Partner'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <form id="partnerForm" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Partner Type</label>
              <select 
                name="partnerTypeId" 
                value={formData.partnerTypeId} 
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              >
                <option value="">Select Type</option>
                {partnerTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {errors.partnerTypeId && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.partnerTypeId}</span>}
            </div>
            
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.name}</span>}
            </div>
            
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Mobile</label>
              <input 
                type="tel" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                maxLength={10} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
              {errors.mobile && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.mobile}</span>}
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email}</span>}
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Location (Pincodes)</label>
              <div className="pincode-input-row">
                <input 
                  type="text"
                  name="pincodeInput" 
                  className={`input-field ${errors.location ? 'input-field-error' : ''}`} 
                  value={pincodeInput} 
                  onChange={handleChange}
                  placeholder="e.g. 500001"
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPincode();
                    }
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                <button type="button" className="btn-add-pincode" onClick={handleAddPincode}>Add</button>
              </div>
              {errors.location && <span className="error-text">{errors.location}</span>}
              
              {pincodesList.length > 0 && (
                <div className="pincode-tags">
                  {pincodesList.map(code => (
                    <span key={code} className="pincode-tag">
                      {code}
                      <button type="button" onClick={() => handleRemovePincode(code)}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!partner && (
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                {errors.password && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.password}</span>}
              </div>
            )}

            {/* Dynamic Custom Fields */}
            {selectedPartnerType && selectedPartnerType.customFields.length > 0 && (
              <div style={{ marginTop: '10px', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>{selectedPartnerType.name} Specific Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {selectedPartnerType.customFields.map(field => (
                    <div key={field.id} className="input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}>
                        {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                      </label>
                      {field.type === 'dropdown' ? (
                        <select 
                          value={customFieldValues[field.id] || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                        >
                          <option value="">Select</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'file' ? (
                        <input 
                          type="file" 
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.files?.[0])}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: 'white' }}
                        />
                      ) : (
                        <input 
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={customFieldValues[field.id] || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                        />
                      )}
                      {errors[`cf_${field.id}`] && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors[`cf_${field.id}`]}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Partner Services Input */}
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Services Provided</h4>
              <div className="pincode-input-row">
                <input 
                  type="text"
                  name="serviceInput"
                  className={`input-field ${errors.services ? 'input-field-error' : ''}`}
                  value={serviceInput}
                  onChange={handleChange}
                  placeholder="e.g. 10L Drone Spraying"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                <button type="button" className="btn-add-pincode" onClick={handleAddService}>Add</button>
              </div>
              {errors.services && <span className="error-text">{errors.services}</span>}
              
              {formData.services.length > 0 && (
                <div className="pincode-tags">
                  {formData.services.map(svc => (
                    <span key={svc} className="pincode-tag">
                      {svc}
                      <button type="button" onClick={() => handleRemoveService(svc)}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="cancel-btn" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" form="partnerForm" className="save-btn" style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: 500, cursor: 'pointer' }}>{partner ? 'Save Changes' : 'Add Partner'}</button>
        </div>
      </div>
    </div>
  );
}
