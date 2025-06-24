import { Loader2 } from "lucide-react";
import React, { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | ReactNode;
  warningText?: string | ReactNode;
  cancelText?: string;
  confirmText?: string;
  cancelButtonClass?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  warningText,
  cancelText = "Cancel",
  confirmText = "Confirm",
  cancelButtonClass = "border-primary text-primary",
  confirmButtonClass = "bg-primary text-white hover:bg-blue-900",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-[20px] relative z-10 w-full max-w-[600px] overflow-hidden py-[30px] px-[30px] box-border">
        <div className="p-6 flex flex-col">
          {/* Header with title and close button */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-2xl font-bold">{title}</h4>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#143881"
                stroke="#143881"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Divider */}
          <div className="w-full h-[1px] bg-gray-200 mb-8"></div>
          
          {/* Content area */}
          <div className="py-8">
            {/* Message */}
            <p className="text-center text-lg">{message}</p>
            {warningText && (
              <p className="text-center text-[#FF1B1B] text-sm mt-2">{warningText}</p>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button onClick={onClose} className={`flex-1 py-2 rounded-lg border-[1px]  font-semibold cursor-pointer flex items-center justify-center ${cancelButtonClass}`}>
              {cancelText}
            </button>
            <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg  font-semibold  flex items-center justify-center cursor-pointer ${confirmButtonClass}`}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
