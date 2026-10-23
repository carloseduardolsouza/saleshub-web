import { PedidoFormModal } from './PedidoFormModal';
import type { Pedido } from '../../api/client';

interface Props { open: boolean; pedido: Pedido | null; onClose: () => void }

export function EditPedidoModal({ open, pedido, onClose }: Props) {
  return open && pedido ? <PedidoFormModal pedido={pedido} onClose={onClose} /> : null;
}
