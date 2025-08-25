/**
 * Script para testar a responsividade do site usando Puppeteer
 * 
 * Pré-requisitos:
 * 1. Node.js instalado
 * 2. Instalar o Puppeteer: npm install puppeteer
 * 3. Ter um servidor local rodando o site (ex: http-server)
 */

const puppeteer = require('puppeteer');
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

// Dispositivos para teste
const DEVICES = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Mobile Medium', width: 375, height: 667 },
  { name: 'Mobile Small', width: 320, height: 568 }
];

// Criar diretório para screenshots se não existir
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Função para capturar screenshots
async function captureScreenshots() {
  console.log('Iniciando captura de screenshots para teste de responsividade...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Desativar CSS que pode interferir nos testes
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'stylesheet' && request.url().includes('print.css')) {
      request.abort();
    } else {
      request.continue();
    }
  });
  
  // Criar relatório HTML
  let reportHtml = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Responsividade - ONG Anajo</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1 { color: #2e86de; }
      h2 { color: #2e86de; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      h3 { margin-top: 20px; }
      .device-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
      .device-card { border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
      .device-card h3 { margin: 0; padding: 10px; background: #f5f5f5; }
      .device-card img { width: 100%; height: auto; display: block; }
      .device-info { padding: 10px; }
      .device-info p { margin: 5px 0; }
      .page-nav { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
      .page-nav a { display: inline-block; padding: 5px 10px; background: #f5f5f5; border-radius: 3px; text-decoration: none; color: #333; }
      .page-nav a:hover { background: #e0e0e0; }
      .page-nav a.active { background: #2e86de; color: white; }
    </style>
  </head>
  <body>
    <h1>Relatório de Responsividade - ONG Anajo</h1>
    <p>Data do teste: ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <div class="page-nav">
      ${PAGES.map(page => `<a href="#${page || 'home'}">${page || 'Home'}</a>`).join('')}
    </div>
  `;
  
  // Para cada página
  for (const pagePath of PAGES) {
    const url = `${BASE_URL}/${pagePath}`;
    const pageName = pagePath || 'home';
    
    console.log(`Testando página: ${url}`);
    reportHtml += `
      <h2 id="${pageName}">${pageName}</h2>
      <div class="device-grid">
    `;
    
    // Para cada dispositivo
    for (const device of DEVICES) {
      console.log(`  Testando em ${device.name} (${device.width}x${device.height})`);
      
      // Configurar viewport
      await page.setViewport({
        width: device.width,
        height: device.height
      });
      
      // Navegar para a página
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Aguardar carregamento completo
      await page.waitForTimeout(2000);
      
      // Capturar screenshot
      const screenshotPath = `${pageName}-${device.name.toLowerCase().replace(' ', '-')}.png`;
      const screenshotFullPath = path.join(screenshotsDir, screenshotPath);
      await page.screenshot({ path: screenshotFullPath, fullPage: true });
      
      // Verificar se há rolagem horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      // Adicionar ao relatório
      reportHtml += `
        <div class="device-card">
          <h3>${device.name}</h3>
          <img src="screenshots/${screenshotPath}" alt="Screenshot de ${pageName} em ${device.name}">
          <div class="device-info">
            <p><strong>Resolução:</strong> ${device.width}x${device.height}</p>
            <p><strong>Rolagem horizontal:</strong> ${hasHorizontalScroll ? '❌ Sim' : '✅ Não'}</p>
          </div>
        </div>
      `;
    }
    
    reportHtml += `
      </div>
    `;
  }
  
  reportHtml += `
    <h2>Recomendações</h2>
    <ul>
      <li>Verificar se há rolagem horizontal em dispositivos móveis</li>
      <li>Garantir que todos os elementos são clicáveis em dispositivos móveis</li>
      <li>Verificar se o texto é legível em todos os dispositivos</li>
      <li>Garantir que imagens são responsivas</li>
      <li>Verificar se o menu de navegação colapsa corretamente em dispositivos móveis</li>
    </ul>
    
    <footer>
      <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    </footer>
  </body>
  </html>
  `;
  
  // Salvar relatório HTML
  const dateStr = new Date().toISOString().split('T')[0];
  const reportPath = path.join(__dirname, `responsiveness-report-${dateStr}.html`);
  fs.writeFileSync(reportPath, reportHtml, 'utf8');
  
  await browser.close();
  
  console.log(`Capturas de tela concluídas. Relatório gerado em ${reportPath}`);
}

// Executar teste
captureScreenshots().catch(error => {
  console.error('Erro ao executar teste de responsividade:', error);
});