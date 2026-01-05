export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-t-3xl overflow-y-auto animate-slide-up mt-24">
        <div className="flex justify-center py-4">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-24">{children}</div>
      </div>
    </div>
  );
};
