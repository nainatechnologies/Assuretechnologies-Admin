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
  let msg = defaultMessage;
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
    const firstError = err.response.data.errors[0];
    msg = firstError.message || firstError.msg || defaultMessage;
  } else if (err.response?.data?.message) {
    msg = err.response.data.message;
  } else if (err.message) {
    msg = err.message;
  }
  return typeof msg === 'string' 
    ? msg.replace(/^Validation Error:\s*([a-zA-Z0-9_.]+\s*-\s*)?/i, '').trim()
    : defaultMessage;
};

export const showApiError = (err: any, defaultMessage = "Something went wrong") => {
  Toast.fire({ icon: 'error', title: getErrorMessage(err, defaultMessage) });
};

export const showSuccessMessage = (message: string) => {
  Toast.fire({ icon: 'success', title: message });
};
