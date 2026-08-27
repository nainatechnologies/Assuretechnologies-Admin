import Swal from 'sweetalert2';
import API from '../services/api';

interface ConfirmAndCallOptions {
  title: string;
  text: string;
  icon?: 'question' | 'warning' | 'error' | 'success' | 'info';
  confirmColor?: string;
  confirmText?: string;
  apiCall: () => Promise<any>;
  successTitle: string;
  successText: string;
  errorText: string;
  onSuccess?: () => void;
}

export async function confirmAndCall(options: ConfirmAndCallOptions) {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || 'question',
    showCancelButton: true,
    confirmButtonColor: options.confirmColor || '#10b981',
    confirmButtonText: options.confirmText || 'Yes',
  });

  if (result.isConfirmed) {
    try {
      await options.apiCall();
      Swal.fire(options.successTitle, options.successText, 'success');
      options.onSuccess?.();
    } catch (error) {
      Swal.fire('Error', options.errorText, 'error');
    }
  }
}

export async function updateBookingStatus(id: string, status: string, onSuccess: () => void, labels: { successTitle: string; successText: string; errorText: string; confirmTitle: string; confirmText: string; icon?: 'question' | 'warning'; confirmColor?: string; confirmBtnText?: string }) {
  return confirmAndCall({
    title: labels.confirmTitle,
    text: labels.confirmText,
    icon: labels.icon || 'question',
    confirmColor: labels.confirmColor || '#10b981',
    confirmText: labels.confirmBtnText || 'Yes',
    apiCall: () => API.put(`/admin/service-bookings/${id}/status`, { status }),
    successTitle: labels.successTitle,
    successText: labels.successText,
    errorText: labels.errorText,
    onSuccess,
  });
}
