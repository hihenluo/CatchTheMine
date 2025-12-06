// src/components/Notification.tsx
// This is a reusable notification modal component.

import { useEffect } from 'react';

// Defines the properties (props) the component accepts.
interface NotificationProps {
  message: string;
  type: 'success' | 'error'; // Determines the color and icon.
  onClose: () => void; // Function to call when the notification should close.
}

// A simple checkmark icon for success notifications.
const SuccessIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// A simple X icon for error notifications.
const ErrorIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function Notification({ message, type, onClose }: NotificationProps) {
  // This effect sets a timer to automatically close the notification after 5 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // 5000 milliseconds = 5 seconds

    // This is a cleanup function. It clears the timer if the component is removed
    // before the 5 seconds are up, preventing memory leaks.
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    // The main container, positioned at the top-center of the screen.
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-xl shadow-lg border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        {/* Render the appropriate icon based on the 'type' prop. */}
        {isSuccess ? <SuccessIcon /> : <ErrorIcon />}

        <p className={`text-sm font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
          {message}
        </p>

        {/* The unique 'X' close button. */}
        <button 
          onClick={onClose} 
          className="ml-auto p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-500/10"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}