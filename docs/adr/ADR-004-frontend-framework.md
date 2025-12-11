# ADR-004: Frontend Framework Choice

**Status:** Accepted  
**Date:** 2024-12-11  
**Decision Makers:** QA Team Lead, Frontend Architect  
**Tags:** #frontend #react #vite

## Context

O QADash necessita de uma interface web moderna, responsiva e performática para visualização de resultados de testes em tempo real. A escolha do framework frontend impacta diretamente:

- **Developer Experience (DX):** Velocidade de desenvolvimento e curva de aprendizado
- **Performance:** Tempo de carregamento e reatividade da UI
- **Ecossistema:** Disponibilidade de bibliotecas para charts, websockets, etc.
- **Manutenibilidade:** Facilidade de atualização e evolução do código

### Requisitos Técnicos

- Suporte a WebSocket para atualizações em tempo real
- Renderização eficiente de gráficos e tabelas grandes
- Build rápido para desenvolvimento ágil
- Compatibilidade com Chart.js para visualizações
- Hot Module Replacement (HMR) para desenvolvimento

### Alternativas Consideradas

1. **React 18 + Vite**
   - ✅ Ecossistema maduro com 200k+ pacotes NPM
   - ✅ Vite com HMR instantâneo (<100ms)
   - ✅ React 18 com Concurrent Rendering para performance
   - ✅ Excelente integração com Chart.js e Socket.IO
   - ⚠️ JSX syntax requer aprendizado inicial

2. **Vue 3 + Vite**
   - ✅ Template syntax mais familiar para iniciantes
   - ✅ Vite nativo do ecossistema Vue
   - ✅ Composition API moderna
   - ⚠️ Ecossistema menor que React
   - ⚠️ Menos desenvolvedores familiarizados no time

3. **Angular 17**
   - ✅ Framework completo com tudo incluído
   - ✅ TypeScript por padrão
   - ⚠️ Build time mais lento (~2-5s vs <100ms do Vite)
   - ⚠️ Bundle size maior (~200KB vs ~50KB do React)
   - ⚠️ Curva de aprendizado mais íngreme

4. **Svelte + SvelteKit**
   - ✅ Performance excepcional (compila para JS vanilla)
   - ✅ Sintaxe mais simples
   - ⚠️ Ecossistema ainda imaturo
   - ⚠️ Menos recursos para debugging
   - ⚠️ Time sem experiência prévia

## Decision

**Escolhemos React 18 + Vite** para o frontend do QADash.

### Justificativa

1. **Vite para Build Ultra-Rápido**
   - Cold start em <1s vs 10-30s do Webpack
   - HMR em <100ms preserva estado da aplicação
   - Build de produção otimizado com Rollup
   - Suporte nativo a TypeScript, JSX, CSS Modules

2. **React 18 para UI Moderna**
   - Concurrent Rendering melhora performance em listas grandes
   - Suspense para lazy loading de componentes
   - Server Components (futuro) para SSR otimizado
   - Hooks facilitam reutilização de lógica

3. **Ecossistema Rico**
   - Chart.js (4.4.0) com react-chartjs-2
   - Socket.IO Client (4.8.1) para WebSocket
   - React Router (6.x) para navegação SPA
   - React Query para cache de dados

4. **Time e Comunidade**
   - 70% do time já tem experiência com React
   - 18M downloads/semana no NPM
   - Documentação extensa e comunidade ativa

### Stack Técnica Final

```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "react-router-dom": "^6.20.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "socket.io-client": "^4.8.1",
  "@tanstack/react-query": "^5.0.0"
}
```

## Consequences

### Positivas

- ✅ **Desenvolvimento Rápido:** Vite reduz tempo de build em 90%
- ✅ **Performance Excelente:** React 18 + code splitting = <3s FCP
- ✅ **Ecossistema Maduro:** Acesso a milhares de bibliotecas testadas
- ✅ **Contratação Fácil:** Grande pool de desenvolvedores React
- ✅ **Futuro-Proof:** React Server Components e novas features

### Negativas

- ⚠️ **Bundle Size:** React + React-DOM = ~130KB (gzip ~42KB)
- ⚠️ **JSX Learning Curve:** Novos devs precisam aprender JSX
- ⚠️ **Ferramentas Extras:** Precisa ESLint, Prettier, etc.

### Métricas de Sucesso

- Cold start dev server: <2s (atual: 800ms ✅)
- HMR: <200ms (atual: 80ms ✅)
- Build de produção: <30s (atual: 12s ✅)
- First Contentful Paint: <2s
- Time to Interactive: <3s

## Implementation Notes

### Configuração Vite Otimizada

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

### Estrutura de Pastas

```
frontend/src/
├── components/       # Componentes reutilizáveis
├── pages/           # Páginas principais
├── hooks/           # Custom hooks
├── services/        # API calls e WebSocket
├── utils/           # Funções auxiliares
└── styles/          # CSS global e variáveis
```

## References

- [Vite Official Docs](https://vitejs.dev/)
- [React 18 Release Notes](https://react.dev/blog/2022/03/29/react-v18)
- [Vite vs Webpack Benchmark](https://vitejs.dev/guide/why.html)
- [Chart.js Integration Guide](https://www.chartjs.org/docs/latest/)

## Revision History

- **2024-12-11:** Initial decision - React 18 + Vite
