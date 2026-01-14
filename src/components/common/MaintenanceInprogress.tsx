import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TrafficCone } from 'lucide-react';


export default function MaintenanceInprogress() {
 
  return (
    <Dialog.Root open={true} onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 animate-in fade-in-0 z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-300"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            {/* <div className="flex items-center justify-end mb-6">
                            <Dialog.Close className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </Dialog.Close>
                        </div> */}

            {/* Logo */}
            <div className="text-center mb-8">
              <Dialog.Title asChild>
                <h4 className="text-md font-bold mb-2 flex items-center justify-center">
                  <TrafficCone className="w-12 h-12 text-red-500" />
                </h4>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="text-red-500 font-bold text-sm">
                  現在サービスはメンテナンス中です。
                  <br />
                  しばらくお待ちください。
                </p>
              </Dialog.Description>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
