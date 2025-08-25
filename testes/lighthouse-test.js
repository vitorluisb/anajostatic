/**
 * Script para executar testes de performance usando Lighthouse CLI
 * 
 * Pré-requisitos:
 * 1. Node.js instalado
 * 2. Instalar o Lighthouse CLI: npm install -g lighthouse
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

const DEVICES = [
  'desktop',
  'mobile'
];

const CATEGORIES = [
  'performance',
  'accessibility',
  'best-practices',
  'seo',
  'pwa'
];

// Criar diretório para relatórios se não existir
const reportsDir = path.join(__dirname, 'lighthouse-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Função para executar o Lighthouse
async function runLighthouse(page, device) {
  const url = `${BASE_URL}/${page}`;
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(reportsDir, `${page || 'home'}-${device}-${dateStr}`);
  
  const categoriesParam = CATEGORIES.join(',');
  
  console.log(`Executando teste para ${url} em ${device}...`);
  
  return new Promise((resolve, reject) => {
    exec(
      `lighthouse ${url} --output=html,json --output-path=${outputPath} --emulated-form-factor=${device} --only-categories=${categoriesParam}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar Lighthouse para ${url} em ${device}:`, error);
          reject(error);
          return;
        }
        
        console.log(`Teste concluído para ${url} em ${device}. Relatório salvo em ${outputPath}.html`);
        resolve(outputPath);
      }
    );
  });
}

// Função para extrair métricas principais do relatório JSON
function extractMetrics(jsonReportPath) {
  try {
    const reportData = JSON.parse(fs.readFileSync(`${jsonReportPath}.json`, 'utf8'));
    
    const { audits, categories } = reportData;
    
    return {
      url: reportData.requestedUrl,
      device: reportData.configSettings.emulatedFormFactor,
      scores: {
        performance: categories.performance.score * 100,
        accessibility: categories.accessibility.score * 100,
        bestPractices: categories['best-practices'].score * 100,
        seo: categories.seo.score * 100,
        pwa: categories.pwa.score * 100
      },
      metrics: {
        lcp: audits['largest-contentful-paint'].numericValue,
        fid: audits['max-potential-fid'].numericValue,
        cls: audits['cumulative-layout-shift'].numericValue,
        ttfb: audits['server-response-time'].numericValue,
        tbt: audits['total-blocking-time'].numericValue
      }
    };
  } catch (error) {
    console.error('Erro ao extrair métricas:', error);
    return null;
  }
}

// Função para gerar relatório CSV com todas as métricas
function generateCSVReport(allMetrics) {
  const csvHeader = 'URL,Device,Performance,Accessibility,Best Practices,SEO,PWA,LCP (ms),FID (ms),CLS,TTFB (ms),TBT (ms)\n';
  
  const csvRows = allMetrics.map(metric => {
    return [
      metric.url,
      metric.device,
      metric.scores.performance.toFixed(1),
      metric.scores.accessibility.toFixed(1),
      metric.scores.bestPractices.toFixed(1),
      metric.scores.seo.toFixed(1),
      metric.scores.pwa.toFixed(1),
      metric.metrics.lcp.toFixed(1),
      metric.metrics.fid.toFixed(1),
      metric.metrics.cls.toFixed(3),
      metric.metrics.ttfb.toFixed(1),
      metric.metrics.tbt.toFixed(1)
    ].join(',');
  }).join('\n');
  
  const csvContent = csvHeader + csvRows;
  const dateStr = new Date().toISOString().split('T')[0];
  const csvPath = path.join(reportsDir, `lighthouse-summary-${dateStr}.csv`);
  
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`Relatório CSV gerado em ${csvPath}`);
}

// Função principal para executar todos os testes
async function runAllTests() {
  const allMetrics = [];
  
  for (const device of DEVICES) {
    for (const page of PAGES) {
      try {
        const reportPath = await runLighthouse(page, device);
        const metrics = extractMetrics(reportPath);
        
        if (metrics) {
          allMetrics.push(metrics);
          console.log(`Métricas extraídas para ${page || 'home'} em ${device}:`, 
            `Performance: ${metrics.scores.performance.toFixed(1)}%, `,
            `LCP: ${(metrics.metrics.lcp / 1000).toFixed(2)}s, `,
            `CLS: ${metrics.metrics.cls.toFixed(3)}`);
        }
      } catch (error) {
        console.error(`Falha ao testar ${page} em ${device}:`, error);
      }
    }
  }
  
  if (allMetrics.length > 0) {
    generateCSVReport(allMetrics);
  }
}

// Executar todos os testes
console.log('Iniciando testes de performance com Lighthouse...');
runAllTests().then(() => {
  console.log('Todos os testes concluídos!');
}).catch(error => {
  console.error('Erro ao executar testes:', error);
});