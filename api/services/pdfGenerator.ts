import pdf from 'html-pdf-node';
import prisma from '../prisma.js';

const METODO_PAGAMENTO: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartao',
  pix: 'Pix',
  boleto: 'Boleto',
};

function formatarEndereco(c: any): string {
  const partes: string[] = [];
  if (c.enderecoLogradouro) {
    let linha = c.enderecoLogradouro;
    if (c.enderecoNumero) linha += `, ${c.enderecoNumero}`;
    if (c.enderecoComplemento) linha += ` - ${c.enderecoComplemento}`;
    partes.push(linha);
  }
  if (c.enderecoBairro) partes.push(c.enderecoBairro);
  if (c.enderecoCidade || c.enderecoEstado) {
    partes.push([c.enderecoCidade, c.enderecoEstado].filter(Boolean).join(' - '));
  }
  if (c.enderecoCep) partes.push(`CEP: ${c.enderecoCep}`);
  return partes.length > 0 ? partes.join(', ') : 'N/A';
}

function calcular(preco: number, qtd: number, descontoTipo?: string | null, descontoValor?: string | null, mostrar = true): number {
  const total = preco * qtd;
  if (!mostrar || !descontoValor) return total;
  const val = parseFloat(descontoValor.replace(',', '.')) || 0;
  const desc = descontoTipo === 'percentual' ? (total * val) / 100 : val;
  return Math.max(0, total - desc);
}

function formatBRL(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

export async function generatePedidoPDF(pedidoId: number, mostrarDescontos: boolean): Promise<Buffer> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { produtos: true, prazos: true },
  });
  if (!pedido) throw new Error('Pedido nao encontrado');

  const clientes = await prisma.cliente.findMany();
  const configRows = await prisma.configuracao.findMany();
  const config: Record<string, string> = {};
  configRows.forEach((c) => { config[c.chave] = c.valor; });

  const normalizar = (nome: string) => (nome || '').trim().toLowerCase();
  const cliente = clientes.find((c: any) => normalizar(c.nomeFantasia) === normalizar(pedido.cliente)) || {
    nomeFantasia: pedido.cliente, razaoSocial: '', cnpj: '', telefone: '',
    inscricaoEstadual: '', email: '', telefoneEmpresa: '', emailEmpresa: '',
    enderecoLogradouro: '', enderecoNumero: '',
    enderecoComplemento: '', enderecoBairro: '', enderecoCidade: '', enderecoEstado: '', enderecoCep: '',
  } as any;

  const enderecoFormatado = formatarEndereco(cliente);

  const subtotalSemDescontos = pedido.produtos.reduce((s, p) => s + (p.preco * p.quantidade), 0);

  let descontosIndividuais = 0;
  if (mostrarDescontos) {
    pedido.produtos.forEach((p) => {
      const t = p.preco * p.quantidade;
      if (p.descontoValor) {
        const v = parseFloat(p.descontoValor.replace(',', '.')) || 0;
        descontosIndividuais += p.descontoTipo === 'percentual' ? (t * v) / 100 : v;
      }
    });
  }
  const subtotalComDescontos = subtotalSemDescontos - descontosIndividuais;

  let descontoGeral = 0;
  if (mostrarDescontos && pedido.descontoValor) {
    const v = parseFloat(pedido.descontoValor.replace(',', '.')) || 0;
    descontoGeral = pedido.descontoTipo === 'percentual' ? (subtotalComDescontos * v) / 100 : v;
  }

  const totalFinal = mostrarDescontos ? pedido.total : subtotalSemDescontos;
  const metodoLabel = METODO_PAGAMENTO[pedido.metodoPagamento] || pedido.metodoPagamento;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #333; padding: 10px 15px; font-size: 11px; }
  .header { display: flex; align-items: center; border-bottom: 2px solid #1565C0; padding-bottom: 8px; margin-bottom: 10px; }
  .logo { width: 50px; height: 50px; object-fit: contain; margin-right: 12px; border-radius: 4px; }
  .company-name { font-size: 16px; font-weight: bold; color: #1565C0; margin-bottom: 2px; }
  .company-info { font-size: 9px; line-height: 1.4; color: #666; }
  .doc-title { text-align: center; font-size: 14px; font-weight: bold; color: #1565C0; margin: 8px 0; padding: 5px; background: #E3F2FD; border-radius: 4px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .info-col { width: 48%; }
  .info-col-title { font-size: 10px; font-weight: bold; color: #1565C0; margin-bottom: 4px; border-bottom: 1px solid #E3F2FD; padding-bottom: 2px; text-transform: uppercase; }
  .info-line { font-size: 10px; margin-bottom: 1px; line-height: 1.3; }
  .info-line strong { color: #444; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; }
  th { background: #1565C0; color: #fff; padding: 4px 6px; font-size: 10px; text-align: left; }
  td { padding: 3px 6px; font-size: 10px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #f5f5f5; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .variation { color: #E65100; font-style: italic; font-size: 9px; margin-top: 1px; }
  .discount { color: #2E7D32; font-size: 9px; font-style: italic; margin-top: 1px; }
  .totals { margin-top: 6px; border-top: 1px solid #e0e0e0; padding-top: 5px; }
  .total-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }
  .total-final { font-size: 13px; font-weight: bold; color: #1565C0; border-top: 2px solid #1565C0; padding-top: 4px; margin-top: 4px; }
  .discount-text { color: #c62828; }
  .payment { margin-top: 8px; background: #f5f5f5; padding: 6px 8px; border-radius: 4px; border-left: 3px solid #1565C0; }
  .payment-title { font-size: 10px; font-weight: bold; color: #1565C0; margin-bottom: 4px; text-transform: uppercase; }
  .installment { background: #fff; padding: 3px 6px; margin-top: 3px; border-left: 2px solid #1565C0; border-radius: 3px; font-size: 10px; }
  .obs { margin-top: 8px; background: #FFF8E1; padding: 6px 8px; border-radius: 4px; border-left: 3px solid #FFA000; }
  .obs-title { font-size: 10px; font-weight: bold; color: #E65100; margin-bottom: 3px; text-transform: uppercase; }
  .obs-text { font-size: 10px; line-height: 1.3; }
  .footer { margin-top: 10px; text-align: center; font-size: 8px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 5px; }
</style>
</head>
<body>

<div class="header">
  ${config.empresaLogoUri ? `<img src="${config.empresaLogoUri}" class="logo" />` : ''}
  <div>
    <div class="company-name">${config.empresaNome || 'SUA EMPRESA'}</div>
    <div class="company-info">
      ${config.empresaCNPJ ? `<div>CNPJ: ${config.empresaCNPJ}</div>` : ''}
      ${config.empresaTelefone ? `<div>Telefone: ${config.empresaTelefone}</div>` : ''}
      ${config.empresaEmail ? `<div>Email: ${config.empresaEmail}</div>` : ''}
      ${config.empresaEndereco ? `<div>Endereco: ${config.empresaEndereco}</div>` : ''}
    </div>
  </div>
</div>

<div class="doc-title">NOTA DE PEDIDO N ${pedido.id}</div>

<div class="info-row">
  <div class="info-col">
    <div class="info-col-title">Dados do Cliente</div>
    <div class="info-line"><strong>Nome:</strong> ${cliente.nomeFantasia || 'N/A'}</div>
    <div class="info-line"><strong>Razao Social:</strong> ${cliente.razaoSocial || 'N/A'}</div>
    <div class="info-line"><strong>CNPJ:</strong> ${cliente.cnpj || 'N/A'}</div>
    <div class="info-line"><strong>Inscricao Estadual:</strong> ${cliente.inscricaoEstadual || 'N/A'}</div>
    <div class="info-line"><strong>Endereco:</strong> ${enderecoFormatado}</div>
    <div class="info-line"><strong>Telefone:</strong> ${cliente.telefoneEmpresa || 'N/A'}</div>
    <div class="info-line"><strong>Email:</strong> ${cliente.emailEmpresa || 'N/A'}</div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Dados do Pedido</div>
    <div class="info-line"><strong>Data:</strong> ${pedido.data.toLocaleDateString('pt-BR')}</div>
    <div class="info-line"><strong>Hora:</strong> ${pedido.data.toLocaleTimeString('pt-BR')}</div>
    <div class="info-line"><strong>Metodo de Pagamento:</strong> ${metodoLabel}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:45%">Produto</th>
      <th style="width:15%" class="text-center">Qtd</th>
      <th style="width:20%" class="text-right">Unitario</th>
      <th style="width:20%" class="text-right">Total</th>
    </tr>
  </thead>
  <tbody>
    ${pedido.produtos.map((p) => {
      const precoFinal = calcular(p.preco, p.quantidade, p.descontoTipo, p.descontoValor, mostrarDescontos);
      return `<tr>
        <td>
          ${p.nome}
          ${p.variacaoValor ? `<div class="variation">${p.variacaoTipo === 'cor' ? 'Cor' : 'Tam'}: ${p.variacaoValor}</div>` : ''}
          ${mostrarDescontos && p.descontoValor ? `<div class="discount">Desc: ${p.descontoTipo === 'percentual' ? p.descontoValor + '%' : formatBRL(parseFloat(p.descontoValor))}</div>` : ''}
        </td>
        <td class="text-center">${p.quantidade}</td>
        <td class="text-right">${formatBRL(p.preco)}</td>
        <td class="text-right">${formatBRL(precoFinal)}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>

<div class="totals">
  <div class="total-row"><span>Subtotal:</span><span>${formatBRL(subtotalSemDescontos)}</span></div>
  ${mostrarDescontos && descontosIndividuais > 0 ? `
    <div class="total-row discount-text"><span>Descontos nos produtos:</span><span>- ${formatBRL(descontosIndividuais)}</span></div>
    <div class="total-row"><span>Subtotal com descontos:</span><span>${formatBRL(subtotalComDescontos)}</span></div>
  ` : ''}
  ${mostrarDescontos && descontoGeral > 0 ? `
    <div class="total-row discount-text"><span>Desconto geral:</span><span>- ${formatBRL(descontoGeral)}</span></div>
  ` : ''}
  <div class="total-row total-final"><span>TOTAL GERAL:</span><span>${formatBRL(totalFinal)}</span></div>
</div>

<div class="payment">
  <div class="payment-title">Condicoes de Pagamento</div>
  <div class="info-line"><strong>Metodo:</strong> ${metodoLabel}</div>
  ${pedido.metodoPagamento === 'boleto' && pedido.prazos.length > 0 ? `
    <div style="margin-top:10px">
      <strong>Parcelas:</strong>
      ${pedido.prazos.map((pr, i) => `<div class="installment"><strong>${i + 1} Parcela:</strong> ${pr.dias} dias</div>`).join('')}
    </div>
  ` : ''}
</div>

${pedido.observacoes ? `
<div class="obs">
  <div class="obs-title">Observacoes</div>
  <div class="obs-text">${pedido.observacoes}</div>
</div>
` : ''}

<div class="footer">Documento gerado por SalesHub em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}</div>

</body>
</html>`;

  const file = { content: html };
  const options = {
    format: 'A4' as const,
    margin: { top: '8mm', right: '6mm', bottom: '8mm', left: '6mm' },
    printBackground: true,
  };

  const pdfBuffer = await pdf.generatePdf(file, options);
  return pdfBuffer;
}
