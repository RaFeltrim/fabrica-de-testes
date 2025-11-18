import React, { useState, useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast-notification ${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}>
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
