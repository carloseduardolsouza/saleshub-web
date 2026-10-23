import { useState, useEffect, useRef } from 'react';
import { X, Package, Edit2, Plus, Trash2, ImagePlus, AlertCircle } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Produto } from '../../api/client';
import { TIPOS_VARIACAO, imagensDe, labelVariacao, resizeImage } from './produtoUtils';
import '../pages-common.css';
import './NewProdutoModal.css';
import './produtos-extra.css';

const MAX_IMAGENS = 5;

interface Props {
  produto?: Produto | null;
  onClose: () => void;
}

// Montado só enquanto aberto (ver wrappers New/Edit), então o estado inicial vem sempre do produto.
export function ProdutoFormModal({ produto, onClose }: Props) {
  const isEdit = !!produto?.id;
  const [industrias, setIndustrias] = useState<{ id: number; nome: string }[]>([]);
  const [form, setForm] = useState({
    nome: produto?.nome ?? '',
    preco: produto ? String(produto.preco) : '',
    industria: produto?.industria ?? '',
    descricao: produto?.descricao ?? '',
  });
  const [variacoes, setVariacoes] = useState<{ tipo: string; valor: string }[]>(
    () => (produto?.variacoes ?? []).map((v) => ({ tipo: v.tipo, valor: v.valor }))
  );
  const [imagens, setImagens] = useState<string[]>(() => (produto ? imagensDe(produto) : []));
  const [novoTipo, setNovoTipo] = useState('cor');
  const [novoValor, setNovoValor] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.industrias.getAll()
      .then((i) => { if (!cancelled) setIndustrias(i.map((ind) => ({ id: ind.id!, nome: ind.nome }))); })
      .catch(() => { if (!cancelled) setError('Nao foi possivel carregar as industrias.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  function addVariacao() {
    const valor = novoValor.trim();
    if (!valor) return;
    if (variacoes.some((v) => v.tipo === novoTipo && v.valor.toLowerCase() === valor.toLowerCase())) {
      setNovoValor('');
      return;
    }
    setVariacoes((prev) => [...prev, { tipo: novoTipo, valor }]);
    setNovoValor('');
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError('');
    try {
      const novas = await Promise.all(
        Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, MAX_IMAGENS - imagens.length).map((f) => resizeImage(f))
      );
      setImagens((prev) => [...prev, ...novas].slice(0, MAX_IMAGENS));
    } catch {
      setError('Nao foi possivel ler a imagem selecionada.');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSave() {
    setError('');
    const preco = parseFloat(form.preco.replace(',', '.'));
    if (!form.nome.trim()) return setError('Informe o nome do produto.');
    if (!(preco > 0)) return setError('Informe um preco maior que zero.');
    if (!form.industria) return setError('Selecione a industria.');

    const payload: Produto = {
      nome: form.nome.trim(),
      preco,
      industria: form.industria,
      descricao: form.descricao.trim() || undefined,
      imagens,
      variacoes,
    };

    setSaving(true);
    try {
      if (isEdit) await api.produtos.update(produto!.id!, payload);
      else await api.produtos.create(payload);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar produto');
      setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              {isEdit ? <Edit2 size={20} /> : <Package size={20} />}
              <h2 className="modal-title">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section__title">Dados do Produto</h3>
              <CustomInput
                label="Nome do Produto *"
                value={form.nome}
                onChange={(e) => updateField('nome', e.target.value)}
                placeholder="Nome do produto"
                autoFocus
              />
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="Preco *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => updateField('preco', e.target.value)}
                  placeholder="0,00"
                />
                <div className="form-group">
                  <label className="form-label">Industria *</label>
                  <select className="form-select" value={form.industria} onChange={(e) => updateField('industria', e.target.value)}>
                    <option value="">Selecione</option>
                    {/* mantém a indústria atual mesmo que tenha sido renomeada/removida */}
                    {form.industria && !industrias.some((i) => i.nome === form.industria) && (
                      <option value={form.industria}>{form.industria}</option>
                    )}
                    {industrias.map((ind) => <option key={ind.id} value={ind.nome}>{ind.nome}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Imagens ({imagens.length}/{MAX_IMAGENS})</h3>
              <div className="produto-imagens">
                {imagens.map((src, i) => (
                  <div key={i} className="produto-imagem item-enter">
                    <img src={src} alt={`Imagem ${i + 1}`} />
                    <button type="button" aria-label="Remover imagem" onClick={() => setImagens((prev) => prev.filter((_, idx) => idx !== i))}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imagens.length < MAX_IMAGENS && (
                  <button type="button" className="produto-imagem-add" onClick={() => fileRef.current?.click()}>
                    <ImagePlus size={20} />
                    <span>Adicionar</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Descricao</h3>
              <textarea
                className="form-textarea"
                value={form.descricao}
                onChange={(e) => updateField('descricao', e.target.value)}
                placeholder="Descricao do produto (opcional)..."
                rows={3}
              />
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Variacoes</h3>
              <div className="variacao-input">
                <select className="form-select variacao-input__tipo" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} aria-label="Tipo de variacao">
                  {TIPOS_VARIACAO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <CustomInput
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariacao(); } }}
                  placeholder={novoTipo === 'cor' ? 'Ex: Vermelho' : 'Ex: M'}
                />
                <CustomButton type="button" variant="outline" size="sm" icon={<Plus size={14} />} onClick={addVariacao}>
                  Add
                </CustomButton>
              </div>

              {variacoes.length > 0 && (
                <div className="variacao-list">
                  {variacoes.map((v, idx) => (
                    <div key={`${v.tipo}:${v.valor}`} className="variacao-item item-enter">
                      <span className="variacao-item__name"><strong>{labelVariacao(v.tipo)}:</strong> {v.valor}</span>
                      <button type="button" className="variacao-item__remove" aria-label="Remover variacao" onClick={() => setVariacoes((prev) => prev.filter((_, i) => i !== idx))}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {error ? <span className="order-error" role="alert"><AlertCircle size={14} /> {error}</span> : <span />}
            <div className="modal-footer__actions">
              <CustomButton variant="outline" onClick={onClose} disabled={saving}>Cancelar</CustomButton>
              <CustomButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Salvar Produto'}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
