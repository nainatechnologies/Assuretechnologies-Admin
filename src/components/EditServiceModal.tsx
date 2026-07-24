import React, { useState, useRef, useEffect } from 'react';
import type { Service } from '../types';
import { CATEGORIES } from './ProductForm';
import { MdClose } from 'react-icons/md';
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

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setCategory(service.category || '');
      setSubCategory(service.subCategory || '');
      setImageName(service.imageName || 'No file chosen');
      setImageFile(null);
      
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
      imageName: imageName || service.imageName || 'No file chosen'
    };

    onUpdateService(updatedService);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
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
