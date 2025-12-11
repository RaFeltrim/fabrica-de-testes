# Automation Scripts - QADash

Este diretório contém scripts de automação para testes e integração com o QADash, organizados por linguagem/tecnologia.

## Estrutura

```
automation-scripts/
├── python/                    # Scripts e automação em Python
│   ├── scripts/               # Utilitários Python (post_results.py, send_to_qadash.py)
│   ├── requirements.txt       # Dependências Python
│   └── run_tests.bat          # Script para executar testes Robot Framework
├── typescript/                # Scripts e testes em TypeScript
│   └── playwright-e2e/        # Testes E2E com Playwright
│       ├── package.json
│       ├── playwright.config.ts
│       ├── tests/
│       └── utils/
└── examples/                  # Exemplos e demos
    └── robot-framework/
        └── tests/
            └── saucedemo.robot  # Exemplo de teste Robot Framework
```

## Como Usar

### Testes Playwright (TypeScript)
```bash
cd typescript/playwright-e2e
npm install
npm test
```

### Scripts Python
```bash
cd python
pip install -r requirements.txt
run_tests.bat  # Executa testes Robot Framework e envia para QADash
```

### Exemplos
- `examples/robot-framework/tests/saucedemo.robot`: Exemplo de teste com Robot Framework.

## Notas
- Scripts Python focam em automação e integração.
- TypeScript é usado para testes E2E modernos.
- Exemplos são para referência e não devem ser executados em produção.