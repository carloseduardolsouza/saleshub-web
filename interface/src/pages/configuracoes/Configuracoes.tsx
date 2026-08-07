import { useState } from 'react';
import { Bell, Palette, Building2, Database, Info, ChevronRight, Download, Upload, Trash2, BarChart3, FileJson } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
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

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [tempCompanyData, setTempCompanyData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  function handleToggle(key: keyof typeof settings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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

  function saveCompanyData() {
    setSettings((prev) => ({
      ...prev,
      empresaNome: tempCompanyData.nome,
      empresaCNPJ: tempCompanyData.cnpj,
      empresaEmail: tempCompanyData.email,
      empresaTelefone: tempCompanyData.telefone,
      empresaEndereco: tempCompanyData.endereco,
    }));
    setShowCompanyModal(false);
    alert('Dados da empresa salvos com sucesso!');
  }

  function handleExport() {
    alert('Backup gerado com sucesso!');
    setShowExportModal(false);
  }

  function handleImport() {
    alert('Selecione um arquivo de backup para importar.');
  }

  function handleClearData() {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta acao nao pode ser desfeita.')) {
      alert('Todos os dados foram limpos.');
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
          <div className="config__setting config__setting--clickable" onClick={() => alert('Clientes: 6\nProdutos: 4\nIndustrias: 6\nPedidos: 6')}>
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
              <span className="config__setting-sub">Mock (Dados Locais)</span>
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
