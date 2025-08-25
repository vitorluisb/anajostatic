# Testes de Responsividade e Performance - ONG Anajo

Este diretório contém scripts e ferramentas para testar a responsividade, performance e acessibilidade do site da ONG Anajo.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM (gerenciador de pacotes do Node.js)
- Um servidor local rodando o site (ex: http-server)

## Instalação

1. Navegue até o diretório de testes:
   ```
   cd testes
   ```

2. Instale as dependências:
   ```
   npm install
   ```

## Executando os Testes

### Teste de Performance (Lighthouse)

Executa testes de performance, acessibilidade, melhores práticas, SEO e PWA usando o Google Lighthouse:

```
npm run test:lighthouse
```

Os relatórios serão gerados no diretório `lighthouse-reports/`.

### Teste de Acessibilidade (Pa11y)

Executa testes de acessibilidade usando o Pa11y para verificar conformidade com WCAG 2.0 (A, AA, AAA):

```
npm run test:accessibility
```

Os relatórios serão gerados no diretório `accessibility-reports/`.

### Teste de Responsividade (Puppeteer)

Captura screenshots do site em diferentes tamanhos de tela para verificar a responsividade:

```
npm run test:responsiveness
```

Os screenshots serão salvos no diretório `screenshots/` e um relatório HTML será gerado.

### Executar Todos os Testes

Para executar todos os testes em sequência:

```
npm run test:all
```

## Checklist Manual

Além dos testes automatizados, é recomendado realizar testes manuais usando o checklist disponível no arquivo `responsividade-performance.md`.

## Interpretando os Resultados

### Lighthouse

- **Performance**: Deve ser > 90
- **Acessibilidade**: Deve ser > 90
- **Melhores Práticas**: Deve ser > 90
- **SEO**: Deve ser > 90
- **PWA**: Deve ser > 90

### Métricas Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Acessibilidade

- Nenhum erro de nível A do WCAG 2.0
- Mínimo de erros de nível AA e AAA

### Responsividade

- Sem rolagem horizontal em nenhum dispositivo
- Elementos clicáveis com tamanho adequado em dispositivos móveis
- Texto legível em todos os dispositivos
- Menu de navegação funcional em todos os dispositivos

## Solução de Problemas Comuns

### Performance

1. **Imagens grandes**: Comprimir e redimensionar imagens
2. **JavaScript não otimizado**: Minificar e usar carregamento assíncrono
3. **CSS não utilizado**: Remover estilos não utilizados
4. **Recursos bloqueando renderização**: Adiar carregamento de recursos não críticos

### Acessibilidade

1. **Falta de texto alternativo**: Adicionar atributos alt a imagens
2. **Contraste insuficiente**: Ajustar cores para melhorar contraste
3. **Falta de labels em formulários**: Adicionar labels a todos os campos
4. **Estrutura de cabeçalhos incorreta**: Corrigir hierarquia de cabeçalhos

### Responsividade

1. **Elementos com largura fixa**: Usar unidades relativas (%, rem, em)
2. **Imagens não responsivas**: Usar max-width: 100% e height: auto
3. **Tabelas não responsivas**: Implementar rolagem horizontal apenas para tabelas
4. **Fontes muito pequenas**: Usar tamanho mínimo de 16px para texto principal