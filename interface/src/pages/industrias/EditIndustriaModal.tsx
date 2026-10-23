import { IndustriaFormModal } from './IndustriaFormModal';
import type { Industria } from '../../api/client';

interface Props { open: boolean; industria: Industria | null; onClose: () => void }

export function EditIndustriaModal({ open, industria, onClose }: Props) {
  return open && industria ? <IndustriaFormModal industria={industria} onClose={onClose} /> : null;
}
