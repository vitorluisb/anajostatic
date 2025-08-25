/**
 * Script para executar testes de acessibilidade usando Pa11y
 * 
 * Pré-requisitos:
 * 1. Node.js instalado
 * 2. Instalar o Pa11y: npm install -g pa11y
 * 3. Ter um servidor local rodando o site (ex: http-server)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = 'http://localhost:8080'; // Ajuste para a URL do seu servidor local
const PAGES = [
  '',              // Home
  'sobre.html',
  'projetos.html',
  'transparencia.html',
  'voluntariado.html',
  'doar.html',
  'contato.html',
  'acessibilidade.html'
];

// Padrões de acessibilidade para testar
const STANDARDS = [
  'WCAG2A',   // WCAG 2.0 Level A
  'WCAG2AA',  // WCAG 2.0 Level AA
  'WCAG2AAA'  // WCAG 2.0 Level AAA
];

// Criar diretório para relatórios se não existir
const reportsDir = path.join(__dirname, 'accessibility-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Função para executar o Pa11y
async function runPa11y(page, standard) {
  const url = `${BASE_URL}/${page}`;
  const pageName = page || 'home';
  const dateStr = new Date().toISOString().split('T')[0];
  const outputPath = path.join(reportsDir, `${pageName}-${standard}-${dateStr}.json`);
  
  console.log(`Executando teste de acessibilidade ${standard} para ${url}...`);
  
  return new Promise((resolve, reject) => {
    exec(
      `pa11y --standard ${standard} --reporter json ${url}`,
      (error, stdout, stderr) => {
        if (stderr) {
          console.error(`Erro ao executar Pa11y para ${url}:`, stderr);
        }
        
        try {
          // Salvar resultado em arquivo JSON
          fs.writeFileSync(outputPath, stdout, 'utf8');
          
          // Analisar resultados
          const results = JSON.parse(stdout);
          const issueCount = results.issues.length;
          console.log(`Teste concluído para ${url} (${standard}): ${issueCount} problemas encontrados.`);
          
          resolve({
            url,
            standard,
            issues: results.issues,
            count: issueCount,
            reportPath: outputPath
          });
        } catch (parseError) {
          console.error(`Erro ao processar resultados para ${url}:`, parseError);
          reject(parseError);
        }
      }
    );
  });
}

// Função para gerar relatório HTML com todos os resultados
function generateHTMLReport(allResults) {
  const dateStr = new Date().toISOString().split('T')[0];
  const htmlPath = path.join(reportsDir, `accessibility-summary-${dateStr}.html`);
  
  // Agrupar resultados por página
  const resultsByPage = {};
  allResults.forEach(result => {
    const pageName = result.url.replace(BASE_URL + '/', '') || 'home';
    if (!resultsByPage[pageName]) {
      resultsByPage[pageName] = [];
    }
    resultsByPage[pageName].push(result);
  });
  
  // Gerar HTML
  let html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Acessibilidade - ONG Anajo</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1 { color: #2e86de; }
      h2 { color: #2e86de; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      h3 { margin-top: 20px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .issue { margin-bottom: 15px; padding: 10px; border-left: 4px solid #ddd; }
      .error { border-left-color: #e74c3c; }
      .warning { border-left-color: #f39c12; }
      .notice { border-left-color: #3498db; }
      .summary { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; }
      .summary-card { background: #f8f9fa; border-radius: 5px; padding: 15px; margin: 10px; flex: 1; min-width: 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .summary-card h3 { margin-top: 0; }
      .badge { display: inline-block; padding: 3px 7px; border-radius: 3px; font-size: 12px; font-weight: bold; }
      .badge-error { background: #ffebee; color: #c62828; }
      .badge-warning { background: #fff8e1; color: #ff8f00; }
      .badge-notice { background: #e3f2fd; color: #1565c0; }
      .code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>Relatório de Acessibilidade - ONG Anajo</h1>
    <p>Data do teste: ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total de Páginas</h3>
        <p>${Object.keys(resultsByPage).length}</p>
      </div>
      <div class="summary-card">
        <h3>Total de Problemas</h3>
        <p>${allResults.reduce((total, result) => total + result.count, 0)}</p>
      </div>
      <div class="summary-card">
        <h3>Padrões Testados</h3>
        <p>${STANDARDS.join(', ')}</p>
      </div>
    </div>
    
    <h2>Resumo por Página</h2>
    <table>
      <tr>
        <th>Página</th>
        <th>WCAG2A</th>
        <th>WCAG2AA</th>
        <th>WCAG2AAA</th>
        <th>Total</th>
      </tr>
  `;
  
  // Adicionar linhas da tabela para cada página
  Object.keys(resultsByPage).forEach(pageName => {
    const pageResults = resultsByPage[pageName];
    const counts = {};
    let total = 0;
    
    pageResults.forEach(result => {
      counts[result.standard] = result.count;
      total += result.count;
    });
    
    html += `
      <tr>
        <td>${pageName}</td>
        <td>${counts['WCAG2A'] || 0}</td>
        <td>${counts['WCAG2AA'] || 0}</td>
        <td>${counts['WCAG2AAA'] || 0}</td>
        <td><strong>${total}</strong></td>
      </tr>
    `;
  });
  
  html += `
    </table>
    
    <h2>Detalhes por Página</h2>
  `;
  
  // Adicionar detalhes para cada página
  Object.keys(resultsByPage).forEach(pageName => {
    const pageResults = resultsByPage[pageName];
    
    html += `
      <h3>${pageName}</h3>
    `;
    
    pageResults.forEach(result => {
      if (result.issues.length === 0) {
        html += `<p>Nenhum problema encontrado para o padrão ${result.standard}.</p>`;
        return;
      }
      
      html += `
        <h4>Padrão: ${result.standard} (${result.issues.length} problemas)</h4>
        <ul>
      `;
      
      result.issues.forEach(issue => {
        const typeClass = issue.type === 'error' ? 'error' : 
                         issue.type === 'warning' ? 'warning' : 'notice';
        
        html += `
          <li class="issue ${typeClass}">
            <p><strong>Tipo:</strong> <span class="badge badge-${typeClass}">${issue.type}</span></p>
            <p><strong>Código:</strong> <span class="code">${issue.code}</span></p>
            <p><strong>Mensagem:</strong> ${issue.message}</p>
            <p><strong>Contexto:</strong> <code>${issue.context.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></p>
            <p><strong>Seletor:</strong> <span class="code">${issue.selector}</span></p>
          </li>
        `;
      });
      
      html += `
        </ul>
      `;
    });
  });
  
  html += `
    <h2>Recomendações</h2>
    <ul>
      <li>Adicionar texto alternativo (alt) a todas as imagens informativas</li>
      <li>Garantir contraste adequado entre texto e fundo</li>
      <li>Verificar se todos os elementos interativos são acessíveis por teclado</li>
      <li>Adicionar rótulos (labels) a todos os campos de formulário</li>
      <li>Garantir que a estrutura de cabeçalhos (h1-h6) seja hierárquica e significativa</li>
      <li>Verificar se todos os elementos têm nomes acessíveis</li>
      <li>Garantir que o site seja navegável usando apenas o teclado</li>
    </ul>
    
    <footer>
      <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    </footer>
  </body>
  </html>
  `;
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Relatório HTML gerado em ${htmlPath}`);
}

// Função principal para executar todos os testes
async function runAllTests() {
  const allResults = [];
  
  for (const page of PAGES) {
    for (const standard of STANDARDS) {
      try {
        const result = await runPa11y(page, standard);
        allResults.push(result);
      } catch (error) {
        console.error(`Falha ao testar ${page} com padrão ${standard}:`, error);
      }
    }
  }
  
  if (allResults.length > 0) {
    generateHTMLReport(allResults);
  }
}

// Executar todos os testes
console.log('Iniciando testes de acessibilidade com Pa11y...');
runAllTests().then(() => {
  console.log('Todos os testes de acessibilidade concluídos!');
}).catch(error => {
  console.error('Erro ao executar testes de acessibilidade:', error);
});