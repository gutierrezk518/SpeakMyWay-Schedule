import React from 'react';

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export default function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button 
      className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white hover:bg-red-600 rounded-full text-xs shadow-md z-40 border-2 border-white w-5 h-5 flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label="Remove activity"
    >
      <i className="ri-close-line text-[10px]"></i>
    </button>
  );
}