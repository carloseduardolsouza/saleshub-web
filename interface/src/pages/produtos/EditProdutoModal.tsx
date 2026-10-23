import { ProdutoFormModal } from './ProdutoFormModal';
import type { Produto } from '../../api/client';

interface Props { open: boolean; produto: Produto | null; onClose: () => void }

export function EditProdutoModal({ open, produto, onClose }: Props) {
  return open && produto ? <ProdutoFormModal produto={produto} onClose={onClose} /> : null;
}
