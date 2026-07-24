import React, { useState, useRef } from 'react';
import type { Product } from '../types';
import './ProductForm.css';

export const CATEGORIES = [
  'Networking',
  'Automation',
  'AgriTech',
  'Surveillance',
  'Telephony',
  'Intercom',
  'Biometrics',
  'Communication',
  'Infrastructure',
  'IT Support',
  'Solar',
  'IoT',
  'Security',
  'Sensors',
  'Agriculture',
  'FiberOptics'
];

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id' | 'status'>) => void;
}

export default function ProductForm({ onAddProduct }: ProductFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [description, setDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string or valid numeric input only
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setPrice(val);
      setPriceError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setPriceError('Please enter a valid numeric price');
      return;
    }

    onAddProduct({
      name,
      category,
      price: `₹${parseFloat(price).toFixed(2)}`,
      description,
      banner: bannerFile || '',
      bannerName: bannerFile ? bannerFile.name : 'No image'
    });

    // Reset form
    setName('');
    setCategory('');
    setPrice('');
    setPriceError('');
    setDescription('');
    setBannerFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel product-form-panel">
      <h2 className="product-form-title">Add New Product / Service</h2>

      <form onSubmit={handleSubmit}>
        <div className="product-form-grid">

          <div className="input-group form-group">
            <label className="input-label" htmlFor="productName">Product Name</label>
            <input
              type="text"
              id="productName"
              className="input-field colorful-input"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="category">Category</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                id="category"
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
            </div>
          </div>

          <div className="input-group form-group">
            <label className="input-label" htmlFor="price">Price</label>
            <input
              type="text"
              id="price"
              className="input-field colorful-input"
              placeholder="299.00"
              value={price}
              onChange={handlePriceChange}
              required
            />
            {priceError && <div className="input-error" style={{ marginTop: '4px', marginBottom: 0 }}>{priceError}</div>}
          </div>

          <div className="input-group form-group">
            <label className="input-label">Banner Image</label>
            <div
              className="modern-file-input"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="modern-file-btn">Choose File</div>
              <div className="modern-file-name">
                {bannerFile ? bannerFile.name : 'No file chosen'}
              </div>
              <input
                type="file"
                id="banner"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="file-input-hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="input-group form-group-full">
            <label className="input-label" htmlFor="description">
              Description <span className="char-count" style={{ color: description.length > 100 ? '#ef4444' : 'var(--text-muted)' }}>({description.length}/100)</span>
            </label>
            <textarea
              id="description"
              className="input-field textarea-field colorful-input"
              placeholder="Enter short description (max 100 chars)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              rows={3}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary submit-btn">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}
