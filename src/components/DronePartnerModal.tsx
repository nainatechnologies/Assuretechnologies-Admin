import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DronePartner } from '../types';
import './TechnicianModal.css';

interface DronePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dronePartner: DronePartner | Omit<DronePartner, 'id' | 'status'>) => void;
  dronePartner?: DronePartner;
}

export default function DronePartnerModal({ isOpen, onClose, onSave, dronePartner }: DronePartnerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    equipmentTypes: '',
    password: '',
    partnerType: 'Drone' as 'Drone' | 'Tractor',
    vehicleNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodesList, setPincodesList] = useState<string[]>([]);
  
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);

  useEffect(() => {
    if (dronePartner) {
      setFormData({
        name: dronePartner.name || '',
        mobile: dronePartner.mobile || '',
        email: dronePartner.email || '',
        location: dronePartner.location || '',
        equipmentTypes: dronePartner.equipmentTypes ? dronePartner.equipmentTypes.join(', ') : '',
        password: dronePartner.password || '',
        partnerType: (dronePartner.partnerType as any) || 'Drone',
        vehicleNumber: dronePartner.vehicleNumber || ''
      });
      if (dronePartner.location) {
        setPincodesList(dronePartner.location.split(',').map((p: string) => p.trim()).filter(Boolean));
      }
    } else {
      setFormData({ name: '', mobile: '', email: '', location: '', equipmentTypes: '', password: '', partnerType: 'Drone', vehicleNumber: '' });
      setPincodesList([]);
      setIdFile(null);
      setLicenseFile(null);
      setDriverLicenseFile(null);
      setRcFile(null);
    }
  }, [dronePartner, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'mobile') {
      newValue = value.replace(/\D/g, ''); // Only digits
    } else if (name === 'pincodeInput') {
      newValue = value.replace(/\D/g, ''); // Only digits
      setPincodeInput(newValue);
      setErrors(prev => ({ ...prev, location: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handlePreview = (file: File | string | null | undefined) => {
    if (!file) return;
    if (typeof file === 'string') {
      window.open(file, '_blank');
    } else {
      window.open(URL.createObjectURL(file), '_blank');
    }
  };

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLicenseFile(e.target.files[0]);
    }
  };

  const handleDriverLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDriverLicenseFile(e.target.files[0]);
    }
  };

  const handleRcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRcFile(e.target.files[0]);
    }
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
    if (formData.equipmentTypes.trim().length === 0) {
      newErrors.equipmentTypes = "Please add at least one drone type";
      hasError = true;
    }
    if (!dronePartner && formData.password.length < 6) {
      newErrors.password = "Must be at least 6 characters long";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    const equipmentTypesArray = formData.equipmentTypes.split(',').map(t => t.trim()).filter(Boolean);

    const submittedData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      location: formData.location,
      equipmentTypes: equipmentTypesArray,
      password: formData.password,
      partnerType: formData.partnerType,
      vehicleNumber: formData.vehicleNumber,
      ...(idFile && { idFile, idFileName: idFile.name }),
      ...(licenseFile && { licenseFile, licenseFileName: licenseFile.name }),
      ...(driverLicenseFile && { driverLicenseFile, driverLicenseFileName: driverLicenseFile.name }),
      ...(rcFile && { rcFile, rcFileName: rcFile.name })
    };

    if (dronePartner) {
      onSave({ ...dronePartner, ...submittedData });
    } else {
      onSave(submittedData);
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content technician-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{dronePartner ? 'Edit Partner' : 'Add Partner'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body" noValidate>
          <div className="input-group">
            <label className="input-label">Partner Type</label>
            <select 
              name="partnerType" 
              className="input-field" 
              value={formData.partnerType} 
              onChange={handleChange as any}
            >
              <option value="Drone">Drone</option>
              <option value="Tractor">Tractor</option>
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className={`input-field ${errors.name ? 'input-field-error' : ''}`} 
              value={formData.name} 
              onChange={handleChange} 
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="input-group">
            <label className="input-label">Mobile</label>
            <input 
              type="tel" 
              name="mobile" 
              className={`input-field ${errors.mobile ? 'input-field-error' : ''}`} 
              value={formData.mobile} 
              onChange={handleChange} 
              maxLength={10} 
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              name="email" 
              className={`input-field ${errors.email ? 'input-field-error' : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Location (Pincodes)</label>
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

          <div className="input-group">
            <label className="input-label">Equipment Types (comma separated)</label>
            <input 
              type="text" 
              name="equipmentTypes" 
              placeholder={formData.partnerType === 'Drone' ? "Standard 10L, High-Capacity 20L" : "Rotavator, Trailer"}
              className={`input-field ${errors.equipmentTypes ? 'input-field-error' : ''}`} 
              value={formData.equipmentTypes} 
              onChange={handleChange} 
            />
            {errors.equipmentTypes && <span className="error-text">{errors.equipmentTypes}</span>}
          </div>

          {formData.partnerType === 'Tractor' && (
            <div className="input-group">
              <label className="input-label">Vehicle Number</label>
              <input 
                type="text" 
                name="vehicleNumber" 
                placeholder="e.g. AP 07 AB 1234"
                className={`input-field ${errors.vehicleNumber ? 'input-field-error' : ''}`} 
                value={formData.vehicleNumber} 
                onChange={handleChange} 
              />
              {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Set Password (for portal login)</label>
            <input 
              type="password" 
              name="password" 
              className={`input-field ${errors.password ? 'input-field-error' : ''}`} 
              value={formData.password} 
              onChange={handleChange} 
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="file-upload-row">
            <div className="input-group">
              <label className="input-label">Upload ID (Aadhar/PAN)</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="idFile"
                  accept=".pdf,image/*" 
                  onChange={handleIdFileChange}
                  className="file-input-hidden"
                />
                <label htmlFor="idFile" className="file-input-button">
                  Choose File
                </label>
                <span className="file-input-name">
                  {idFile ? idFile.name : dronePartner?.idFileName || 'No file chosen'}
                </span>
                {(idFile || dronePartner?.idFile) && (
                  <button 
                    type="button" 
                    className="preview-btn"
                    onClick={() => handlePreview(idFile || dronePartner?.idFile)}
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>

            {formData.partnerType === 'Drone' && (
              <div className="input-group">
                <label className="input-label">Drone Pilot License</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    id="licenseFile"
                    accept=".pdf,image/*" 
                    onChange={handleLicenseFileChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="licenseFile" className="file-input-button">
                    Choose File
                  </label>
                  <span className="file-input-name">
                    {licenseFile ? licenseFile.name : dronePartner?.licenseFileName || 'No file chosen'}
                  </span>
                  {(licenseFile || dronePartner?.licenseFile) && (
                    <button 
                      type="button" 
                      className="preview-btn"
                      onClick={() => handlePreview(licenseFile || dronePartner?.licenseFile)}
                    >
                      Preview
                    </button>
                  )}
                </div>
              </div>
            )}

            {formData.partnerType === 'Tractor' && (
              <>
                <div className="input-group">
                  <label className="input-label">Driver License</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      id="driverLicenseFile"
                      accept=".pdf,image/*" 
                      onChange={handleDriverLicenseFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="driverLicenseFile" className="file-input-button">
                      Choose File
                    </label>
                    <span className="file-input-name">
                      {driverLicenseFile ? driverLicenseFile.name : dronePartner?.driverLicenseFileName || 'No file chosen'}
                    </span>
                    {(driverLicenseFile || dronePartner?.driverLicenseFile) && (
                      <button 
                        type="button" 
                        className="preview-btn"
                        onClick={() => handlePreview(driverLicenseFile || dronePartner?.driverLicenseFile)}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Registration Certificate (RC)</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      id="rcFile"
                      accept=".pdf,image/*" 
                      onChange={handleRcFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="rcFile" className="file-input-button">
                      Choose File
                    </label>
                    <span className="file-input-name">
                      {rcFile ? rcFile.name : dronePartner?.rcFileName || 'No file chosen'}
                    </span>
                    {(rcFile || dronePartner?.rcFile) && (
                      <button 
                        type="button" 
                        className="preview-btn"
                        onClick={() => handlePreview(rcFile || dronePartner?.rcFile)}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
