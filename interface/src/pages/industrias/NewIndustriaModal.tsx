import { IndustriaFormModal } from './IndustriaFormModal';

export function NewIndustriaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <IndustriaFormModal onClose={onClose} /> : null;
}
