import { useState, useEffect } from 'react';
import { Bell, Palette, Building2, Database, Info, ChevronRight, Download, Upload, Trash2, BarChart3, FileJson } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api } from '../../api/client';
import './Configuracoes.css';

export function Configuracoes() {
  const [settings, setSettings] = useState({
    notificacoesPedidos: true,
    notificacoesClientes: true,
    temaEscuro: false,
    empresaNome: '',
    empresaCNPJ: '',
    empresaEmail: '',
    empresaTelefone: '',
    empresaEndereco: '',
  });

  const [stats, setStats] = useState({ clientes: 0, produtos: 0, industrias: 0, pedidos: 0 });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [tempCompanyData, setTempCompanyData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const config = await api.configuracoes.getAll();
        setSettings((prev) => ({
          ...prev,
          notificacoesPedidos: config.notificacoesPedidos !== 'false',
          notificacoesClientes: config.notificacoesClientes !== 'false',
          temaEscuro: config.temaEscuro === 'true',
          empresaNome: config.empresaNome || '',
          empresaCNPJ: config.empresaCNPJ || '',
          empresaEmail: config.empresaEmail || '',
          empresaTelefone: config.empresaTelefone || '',
          empresaEndereco: config.empresaEndereco || '',
        }));
      } catch {
        console.error('Erro ao carregar configuracoes');
      }
    }
    load();
  }, []);

  async function loadStats() {
    try {
      const [clientes, produtos, industrias, pedidos] = await Promise.all([
        api.clientes.getAll(),
        api.produtos.getAll(),
        api.industrias.getAll(),
        api.pedidos.getAll(),
      ]);
      setStats({ clientes: clientes.length, produtos: produtos.length, industrias: industrias.length, pedidos: pedidos.length });
    } catch {
      console.error('Erro ao carregar estatisticas');
    }
  }

  async function handleToggle(key: keyof typeof settings) {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    try {
      await api.configuracoes.set(key, String(newValue));
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      alert('Erro ao salvar configuracao');
    }
  }

  function openCompanyModal() {
    setTempCompanyData({
      nome: settings.empresaNome,
      cnpj: settings.empresaCNPJ,
      email: settings.empresaEmail,
      telefone: settings.empresaTelefone,
      endereco: settings.empresaEndereco,
    });
    setShowCompanyModal(true);
  }

  async function saveCompanyData() {
    try {
      await Promise.all([
        api.configuracoes.set('empresaNome', tempCompanyData.nome),
        api.configuracoes.set('empresaCNPJ', tempCompanyData.cnpj),
        api.configuracoes.set('empresaEmail', tempCompanyData.email),
        api.configuracoes.set('empresaTelefone', tempCompanyData.telefone),
        api.configuracoes.set('empresaEndereco', tempCompanyData.endereco),
      ]);
      setSettings((prev) => ({
        ...prev,
        empresaNome: tempCompanyData.nome,
        empresaCNPJ: tempCompanyData.cnpj,
        empresaEmail: tempCompanyData.email,
        empresaTelefone: tempCompanyData.telefone,
        empresaEndereco: tempCompanyData.endereco,
      }));
      setShowCompanyModal(false);
    } catch {
      alert('Erro ao salvar dados da empresa');
    }
  }

  async function handleExport() {
    try {
      const [clientes, produtos, industrias, pedidos, configuracoes] = await Promise.all([
        api.clientes.getAll(),
        api.produtos.getAll(),
        api.industrias.getAll(),
        api.pedidos.getAll(),
        api.configuracoes.getAll(),
      ]);
      const backup = { clientes, produtos, industrias, pedidos, configuracoes, data: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saleshub-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch {
      alert('Erro ao exportar dados');
    }
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const tables = data.tables || data;

        if (tables.configuracoes) {
          for (const cfg of tables.configuracoes) {
            await api.configuracoes.set(cfg.chave, cfg.valor);
          }
        }

        if (tables.clientes) {
          for (const c of tables.clientes) {
            const { id, dataCadastro, dataAtualizacao, celular, endereco, ...rest } = c;
            const mapped: Record<string, unknown> = { ...rest };
            if (c.endereco_cep) mapped.enderecoCep = c.endereco_cep;
            if (c.endereco_logradouro) mapped.enderecoLogradouro = c.endereco_logradouro;
            if (c.endereco_numero) mapped.enderecoNumero = c.endereco_numero;
            if (c.endereco_complemento) mapped.enderecoComplemento = c.endereco_complemento;
            if (c.endereco_bairro) mapped.enderecoBairro = c.endereco_bairro;
            if (c.endereco_cidade) mapped.enderecoCidade = c.endereco_cidade;
            if (c.endereco_estado) mapped.enderecoEstado = c.endereco_estado;
            await api.clientes.create(mapped as any);
          }
        }

        if (tables.industrias) {
          for (const i of tables.industrias) {
            const { id, dataCadastro, dataEdicao, ...rest } = i;
            await api.industrias.create(rest);
          }
        }

        if (tables.produtos) {
          for (const p of tables.produtos) {
            const { id, dataCadastro, dataAtualizacao, imagens, ...rest } = p;
            let variacoes = undefined;
            if (p.variacoes) {
              try {
                const parsed = typeof p.variacoes === 'string' ? JSON.parse(p.variacoes) : p.variacoes;
                variacoes = parsed.map((v: any) => ({ tipo: v.tipo, valor: v.valor }));
              } catch { /* skip */ }
            }
            await api.produtos.create({ ...rest, variacoes } as any);
          }
        }

        if (tables.pedidos) {
          for (const ped of tables.pedidos) {
            const { desconto } = ped;
            let produtos = undefined;
            if (ped.produtos) {
              try {
                const parsed = typeof ped.produtos === 'string' ? JSON.parse(ped.produtos) : ped.produtos;
                produtos = parsed.map((p: any) => ({
                  nome: p.nome,
                  preco: p.precoUnitario || p.preco,
                  quantidade: p.quantidade || 1,
                  descontoTipo: p.desconto?.tipo || undefined,
                  descontoValor: p.desconto?.valor || undefined,
                }));
              } catch { /* skip */ }
            }
            let prazos = undefined;
            if (ped.prazos) {
              try {
                prazos = typeof ped.prazos === 'string' ? JSON.parse(ped.prazos) : ped.prazos;
              } catch { /* skip */ }
            }
            let descontoGeral = {};
            if (ped.desconto_tipo) descontoGeral = { descontoTipo: ped.desconto_tipo, descontoValor: ped.desconto_valor };
            else if (desconto) {
              try {
                const d = typeof desconto === 'string' ? JSON.parse(desconto) : desconto;
                if (d.valor) descontoGeral = { descontoTipo: d.tipo, descontoValor: d.valor };
              } catch { /* skip */ }
            }
            await api.pedidos.create({
              cliente: ped.cliente,
              total: ped.total,
              metodoPagamento: ped.metodoPagamento,
              observacoes: ped.observacoes || undefined,
              status: ped.status || 'pendente',
              ...descontoGeral,
              produtos,
              prazos,
            } as any);
          }
        }

        alert('Backup importado com sucesso!');
      } catch {
        alert('Erro ao importar backup. Verifique o arquivo.');
      }
    };
    input.click();
  }

  function handleClearData() {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta acao nao pode ser desfeita.')) {
      alert('Funcionalidade em desenvolvimento.');
    }
  }

  return (
    <div className="config">
      <div className="config__header">
        <h1 className="config__title">Configuracoes</h1>
      </div>

      {/* Notificacoes */}
      <section className="config__section">
        <h2 className="config__section-title">
          <Bell size={18} />
          Notificacoes
        </h2>
        <div className="config__section-body">
          <div className="config__setting" onClick={() => handleToggle('notificacoesPedidos')}>
            <div className="config__setting-info">
              <span className="config__setting-title">Notificacoes de Pedidos</span>
              <span className="config__setting-sub">Receber notificacoes sobre novos pedidos</span>
            </div>
            <div className={`config__toggle ${settings.notificacoesPedidos ? 'config__toggle--on' : ''}`}>
              <div className="config__toggle-thumb" />
            </div>
          </div>
          <div className="config__setting" onClick={() => handleToggle('notificacoesClientes')}>
            <div className="config__setting-info">
              <span className="config__setting-title">Notificacoes de Clientes</span>
              <span className="config__setting-sub">Receber notificacoes sobre novos clientes</span>
            </div>
            <div className={`config__toggle ${settings.notificacoesClientes ? 'config__toggle--on' : ''}`}>
              <div className="config__toggle-thumb" />
            </div>
          </div>
        </div>
      </section>

      {/* Aparencia */}
      <section className="config__section">
        <h2 className="config__section-title">
          <Palette size={18} />
          Aparencia
        </h2>
        <div className="config__section-body">
          <div className="config__setting" onClick={() => handleToggle('temaEscuro')}>
            <div className="config__setting-info">
              <span className="config__setting-title">Tema Escuro</span>
              <span className="config__setting-sub">Ativar modo escuro do aplicativo</span>
            </div>
            <div className={`config__toggle ${settings.temaEscuro ? 'config__toggle--on' : ''}`}>
              <div className="config__toggle-thumb" />
            </div>
          </div>
        </div>
      </section>

      {/* Dados da Empresa */}
      <section className="config__section">
        <h2 className="config__section-title">
          <Building2 size={18} />
          Dados da Empresa
        </h2>
        <div className="config__section-body">
          <div className="config__setting config__setting--clickable" onClick={openCompanyModal}>
            <div className="config__setting-info">
              <span className="config__setting-title">Informacoes da Empresa</span>
              <span className="config__setting-sub">{settings.empresaNome || 'Configure os dados da sua empresa'}</span>
            </div>
            <ChevronRight size={20} className="config__arrow" />
          </div>
        </div>
      </section>

      {/* Gerenciamento de Dados */}
      <section className="config__section">
        <h2 className="config__section-title">
          <Database size={18} />
          Gerenciamento de Dados
        </h2>
        <div className="config__section-body">
          <div className="config__setting config__setting--clickable" onClick={async () => { await loadStats(); setShowStatsModal(true); }}>
            <div className="config__setting-info">
              <span className="config__setting-title">Estatisticas do Banco</span>
              <span className="config__setting-sub">Ver quantidade de dados armazenados</span>
            </div>
            <BarChart3 size={20} className="config__arrow" />
          </div>
          <div className="config__setting config__setting--clickable" onClick={() => setShowExportModal(true)}>
            <div className="config__setting-info">
              <span className="config__setting-title">Exportar Banco de Dados</span>
              <span className="config__setting-sub">Criar backup completo do banco de dados</span>
            </div>
            <Download size={20} className="config__arrow" />
          </div>
          <div className="config__setting config__setting--clickable" onClick={handleImport}>
            <div className="config__setting-info">
              <span className="config__setting-title">Importar Banco de Dados</span>
              <span className="config__setting-sub">Restaurar backup do banco de dados</span>
            </div>
            <Upload size={20} className="config__arrow" />
          </div>
          <div className="config__setting config__setting--clickable" onClick={handleClearData}>
            <div className="config__setting-info">
              <span className="config__setting-title config__setting-title--danger">Limpar Todos os Dados</span>
              <span className="config__setting-sub">Apagar todos os dados do aplicativo</span>
            </div>
            <Trash2 size={20} className="config__arrow config__arrow--danger" />
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="config__section">
        <h2 className="config__section-title">
          <Info size={18} />
          Sobre
        </h2>
        <div className="config__section-body">
          <div className="config__setting">
            <div className="config__setting-info">
              <span className="config__setting-title">Versao do Aplicativo</span>
              <span className="config__setting-sub">1.0.0 (Web)</span>
            </div>
          </div>
          <div className="config__setting">
            <div className="config__setting-info">
              <span className="config__setting-title">Banco de Dados</span>
              <span className="config__setting-sub">PostgreSQL</span>
            </div>
          </div>
          <div className="config__setting">
            <div className="config__setting-info">
              <span className="config__setting-title">Desenvolvido por</span>
              <span className="config__setting-sub">SalesHub Team</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Dados da Empresa */}
      {showCompanyModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
            <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header__left">
                  <Building2 size={20} />
                  <h2 className="modal-title">Dados da Empresa</h2>
                </div>
                <button className="modal-close" onClick={() => setShowCompanyModal(false)}><span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>Fechar</span></button>
              </div>
              <div className="modal-body">
                <CustomInput
                  label="Nome da Empresa"
                  placeholder="Nome da sua empresa"
                  value={tempCompanyData.nome}
                  onChange={(e) => setTempCompanyData((p) => ({ ...p, nome: e.target.value }))}
                />
                <CustomInput
                  label="CNPJ (Opcional)"
                  placeholder="00.000.000/0000-00"
                  value={tempCompanyData.cnpj}
                  onChange={(e) => setTempCompanyData((p) => ({ ...p, cnpj: e.target.value }))}
                />
                <div className="form-grid form-grid--2">
                  <CustomInput
                    label="Email"
                    type="email"
                    placeholder="email@empresa.com"
                    value={tempCompanyData.email}
                    onChange={(e) => setTempCompanyData((p) => ({ ...p, email: e.target.value }))}
                  />
                  <CustomInput
                    label="Telefone/Whatsapp"
                    placeholder="(11) 99999-9999"
                    value={tempCompanyData.telefone}
                    onChange={(e) => setTempCompanyData((p) => ({ ...p, telefone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Endereco</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Endereco completo da empresa"
                    value={tempCompanyData.endereco}
                    onChange={(e) => setTempCompanyData((p) => ({ ...p, endereco: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <CustomButton variant="ghost" onClick={() => setShowCompanyModal(false)}>Cancelar</CustomButton>
                <CustomButton variant="primary" onClick={saveCompanyData}>Salvar</CustomButton>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Estatisticas */}
      {showStatsModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header__left">
                  <BarChart3 size={20} />
                  <h2 className="modal-title">Estatisticas do Banco</h2>
                </div>
                <button className="modal-close" onClick={() => setShowStatsModal(false)}><span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>Fechar</span></button>
              </div>
              <div className="modal-body">
                <div className="config__stats-grid">
                  <div className="config__stat-item">
                    <span className="config__stat-value">{stats.clientes}</span>
                    <span className="config__stat-label">Clientes</span>
                  </div>
                  <div className="config__stat-item">
                    <span className="config__stat-value">{stats.produtos}</span>
                    <span className="config__stat-label">Produtos</span>
                  </div>
                  <div className="config__stat-item">
                    <span className="config__stat-value">{stats.industrias}</span>
                    <span className="config__stat-label">Industrias</span>
                  </div>
                  <div className="config__stat-item">
                    <span className="config__stat-value">{stats.pedidos}</span>
                    <span className="config__stat-label">Pedidos</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <CustomButton variant="ghost" onClick={() => setShowStatsModal(false)}>Fechar</CustomButton>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Exportar */}
      {showExportModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header__left">
                  <FileJson size={20} />
                  <h2 className="modal-title">Exportar Banco de Dados</h2>
                </div>
                <button className="modal-close" onClick={() => setShowExportModal(false)}><span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>Fechar</span></button>
              </div>
              <div className="modal-body">
                <p className="config__export-desc">
                  Esta funcao ira criar um backup completo do banco de dados em formato JSON.
                  O arquivo gerado contera todos os seus dados (clientes, produtos, pedidos, industrias e configuracoes)
                  e podera ser usado para restaurar o banco posteriormente.
                </p>
              </div>
              <div className="modal-footer">
                <CustomButton variant="ghost" onClick={() => setShowExportModal(false)}>Cancelar</CustomButton>
                <CustomButton variant="primary" icon={<Download size={14} />} onClick={handleExport}>Exportar</CustomButton>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
