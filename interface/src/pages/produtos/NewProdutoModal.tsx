import { ProdutoFormModal } from './ProdutoFormModal';

export function NewProdutoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <ProdutoFormModal onClose={onClose} /> : null;
}
