# PDI Frontend

Aplicação frontend em Vue 3 para consumir a API `PDI/Backend`.

Requisitos:
- Node.js 18+ (recomendo 20)

Como executar:

```bash
cd Frontend
npm install
npm run dev
```

Configuração:
- A API do backend é presumida em `http://localhost:3000`. Você pode configurar `VITE_API_BASE` no arquivo `.env` na pasta `Frontend`.

Rotas principais:
- `/login` - realizar login e obter token
- `/pdi` - listar PDIs do usuário autenticado
- `/pdi/register` - registrar múltiplos itens PDI
- `/pdi/update/:theme` - atualizar item PDI por tema

Observações:
- O token é salvo em `localStorage` e enviado no header `Authorization: Bearer <token>` automaticamente.
- Ajuste estilos e validações se desejar.
