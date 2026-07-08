import React from 'react';
import {
  Modal as HeroUIModal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps as HeroUIModalProps,
} from '@heroui/react';

export interface ModalProps extends Omit<HeroUIModalProps, 'children'> {
  /** Modal title */
  title?: string;
  /** Modal subtitle */
  subtitle?: string;
  /** Subtitle color variant */
  subtitleVariant?: 'brand' | 'danger' | 'success' | 'warning' | 'default';
  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close button aria-label */
  closeButtonAriaLabel?: string;
  /** Custom header content (replaces title/subtitle) */
  headerContent?: React.ReactNode;
  /** Footer content */
  footerContent?: React.ReactNode;
  /** Children */
  children: React.ReactNode;
  /** Disable backdrop click to close */
  disableBackdropClose?: boolean;
  /** Disable ESC key to close */
  disableEscClose?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Backdrop className */
  backdropClassName?: string;
}

const sizeStyles: Record<ModalProps['size'], string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] lg:max-w-[60vw]',
};

const subtitleStyles: Record<ModalProps['subtitleVariant'], string> = {
  brand: 'text-brand-400',
  danger: 'text-danger-400',
  success: 'text-success-400',
  warning: 'text-warning-400',
  default: 'text-zinc-400',
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onOpenChange,
      title,
      subtitle,
      subtitleVariant = 'brand',
      size = 'md',
      showCloseButton = true,
      closeButtonAriaLabel = 'Close modal',
      headerContent,
      footerContent,
      children,
      disableBackdropClose = false,
      disableEscClose = false,
      containerClassName = '',
      backdropClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null;

    const defaultBackdropClassName = `
      fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4
      ${backdropClassName}
    `;

    const defaultContainerClassName = `
      bg-zinc-950 border border-zinc-800 rounded-[28px] w-full ${sizeStyles[size]}
      max-h-[90vh] overflow-hidden text-white shadow-2xl
      ${containerClassName}
    `;

    return (
      <HeroUIModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        ref={ref}
        {...props}
      >
        <ModalBackdrop className={defaultBackdropClassName}>
          <ModalContainer className={defaultContainerClassName}>
            <ModalDialog className="outline-none flex flex-col h-full">
              {headerContent || title || showCloseButton ? (
                <ModalHeader className="flex flex-col gap-1 text-left pr-4 mt-4 px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      {subtitle && (
                        <span className={`text-xs uppercase font-extrabold tracking-widest ${subtitleStyles[subtitleVariant]}`}>
                          {subtitle}
                        </span>
                      )}
                      {title && <h3 className="text-lg font-extrabold text-white mt-1">{title}</h3>}
                    </div>
                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={() => onOpenChange?.(false)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
                        aria-label={closeButtonAriaLabel}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </ModalHeader>
              ) : null}

              <ModalBody className="flex-1 overflow-y-auto px-6 pb-6">
                {children}
              </ModalBody>

              {(footerContent || (props as any).footer) && (
                <ModalFooter className="flex items-center gap-3 px-6 pb-6 border-t border-zinc-800">
                  {footerContent}
                </ModalFooter>
              )}
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </HeroUIModal>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;