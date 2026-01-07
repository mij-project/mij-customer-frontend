interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  message?: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = '削除しますか？',
  message = 'この操作は取り消せません。',
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                削除中...
              </>
            ) : (
              '削除する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
