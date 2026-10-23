import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Bell, Palette, Building2, Database, Info, ChevronRight, Download, Upload, BarChart3, FileJson, X, ImagePlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api } from '../../api/client';
import { maskCnpj, maskPhone } from '../masks';
import { resizeImage } from '../produtos/produtoUtils';
import '../pages-common.css';
import '../../styles/modal.css';
import './Configuracoes.css';
import './config-extra.css';

const omit = (o: Record<string, unknown>, keys: string[]) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

type Notice = { kind: 'ok' | 'error'; text: string } | null;

const getTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`config__toggle ${on ? 'config__toggle--on' : ''}`} aria-hidden="true">
      <span className="config__toggle-thumb" />
    </span>
  );
}

function Setting({ title, sub, onClick, right, danger, role, checked }: {
  title: string; sub: ReactNode; onClick?: () => void; right?: ReactNode; danger?: boolean; role?: 'switch'; checked?: boolean;
}) {
  const body = (
    <>
      <span className="config__setting-info">
        <span className={`config__setting-title ${danger ? 'config__setting-title--danger' : ''}`}>{title}</span>
        <span className="config__setting-sub">{sub}</span>
      </span>
      {right}
    </>
  );
  return onClick ? (
    <button type="button" className="config__setting config__setting--clickable" onClick={onClick} role={role} aria-checked={role ? checked : undefined}>
      {body}
    </button>
  ) : (
    <div className="config__setting">{body}</div>
  );
}

function Modal({ title, icon, onClose, children, footer, large }: {
  title: string; icon: ReactNode; onClose: () => void; children: ReactNode; footer: ReactNode; large?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-container ${large ? 'modal-container--lg' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">{icon}<h2 className="modal-title">{title}</h2></div>
            <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{footer}</div>
        </div>
      </div>
    </ModalPortal>
  );
}

export function Configuracoes() {
  const [settings, setSettings] = useState({
    notificacoesPedidos: true,
    notificacoesClientes: true,
    empresaNome: '',
    empresaCNPJ: '',
    empresaEmail: '',
    empresaTelefone: '',
    empresaEndereco: '',
    empresaLogoUri: '',
  });
  const [dark, setDark] = useState(getTheme() === 'dark');
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ clientes: 0, produtos: 0, industrias: 0, pedidos: 0 });
  const [modal, setModal] = useState<'company' | 'export' | 'stats' | null>(null);
  const [temp, setTemp] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '', logo: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.configuracoes.getAll()
      .then((config) => setSettings((prev) => ({
        ...prev,
        notificacoesPedidos: config.notificacoesPedidos !== 'false',
        notificacoesClientes: config.notificacoesClientes !== 'false',
        empresaNome: config.empresaNome || '',
        empresaCNPJ: config.empresaCNPJ || '',
        empresaEmail: config.empresaEmail || '',
        empresaTelefone: config.empresaTelefone || '',
        empresaEndereco: config.empresaEndereco || '',
        empresaLogoUri: config.empresaLogoUri || '',
      })))
      .catch(() => setNotice({ kind: 'error', text: 'Nao foi possivel carregar as configuracoes.' }));
  }, []);

  async function openStats() {
    setBusy(true);
    try {
      const [c, p, i, ped] = await Promise.all([api.clientes.getAll(), api.produtos.getAll(), api.industrias.getAll(), api.pedidos.getAll()]);
      setStats({ clientes: c.length, produtos: p.length, industrias: i.length, pedidos: ped.length });
      setModal('stats');
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Erro ao carregar estatisticas' });
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(key: 'notificacoesPedidos' | 'notificacoesClientes') {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    try {
      await api.configuracoes.set(key, String(newValue));
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      setNotice({ kind: 'error', text: 'Erro ao salvar configuracao' });
    }
  }

  // O tema vive no layout (localStorage 'theme' + data-theme); aqui só aplicamos e avisamos.
  function toggleTheme() {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* storage indisponivel */ }
    window.dispatchEvent(new CustomEvent('saleshub:theme', { detail: next }));
    setDark(next === 'dark');
  }

  function openCompanyModal() {
    setTemp({
      nome: settings.empresaNome, cnpj: settings.empresaCNPJ, email: settings.empresaEmail,
      telefone: settings.empresaTelefone, endereco: settings.empresaEndereco, logo: settings.empresaLogoUri,
    });
    setModal('company');
  }

  async function handleLogo(file?: File) {
    if (!file) return;
    try {
      setTemp((p) => ({ ...p, logo: '' }));
      const logo = await resizeImage(file, 300, 'image/png');
      setTemp((p) => ({ ...p, logo }));
    } catch {
      setNotice({ kind: 'error', text: 'Nao foi possivel ler a imagem do logo.' });
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function saveCompanyData() {
    setBusy(true);
    try {
      await Promise.all([
        api.configuracoes.set('empresaNome', temp.nome.trim()),
        api.configuracoes.set('empresaCNPJ', temp.cnpj),
        api.configuracoes.set('empresaEmail', temp.email.trim()),
        api.configuracoes.set('empresaTelefone', temp.telefone),
        api.configuracoes.set('empresaEndereco', temp.endereco.trim()),
        api.configuracoes.set('empresaLogoUri', temp.logo),
      ]);
      setSettings((prev) => ({
        ...prev,
        empresaNome: temp.nome.trim(), empresaCNPJ: temp.cnpj, empresaEmail: temp.email.trim(),
        empresaTelefone: temp.telefone, empresaEndereco: temp.endereco.trim(), empresaLogoUri: temp.logo,
      }));
      setModal(null);
      setNotice({ kind: 'ok', text: 'Dados da empresa salvos.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Erro ao salvar dados da empresa' });
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    setBusy(true);
    try {
      const [clientes, produtos, industrias, pedidos, configuracoes] = await Promise.all([
        api.clientes.getAll(), api.produtos.getAll(), api.industrias.getAll(), api.pedidos.getAll(), api.configuracoes.getAll(),
      ]);
      const backup = { clientes, produtos, industrias, pedidos, configuracoes, data: new Date().toISOString() };
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `saleshub-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setModal(null);
      setNotice({ kind: 'ok', text: 'Backup exportado.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Erro ao exportar dados' });
    } finally {
      setBusy(false);
    }
  }

  // Cada registro é importado isoladamente: um CNPJ duplicado não derruba o restante do backup.
  async function handleImport(file?: File) {
    if (importRef.current) importRef.current.value = '';
    if (!file) return;
    setBusy(true);
    setNotice(null);
    let ok = 0;
    let failed = 0;
    const run = async (fn: () => Promise<unknown>) => { try { await fn(); ok++; } catch { failed++; } };
    const parseJson = (v: unknown) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return undefined; } };

    try {
      const data = JSON.parse(await file.text());
      const tables = data.tables || data;

      for (const cfg of tables.configuracoes ?? []) {
        if (cfg?.chave) await run(() => api.configuracoes.set(cfg.chave, cfg.valor));
      }

      for (const c of tables.clientes ?? []) {
        const rest = omit(c, ["id", "dataCadastro", "dataAtualizacao", "celular", "endereco"]);
        const mapped: Record<string, unknown> = { ...rest };
        for (const [from, to] of Object.entries({
          endereco_cep: 'enderecoCep', endereco_logradouro: 'enderecoLogradouro', endereco_numero: 'enderecoNumero',
          endereco_complemento: 'enderecoComplemento', endereco_bairro: 'enderecoBairro', endereco_cidade: 'enderecoCidade', endereco_estado: 'enderecoEstado',
        })) if (c[from]) mapped[to] = c[from];
        await run(() => api.clientes.create(mapped as never));
      }

      for (const i of tables.industrias ?? []) {
        const rest = omit(i, ["id", "dataCadastro", "dataEdicao"]);
        await run(() => api.industrias.create(rest as never));
      }

      for (const p of tables.produtos ?? []) {
        const { imagens, variacoes: rawVar } = p;
        const rest = omit(p, ["id", "dataCadastro", "dataAtualizacao", "imagens", "variacoes"]);
        const parsedVar = parseJson(rawVar);
        const variacoes = Array.isArray(parsedVar) ? parsedVar.map((v: { tipo: string; valor: string }) => ({ tipo: v.tipo, valor: v.valor })) : undefined;
        const imgs = Array.isArray(imagens) ? imagens.map((im: string | { imagem: string }) => (typeof im === 'string' ? im : im.imagem)) : undefined;
        await run(() => api.produtos.create({ ...rest, variacoes, imagens: imgs } as never));
      }

      for (const ped of tables.pedidos ?? []) {
        const parsedProd = parseJson(ped.produtos);
        const produtos = Array.isArray(parsedProd)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? parsedProd.map((p: Record<string, any>) => ({
              nome: p.nome,
              preco: p.precoUnitario || p.preco,
              quantidade: p.quantidade || 1,
              descontoTipo: p.desconto?.tipo || p.descontoTipo || undefined,
              descontoValor: p.desconto?.valor || p.descontoValor || undefined,
              variacaoTipo: p.variacaoTipo || undefined,
              variacaoValor: p.variacaoValor || undefined,
            }))
          : undefined;
        const prazos = parseJson(ped.prazos);
        let descontoGeral = {};
        const d = parseJson(ped.desconto) as { tipo?: string; valor?: string } | undefined;
        if (ped.desconto_tipo || ped.descontoTipo) descontoGeral = { descontoTipo: ped.desconto_tipo || ped.descontoTipo, descontoValor: ped.desconto_valor || ped.descontoValor };
        else if (d?.valor) descontoGeral = { descontoTipo: d.tipo, descontoValor: d.valor };
        await run(() => api.pedidos.create({
          cliente: ped.cliente, total: ped.total, metodoPagamento: ped.metodoPagamento,
          observacoes: ped.observacoes || undefined, status: ped.status || 'pendente',
          ...descontoGeral, produtos, prazos,
        } as never));
      }

      setNotice(failed
        ? { kind: 'error', text: `Importacao concluida: ${ok} registro(s) importado(s), ${failed} ignorado(s) (duplicados ou invalidos).` }
        : { kind: 'ok', text: `Backup importado com sucesso (${ok} registro(s)).` });
    } catch {
      setNotice({ kind: 'error', text: 'Erro ao importar backup. Verifique o arquivo.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="config page-enter">
      <div className="config__header">
        <h1 className="config__title">Configuracoes</h1>
      </div>

      {notice && (
        <div className={`config__notice config__notice--${notice.kind}`} role="status">
          {notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} aria-label="Fechar aviso"><X size={14} /></button>
        </div>
      )}

      <section className="config__section">
        <h2 className="config__section-title"><Bell size={18} /> Notificacoes</h2>
        <div className="config__section-body">
          <Setting title="Notificacoes de Pedidos" sub="Receber notificacoes sobre novos pedidos" role="switch" checked={settings.notificacoesPedidos}
            onClick={() => handleToggle('notificacoesPedidos')} right={<Toggle on={settings.notificacoesPedidos} />} />
          <Setting title="Notificacoes de Clientes" sub="Receber notificacoes sobre novos clientes" role="switch" checked={settings.notificacoesClientes}
            onClick={() => handleToggle('notificacoesClientes')} right={<Toggle on={settings.notificacoesClientes} />} />
        </div>
      </section>

      <section className="config__section">
        <h2 className="config__section-title"><Palette size={18} /> Aparencia</h2>
        <div className="config__section-body">
          <Setting title="Tema Escuro" sub="Ativar modo escuro do aplicativo" role="switch" checked={dark}
            onClick={toggleTheme} right={<Toggle on={dark} />} />
        </div>
      </section>

      <section className="config__section">
        <h2 className="config__section-title"><Building2 size={18} /> Dados da Empresa</h2>
        <div className="config__section-body">
          <Setting title="Informacoes da Empresa" sub={settings.empresaNome || 'Configure os dados da sua empresa (aparecem no PDF do pedido)'}
            onClick={openCompanyModal} right={
              settings.empresaLogoUri
                ? <img className="config__logo-thumb" src={settings.empresaLogoUri} alt="Logo" />
                : <ChevronRight size={20} className="config__arrow" />
            } />
        </div>
      </section>

      <section className="config__section">
        <h2 className="config__section-title"><Database size={18} /> Gerenciamento de Dados</h2>
        <div className="config__section-body">
          <Setting title="Estatisticas do Banco" sub="Ver quantidade de dados armazenados" onClick={openStats} right={<BarChart3 size={20} className="config__arrow" />} />
          <Setting title="Exportar Banco de Dados" sub="Criar backup completo do banco de dados" onClick={() => setModal('export')} right={<Download size={20} className="config__arrow" />} />
          <Setting title={busy ? 'Importando...' : 'Importar Banco de Dados'} sub="Restaurar backup do banco de dados" onClick={() => !busy && importRef.current?.click()} right={<Upload size={20} className="config__arrow" />} />
          <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={(e) => handleImport(e.target.files?.[0])} />
        </div>
      </section>

      <section className="config__section">
        <h2 className="config__section-title"><Info size={18} /> Sobre</h2>
        <div className="config__section-body">
          <Setting title="Versao do Aplicativo" sub="1.0.0 (Web)" />
          <Setting title="Banco de Dados" sub="PostgreSQL" />
          <Setting title="Desenvolvido por" sub="SalesHub Team" />
        </div>
      </section>

      {modal === 'company' && (
        <Modal title="Dados da Empresa" icon={<Building2 size={20} />} large onClose={() => setModal(null)}
          footer={<>
            <span />
            <div className="modal-footer__actions">
              <CustomButton variant="ghost" onClick={() => setModal(null)} disabled={busy}>Cancelar</CustomButton>
              <CustomButton variant="primary" onClick={saveCompanyData} disabled={busy}>{busy ? 'Salvando...' : 'Salvar'}</CustomButton>
            </div>
          </>}>
          <div className="config__logo">
            <div className="config__logo-preview">
              {temp.logo ? <img src={temp.logo} alt="Logo da empresa" /> : <ImagePlus size={24} />}
            </div>
            <div className="config__logo-actions">
              <span className="form-label">Logo (aparece no PDF)</span>
              <div className="config__logo-buttons">
                <CustomButton type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>{temp.logo ? 'Trocar' : 'Enviar logo'}</CustomButton>
                {temp.logo && <CustomButton type="button" variant="ghost" size="sm" onClick={() => setTemp((p) => ({ ...p, logo: '' }))}>Remover</CustomButton>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleLogo(e.target.files?.[0])} />
            </div>
          </div>
          <CustomInput label="Nome da Empresa" placeholder="Nome da sua empresa" value={temp.nome} onChange={(e) => setTemp((p) => ({ ...p, nome: e.target.value }))} />
          <CustomInput label="CNPJ (Opcional)" placeholder="00.000.000/0000-00" value={temp.cnpj} inputMode="numeric" onChange={(e) => setTemp((p) => ({ ...p, cnpj: maskCnpj(e.target.value) }))} />
          <div className="form-grid form-grid--2">
            <CustomInput label="Email" type="email" placeholder="email@empresa.com" value={temp.email} onChange={(e) => setTemp((p) => ({ ...p, email: e.target.value }))} />
            <CustomInput label="Telefone/Whatsapp" placeholder="(11) 99999-9999" value={temp.telefone} inputMode="tel" onChange={(e) => setTemp((p) => ({ ...p, telefone: maskPhone(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Endereco</label>
            <textarea className="form-textarea" placeholder="Endereco completo da empresa" value={temp.endereco} onChange={(e) => setTemp((p) => ({ ...p, endereco: e.target.value }))} rows={3} />
          </div>
        </Modal>
      )}

      {modal === 'stats' && (
        <Modal title="Estatisticas do Banco" icon={<BarChart3 size={20} />} onClose={() => setModal(null)}
          footer={<><span /><CustomButton variant="ghost" onClick={() => setModal(null)}>Fechar</CustomButton></>}>
          <div className="config__stats-grid">
            {([['clientes', 'Clientes'], ['produtos', 'Produtos'], ['industrias', 'Industrias'], ['pedidos', 'Pedidos']] as const).map(([k, label], i) => (
              <div key={k} className="config__stat-item item-enter" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="config__stat-value">{stats[k]}</span>
                <span className="config__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === 'export' && (
        <Modal title="Exportar Banco de Dados" icon={<FileJson size={20} />} onClose={() => setModal(null)}
          footer={<>
            <span />
            <div className="modal-footer__actions">
              <CustomButton variant="ghost" onClick={() => setModal(null)} disabled={busy}>Cancelar</CustomButton>
              <CustomButton variant="primary" icon={<Download size={14} />} onClick={handleExport} disabled={busy}>{busy ? 'Exportando...' : 'Exportar'}</CustomButton>
            </div>
          </>}>
          <p className="config__export-desc">
            Esta funcao ira criar um backup completo do banco de dados em formato JSON.
            O arquivo gerado contera todos os seus dados (clientes, produtos, pedidos, industrias e configuracoes)
            e podera ser usado para restaurar o banco posteriormente.
          </p>
        </Modal>
      )}
    </div>
  );
}
