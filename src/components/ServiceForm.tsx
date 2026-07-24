import React, { useState, useRef } from 'react';
import type { Service } from '../types';
import { CATEGORIES } from './ProductForm';
import { MdCheckCircle } from 'react-icons/md';

interface ServiceFormProps {
  onAddService: (service: Omit<Service, 'id'>) => void;
}

export default function ServiceForm({ onAddService }: ServiceFormProps) {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategory) return;

    onAddService({
      category,
      subCategory,
      image: imageFile || '',
      imageName: imageFile ? imageFile.name : 'No file chosen'
    });

    // Reset form
    setCategory('');
    setSubCategory('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel product-form-panel">
      <h2 className="product-form-title">Add New Service</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="serviceCategory">Category</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                id="serviceCategory"
                className="input-field category-select colorful-input"
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
              {category && <MdCheckCircle color="#10B981" style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }} />}
            </div>
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="subCategory">Product Name</label>
            <input
              type="text"
              id="subCategory"
              className="input-field colorful-input"
              placeholder="Enter product name"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
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
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary submit-btn">
            Add Service
          </button>
        </div>
      </form>
    </div>
  );
}
