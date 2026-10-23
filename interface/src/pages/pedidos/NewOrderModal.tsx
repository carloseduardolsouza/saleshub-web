import { PedidoFormModal } from './PedidoFormModal';

export function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <PedidoFormModal onClose={onClose} /> : null;
}
