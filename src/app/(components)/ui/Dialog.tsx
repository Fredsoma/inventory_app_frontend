import React, { ReactNode } from "react";



interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-full h-full max-h-full overflow-auto relative">
        {/*<button
          onClick={() => onOpenChange(false)} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label={t("dialog.close")}
        >
           &times;
        </button> */}
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const DialogHeader = ({ children }: { children: ReactNode }) => (
  <div className="border-b pb-2 mb-4 font-bold relative">{children}</div>
);

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);
