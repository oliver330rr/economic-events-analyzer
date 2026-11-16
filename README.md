# Meu dia — lista de tarefas

Protótipo web responsivo de lista de tarefas, em português, sem dependências nem backend. As tarefas são persistidas no `localStorage` do navegador.

## Usar

Abra `index.html` em um navegador moderno. Alternativamente, sirva a pasta localmente:

```bash
python -m http.server 8000
```

Acesse <http://localhost:8000>.

## Recursos

- Criar, editar, concluir e excluir tarefas
- Filtros para todas, pendentes e concluídas
- Limpar tarefas concluídas
- Salvamento automático no navegador e sincronização entre abas abertas
- Interface responsiva e acessível

Os dados ficam apenas neste navegador e não são sincronizados entre dispositivos. Limpar os dados do site no navegador também apaga as tarefas. Este protótipo não inclui SSO nem conta de usuário.
