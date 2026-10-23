import type { Produto } from '../../api/client';

export const TIPOS_VARIACAO = [
  { value: 'cor', label: 'Cor' },
  { value: 'tamanho', label: 'Tamanho' },
];

export const labelVariacao = (tipo?: string) => (tipo === 'cor' ? 'Cor' : 'Tamanho');

// A API devolve imagens como { id, imagem, ordem }, mas o tipo do client diz string[].
export function imagensDe(p: Produto): string[] {
  return (p.imagens ?? []).map((i) => (typeof i === 'string' ? i : (i as { imagem: string }).imagem)).filter(Boolean);
}

// Reduz a imagem para caber no limite de 10mb do body da API.
export function resizeImage(file: File, max = 800, type: 'image/jpeg' | 'image/png' = 'image/jpeg'): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL(type, 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem invalida')); };
    img.src = url;
  });
}
