import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const getErrorMessage = (err: any, defaultMessage = "Something went wrong"): string => {
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
    const firstError = err.response.data.errors[0];
    return firstError.message || firstError.msg || defaultMessage;
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  return err.message || defaultMessage;
};

export const showApiError = (err: any, defaultMessage = "Something went wrong") => {
  Toast.fire({ icon: 'error', title: getErrorMessage(err, defaultMessage) });
};

export const showSuccessMessage = (message: string) => {
  Toast.fire({ icon: 'success', title: message });
};
