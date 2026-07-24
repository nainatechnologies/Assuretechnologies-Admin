import { useState } from 'react';
import ServiceForm from '../components/ServiceForm';
import ServiceTable from '../components/ServiceTable';
import EditServiceModal from '../components/EditServiceModal';
import type { Service } from '../types';
import Swal from 'sweetalert2';
import './ManageProducts.css'; // Reusing the modern header styles

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      category: 'ITSupport',
      subCategory: 'On-Site IT Maintenance',
      image: '',
      imageName: 'itsupport.png'
    },
    {
      id: '2',
      category: 'Security',
      subCategory: '24/7 Monitoring',
      image: '',
      imageName: 'monitoring.jpg'
    }
  ]);

  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...newServiceData,
      id: Math.random().toString(36).substring(2, 9)
    };

    setServices(prevServices => [...prevServices, newService]);
    Swal.fire({
      title: 'Added!',
      text: 'New service added successfully.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleEditService = (id: string) => {
    const targetService = services.find(s => s.id === id);
    if (targetService) {
      setEditingService(targetService);
    }
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(prevServices =>
      prevServices.map(s => (s.id === updatedService.id ? updatedService : s))
    );
    setEditingService(null);
    Swal.fire({
      title: 'Updated!',
      text: 'Service has been updated successfully in the table.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteService = (id: string) => {
    Swal.fire({
      title: 'Delete Service?',
      text: 'Are you sure you want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setServices(prevServices => prevServices.filter(s => s.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Service removed successfully.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div>
      <div className="manage-products-header">
        <h1 className="page-title manage-products-title">Manage Services</h1>
      </div>

      {/* Service Form Component */}
      <ServiceForm onAddService={handleAddService} />

      {/* Service Table Component */}
      <ServiceTable
        services={services}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
      />

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          isOpen={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          onUpdateService={handleUpdateService}
        />
      )}
    </div>
  );
}
