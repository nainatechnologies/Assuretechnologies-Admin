import { useState, useEffect } from 'react';
import type { Service } from '../types';
import './ProductTable.css'; // Reuse table styles

interface ServiceTableProps {
  services: Service[];
  onEditService: (id: string) => void;
  onDeleteService: (id: string) => void;
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

export default function ServiceTable({
  services,
  onEditService,
  onDeleteService
}: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <div className="glass-panel product-table-empty">
        <p>No services found. Add a new service to get started.</p>
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
              <th>Sub Category</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>
                  <span className="product-id">#{service.id}</span>
                </td>
                <td>
                  <span className="product-category-badge">{service.category}</span>
                </td>
                <td>
                  <div className="product-name">{service.subCategory}</div>
                </td>
                <td>
                  <div className="product-banner" title={service.imageName}>
                    <ImageCell image={service.image} alt={service.imageName || 'Service Image'} />
                  </div>
                </td>
                <td>
                  <div className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEditService(service.id)}
                      title="Edit Service"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDeleteService(service.id)}
                      title="Delete Service"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
