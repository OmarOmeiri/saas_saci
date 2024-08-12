import ToastMaker from 'toastmaker';

export const showToast = (text: string, timeout = 2000) => {
  ToastMaker(text, timeout,  {
    styles: {
      fontSize: '20px',
      backgroundColor: '#545754',
      padding: '1rem 1.5rem',
      bottom: '4rem',
    },
    align: 'center',
    valign: 'bottom'
  });
}