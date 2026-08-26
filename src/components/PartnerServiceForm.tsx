import React, { useState, useRef } from 'react';
import type { PartnerService, CustomField } from '../types';
import { MdCheckCircle, MdAdd, MdDelete } from 'react-icons/md';

import { usePartnerContext } from '../context/PartnerContext';

interface PartnerServiceFormProps {
  onSaveService: (service: Omit<PartnerService, 'id'> | PartnerService) => void;
  onCancel?: () => void;
  initialData?: PartnerService | null;
  categories: { id?: string; _id?: string; name: string }[];
  partnerTypes: { id: string; name: string }[];
}

export default function PartnerServiceForm({ onSaveService, onCancel, initialData, categories, partnerTypes }: PartnerServiceFormProps) {
  const { pricingTypes } = usePartnerContext();

  const [category_id, setCategoryId] = useState(initialData?.category_id || '');
  const [serviceName, setServiceName] = useState(initialData?.name || initialData?.serviceName || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>(initialData?.custom_fields || initialData?.customFields || []);
  const [pricingTypeId, setPricingTypeId] = useState<string>(initialData?.pricingTypeId || (pricingTypes.length > 0 ? pricingTypes[0].id : ''));
  const [required_partner_type_id, setRequiredPartnerTypeId] = useState<string>(initialData?.required_partner_type_id || '');
  const [rate, setRate] = useState<number | undefined>(initialData?.price !== undefined ? initialData.price : initialData?.rate);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id || '');
      setServiceName(initialData.name || initialData.serviceName || '');
      setCustomFields(initialData.custom_fields || initialData.customFields || []);
      setPricingTypeId(initialData.pricingTypeId || '');
      setRequiredPartnerTypeId(initialData.required_partner_type_id || '');
      setRate(initialData.price !== undefined ? initialData.price : initialData.rate);
    } else {
      setCategoryId('');
      setServiceName('');
      setCustomFields([]);
      setPricingTypeId(pricingTypes.length > 0 ? pricingTypes[0].id : '');
      setRequiredPartnerTypeId('');
      setRate(undefined);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;

    const submittedData = {
      category_id,
      serviceName,
      image: imageFile || initialData?.image || '',
      imageName: imageFile ? imageFile.name : initialData?.imageName || 'No file chosen',
      pricingTypeId,
      required_partner_type_id,
      rate: rate || 0,
      customFields: customFields.map(cf => ({
        ...cf,
        options: cf.type === 'dropdown' ? (cf.options?.map(s => s.trim()).filter(s => s) || []) : undefined
      }))
    };

    if (initialData) {
      onSaveService({ ...initialData, ...submittedData });
    } else {
      onSaveService(submittedData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
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
    <div className="glass-panel product-form-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="product-form-title" style={{ margin: 0 }}>{initialData ? 'Edit Partner Service' : 'Add Partner Service'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="serviceCategory">Category</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                id="serviceCategory"
                className="input-field category-select colorful-input"
                style={{ width: '100%', paddingRight: '40px' }}
                value={category_id}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="" disabled hidden>Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                ))}
              </select>
              {category_id && <MdCheckCircle color="#10B981" style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }} />}
            </div>

            {/* Required Partner Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Partner Type</label>
              <select
                value={required_partner_type_id}
                onChange={(e) => setRequiredPartnerTypeId(e.target.value)}
                required
                style={{
                  padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '14px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)', appearance: 'none', cursor: 'pointer'
                }}
              >
                <option value="" disabled hidden>Select Partner Type...</option>
                {partnerTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {required_partner_type_id && <MdCheckCircle color="#10B981" style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }} />}
            </div>
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="serviceName">Service Name</label>
            <input
              type="text"
              id="serviceName"
              className="input-field colorful-input"
              placeholder="e.g. 10L Drone Spraying"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="pricingType">Pricing Type</label>
            <select
              id="pricingType"
              className="input-field colorful-select"
              value={pricingTypeId}
              onChange={(e) => setPricingTypeId(e.target.value)}
              required
            >
              {pricingTypes.map(pt => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="rate">Rate (₹)</label>
            <input
              type="number"
              id="rate"
              className="input-field colorful-input"
              placeholder="e.g. 400"
              value={rate || ''}
              onChange={(e) => setRate(e.target.value ? Number(e.target.value) : undefined)}
              min="1"
              required
            />
          </div>

          <div className="input-group form-group-full">
            <label className="input-label">Service Image</label>
            <div
              className="modern-file-input"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="modern-file-btn">Choose File</div>
              <div className="modern-file-name">
                {imageFile ? imageFile.name : 'No file chosen'}
              </div>
              <input
                type="file"
                id="serviceImage"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="file-input-hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="input-group form-group-full mt-4">
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
                {customFields.map((field) => (
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
                          placeholder="e.g. Acreage"
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
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer', fontWeight: 500 }}
            >
              Save Service
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
