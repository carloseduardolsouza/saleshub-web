export const METODO_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartao' },
  { value: 'boleto', label: 'Boleto' },
];

export const STATUS_PEDIDO = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'processando', label: 'Processando' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const labelMetodo = (v?: string) => METODO_PAGAMENTO.find((m) => m.value === v)?.label ?? v ?? '-';
export const labelStatus = (v?: string) => STATUS_PEDIDO.find((s) => s.value === v)?.label ?? 'Pendente';

export const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// aceita "12,5" e "12.5"
export const parseDecimal = (v?: string | null) => parseFloat((v ?? '').replace(',', '.')) || 0;

export function valorDesconto(base: number, tipo: string | undefined, valor?: string | null) {
  const v = Math.max(0, parseDecimal(valor));
  const d = tipo === 'percentual' ? (base * Math.min(v, 100)) / 100 : v;
  return Math.min(d, base);
}

export const formatDescontoLabel = (tipo?: string, valor?: string) =>
  tipo === 'percentual' ? `${valor}%` : formatBRL(parseDecimal(valor));
