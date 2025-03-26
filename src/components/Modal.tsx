import { Fragment, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const firstRenderRef = useRef(true);
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll position when modal opens
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [isOpen]);
  
  // Log for debugging
  useEffect(() => {
    if (firstRenderRef.current) {
    
      firstRenderRef.current = false;
    } else {

    }
  }, [isOpen, title]);
  
  // Close button click handler
  const handleCloseButtonClick = () => {
  
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex min-h-full items-center justify-center p-0 md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full h-full md:h-auto md:max-h-[80vh] md:max-w-2xl transform rounded-none md:rounded-2xl bg-white shadow-xl transition-all overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="border-b border-gray-200 px-4 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none p-2"
                      onClick={handleCloseButtonClick}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div 
                  ref={modalContentRef}
                  className="overflow-y-auto flex-1 p-4 md:p-6 overscroll-contain"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    overscrollBehavior: 'contain',
                    WebkitTapHighlightColor: 'rgba(0,0,0,0)'
                  }}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 