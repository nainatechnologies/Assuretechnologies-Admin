import { useState, useEffect } from 'react';
import type { PartnerService } from '../types';
import { MdEdit, MdDelete } from 'react-icons/md';
import { usePartnerContext } from '../context/PartnerContext';
import './ProductTable.css'; 

interface PartnerServiceTableProps {
  services: PartnerService[];
  onEditService: (id: string) => void;
  onDeleteService: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

function ImageCell({ image, alt }: { image?: string | File; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setUrl(null);
      return;
    }
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof image === 'string') {
      setUrl(image);
    }
  }, [image]);

  if (!url) return <span className="product-banner-text">{alt}</span>;
  return <img src={url} alt={alt} style={{ height: '40px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} />;
}

export default function PartnerServiceTable({
  services,
  onEditService,
  onDeleteService,
  onToggleStatus
}: PartnerServiceTableProps) {
  const { pricingTypes } = usePartnerContext();

  if (services.length === 0) {
    return (
      <div className="glass-panel product-table-empty">
        <p>No partner services found. Add a new service to get started.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel product-table-wrapper">
      <div className="product-table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th className="id-col">ID</th>
              <th>Category</th>
              <th>Service Name</th>
              <th>Pricing</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const pType = pricingTypes.find(pt => pt.id === service.pricingTypeId);
              return (
                <tr key={service.id}>
                  <td>
                    <span className="product-id">#{service.id}</span>
                  </td>
                  <td>
                    <span className="product-category-badge">{service.category}</span>
                  </td>
                  <td>
                    <div className="product-name">{service.serviceName}</div>
                  </td>
                  <td>
                    <div className="product-price">
                      <span>₹{service.rate} / {pType ? pType.name : 'Unknown Unit'}</span>
                    </div>
                  </td>
                <td>
                  <div className="product-banner" title={service.imageName}>
                    <ImageCell image={service.image} alt={service.imageName || 'Service Image'} />
                  </div>
                </td>
                <td>
                  <div className="product-actions" style={{ alignItems: 'center' }}>
                    {onToggleStatus && (
                      <label className="switch" title="Toggle Status" style={{ marginRight: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={service.status === 'Active'}
                          onChange={() => onToggleStatus(service.id)}
                        />
                        <span className="slider round"></span>
                      </label>
                    )}
                    <button
                      className="icon-btn edit-icon"
                      onClick={() => onEditService(service.id)}
                      title="Edit Service"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      className="icon-btn delete-icon"
                      onClick={() => onDeleteService(service.id)}
                      title="Delete Service"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
