import { ClienteFormModal } from './ClienteFormModal';

export function NewClienteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <ClienteFormModal onClose={onClose} /> : null;
}
