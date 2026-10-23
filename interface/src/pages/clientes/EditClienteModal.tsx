import { ClienteFormModal } from './ClienteFormModal';
import type { Cliente } from '../../api/client';

interface Props { open: boolean; cliente: Cliente | null; onClose: () => void }

export function EditClienteModal({ open, cliente, onClose }: Props) {
  return open && cliente ? <ClienteFormModal cliente={cliente} onClose={onClose} /> : null;
}
