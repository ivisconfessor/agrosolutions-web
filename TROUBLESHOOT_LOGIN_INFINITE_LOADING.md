# Guia de Troubleshooting - Login Infinite Loading

## Problema Identificado e Corrigido

### 🔴 Problema Principal
A variável `loading` não era definida como `false` quando o login era bem-sucedido, causando o spinner a ficar girando indefinidamente.

**Arquivo corrigido:** `src/app/features/login/login.component.ts`

**Alteração:**
```typescript
// ANTES (Linha do sucesso não tinha loading = false)
() => {
  this.router.navigateByUrl(this.returnUrl || '/dashboard');
},

// DEPOIS (Adicionado loading = false)
() => {
  this.loading = false;
  this.router.navigateByUrl(this.returnUrl || '/dashboard');
},
```

---

## Checklist de Diagnóstico

### 1. **Verificar se o Servidor Backend está Rodando**
```bash
# Confirme que a API está rodando em http://localhost:5000
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@agro.com","senha":"Senha123"}'

# Esperado: Deve retornar um token ou uma mensagem de erro (não timeout)
```

### 2. **Verificar o Console do Navegador (F12)**
Após a correção, você deve ver as mensagens de log:
```
[AuthService] Iniciando login para: usuario@agro.com
[AuthService] URL da API: http://localhost:5000/login
[AuthService] Login bem-sucedido
```

Ou em caso de erro:
```
[AuthService] Erro no login: {erro details}
```

### 3. **Validar Credenciais Padrão**
De acordo com o template, as credenciais padrão são:
- **Email:** `usuario@agro.com`
- **Senha:** `Senha123`

Verifique se essas credenciais existem no banco de dados da API.

### 4. **Verificar Network Tab do DevTools**
1. Abra DevTools (F12) → **Network** tab
2. Tente fazer login
3. Procure pela requisição POST para `http://localhost:5000/login`
4. Verifique:
   - **Status:** Deve ser 200 (sucesso) ou 401/400 (erro)
   - **Response:** Deve conter `token` e `usuario`
   - **Headers:** Content-Type deve ser `application/json`

### 5. **Verificar a Configuração de Ambiente**
Arquivo: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrls: {
    usuario: 'http://localhost:5000',  // ← Verifique se é o URL correto
    sensores: 'http://localhost:5001',
    monitoracao: 'http://localhost:5002',
    propriedade: 'http://localhost:5003',
  },
};
```

Se a porta ou host estiver incorreto, atualize aqui.

---

## Possíveis Causas Ainda a Investigar

### ❌ Se o Loading Infinito AINDA Existir:

#### 1. **A API não está respondendo**
- Verifique se o servidor Node/Express em `http://localhost:5000` está rodando
- Verifique os logs do servidor backend em busca de erros

#### 2. **Problema CORS**
Se ver erro no console:
```
Access to XMLHttpRequest at 'http://localhost:5000/login' from origin 
'http://localhost:4200' has been blocked by CORS policy
```

**Solução:** O servidor backend precisa ter CORS configurado:
```javascript
// No backend (Node.js/Express)
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));
```

#### 3. **Resposta da API em formato incorreto**
A resposta deve ter a estrutura:
```json
{
  "token": "seu-token-aqui",
  "expiresAtUtc": "2026-02-27T...",
  "usuario": {
    "id": "123",
    "nome": "Usuário Teste",
    "email": "usuario@agro.com"
  }
}
```

#### 4. **Interceptadores alterando requisições**
Verifique se há interceptadores em `src/app/core/auth/interceptors/` que possam estar bloqueando requsições.

---

## Melhorias Realizadas

✅ **login.component.ts**: Adicionado `loading = false` no sucesso  
✅ **auth.service.ts**: Adicionado logging detalhado para debug  
✅ **auth.service.ts**: Melhor tratamento de erros com console.error

---

## Próximos Passos

1. **Teste o login** com as credenciais padrão
2. **Observe o console** (F12) para ver os logs de diagnóstico
3. **Se ainda tiver problema**, execute o checklist acima
4. **Verifique se o backend está rodando**: `curl http://localhost:5000/health` (ou qualquer healthcheck endpoint)

---

## Arquivo de Configuração da API

A configuração da API está em: `src/environments/environment.ts`

**Certificar-se que:**
- ✅ A URL da API está correta
- ✅ O servidor backend está rodando nessa URL
- ✅ CORS está configurado no backend
- ✅ A resposta do login tem o formato esperado
