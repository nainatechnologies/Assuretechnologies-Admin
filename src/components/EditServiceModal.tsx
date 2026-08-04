import React, { useState, useRef, useEffect } from 'react';
import type { Service, CustomField } from '../types';
import { CATEGORIES } from './ProductForm';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';
import './EditProductModal.css'; // Reuse modal styles

interface EditServiceModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onUpdateService: (updatedService: Service) => void;
}

export default function EditServiceModal({
  service,
  isOpen,
  onClose,
  onUpdateService
}: EditServiceModalProps) {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [prebookingCharge, setPrebookingCharge] = useState<number | undefined>(undefined);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setCategory(service.category || '');
      setSubCategory(service.subCategory || '');
      setImageName(service.imageName || 'No file chosen');
      setImageFile(null);
      setCustomFields(service.customFields || []);
      setPrebookingCharge(service.prebookingCharge);
      
      if (service.image instanceof File) {
        setPreviewUrl(URL.createObjectURL(service.image));
      } else if (typeof service.image === 'string' && service.image) {
        setPreviewUrl(service.image);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [service]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen || !service) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategory) return;

    const updatedService: Service = {
      ...service,
      category,
      subCategory,
      image: imageFile || service.image,
      imageName: imageName || service.imageName || 'No file chosen',
      prebookingCharge,
      customFields: customFields.map(cf => ({
        ...cf,
        options: cf.type === 'dropdown' ? (cf.options?.map(s => s.trim()).filter(s => s) || []) : undefined
      }))
    };

    onUpdateService(updatedService);
    onClose();
  };

  const addCustomField = () => {
    setCustomFields(prev => [
      ...prev, 
      { id: Math.random().toString(36).substring(2, 9), label: '', type: 'text', required: false }
    ]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Service</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">

            {/* Category */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editServiceCategory">Category</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  id="editServiceCategory"
                  className="input-field colorful-input"
                  style={{ width: '100%', paddingRight: '40px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select Category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service Name */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editServiceName">Service Name</label>
              <input
                type="text"
                id="editServiceName"
                className="input-field colorful-input"
                placeholder="Enter service name"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                required
              />
            </div>

            {/* Prebooking Charge */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editPrebookingCharge">Prebooking Charge (₹)</label>
              <input
                type="number"
                id="editPrebookingCharge"
                className="input-field colorful-input"
                placeholder="e.g. 500 (Optional)"
                value={prebookingCharge || ''}
                onChange={(e) => setPrebookingCharge(e.target.value ? Number(e.target.value) : undefined)}
                min="0"
              />
            </div>

            {/* Service Image */}
            <div className="input-group form-group">
              <label className="input-label">Service Image</label>
              <div
                className="modern-file-input"
                onClick={() => imageInputRef.current?.click()}
              >
                <div className="modern-file-btn">Choose File</div>
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ height: '40px', width: 'auto', borderRadius: '4px', marginLeft: '12px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="modern-file-name" title={imageName}>
                    {imageName}
                  </div>
                )}
                <input
                  type="file"
                  id="editServiceImage"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="file-input-hidden"
                  accept="image/*"
                />
              </div>
            </div>

          </div>

          <div className="input-group form-group-full mt-4" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="input-label" style={{ margin: 0 }}>Custom Fields (Booking Form)</label>
              <button 
                type="button" 
                onClick={addCustomField}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              >
                <MdAdd /> Add Field
              </button>
            </div>
            
            {customFields.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>No custom fields added. The default booking form fields will be used.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {customFields.map((field, index) => (
                  <div key={field.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={() => removeCustomField(field.id)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <MdDelete size={20} />
                    </button>
                    
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', paddingRight: '20px' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Field Label *</label>
                        <input 
                          type="text" 
                          required 
                          value={field.label} 
                          onChange={e => updateCustomField(field.id, { label: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          placeholder="e.g. Number of ACs"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Field Type</label>
                        <select 
                          value={field.type} 
                          onChange={e => updateCustomField(field.id, { type: e.target.value as any })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>
                      <div style={{ flex: 0.5, display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={field.required} 
                            onChange={e => updateCustomField(field.id, { required: e.target.checked })}
                          /> Required
                        </label>
                      </div>
                    </div>
                    
                    {field.type === 'dropdown' && (
                      <div>
                        <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Options (Comma separated) *</label>
                        <input 
                          type="text" 
                          required 
                          value={field.options?.join(',') || ''} 
                          onChange={e => updateCustomField(field.id, { options: e.target.value.split(',') })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          placeholder="e.g. Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary update-btn">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
