# Debug - Loading Infinito no Login

## ✅ Corrições Implementadas

### 1. **Login Component** - Adicionalemnte corrigido
- ✅ `loading = false` no sucesso (já corrigido)
- ✅ `loading = false` no erro (já corrigido)
- ✅ Console.error para debug

### 2. **Auth Service** - Timeout Adicionado
- ✅ Timeout de **15 segundos** na requisição de login
- ✅ Se a requisição levar mais de 15s, retorna erro automático
- ✅ Logs detalhados no console

### 3. **Dashboard Component** - Timeout e Segurança
- ✅ Timeout de **10 segundos** em cada requisição de dados
- ✅ Detecção de chave OpenWeatherMap inválida (evita erro)
- ✅ Logs detalhados de cada etapa
- ✅ Não bloqueia se um serviço falhar

---

## 🔍 Como Diagnosticar o Problema

### Passo 1: Verificar se a API está rodando

```bash
# Terminal novo - verifique se o serviço usuario está rodando na porta 5059
curl -v http://localhost:5059/health
# ou
curl -v http://localhost:5059/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","senha":"test"}'
```

**Esperado:** Resposta do servidor (mesmo que 401 Unauthorized)  
**Problema:** Connection refused, timeout, ou hanging

### Passo 2: Verificar console do navegador (F12)

#### ✅ Se vir isso, significa que está tentando fazer login:
```
[AuthService] Iniciando login para: usuario@agro.com
[AuthService] URL da API: http://localhost:5059/login
```

#### ❌ Se o loading fica infinito, você deve ver um erro como:
```
[AuthService] Erro no login: TimeoutError: Timeout has occurred
```

ou

```
[AuthService] Erro no login: HttpErrorResponse { ... }
```

### Passo 3: Verificar Network Tab (F12 → Network)

1. Abra DevTools (F12)
2. Vá para aba **Network**
3. Limpe o histórico (Ctrl+L ou cmd+L)
4. Tente fazer login
5. Procure pela requisição POST para `localhost:5059/login`

**Verifique:**
- 🔴 **Status:** 0 = Conexão recusada, 200 = OK, 401 = Não autorizado
- 🔴 **Response Time:** Quanto tempo levou
- 🔴 **Response Body:** O que a API retornou

---

## 🚀 Teste Rápido

Se ainda estiver com loading infinito após as mudanças:

1. **Limpe o cache:**
   ```bash
   npm start
   ```

2. **Teste a API diretamente no terminal:**
   ```bash
   curl -X POST http://localhost:5059/login \
     -H "Content-Type: application/json" \
     -d '{"email":"usuario@agro.com","senha":"Senha123"}'
   ```

3. **Se vir connection refused:**
   - A API não está rodando
   - Verifique se o servidor backend foi iniciado
   - Verifique a porta correta

4. **Se vir timeout no console do navegador:**
   - A requisição levou mais de 15 segundos
   - Backend pode estar lento ou não respondendo

---

## 📝 Logs Esperados no Console

### ✅ LOGIN BEM-SUCEDIDO:
```
[AuthService] Iniciando login para: usuario@agro.com
[AuthService] URL da API: http://localhost:5059/login
[AuthService] Login bem-sucedido
[Dashboard] Iniciando carregamento de dados para usuário: <user-id>
[Dashboard] Propriedades carregadas: [...]
```

### ❌ LOGIN COM ERRO:
```
[AuthService] Iniciando login para: usuario@agro.com
[AuthService] URL da API: http://localhost:5059/login
[AuthService] Erro no login: TimeoutError: Timeout has occurred
```

ou

```
[AuthService] Erro no login: HttpErrorResponse {
  status: 401,
  message: "Email ou senha inválidos"
}
```

---

## 🔧 Próximos Passos se Ainda Houver Problema

1. **Certifique-se que o servidor backend está rodando:**
   ```bash
   # Verifique todos os serviços
   lsof -i :5059  # usuario
   lsof -i :5163  # propriedade
   lsof -i :5164  # sensores
   lsof -i :5165  # monitoracao
   ```

2. **Se nenhuma porta estiver aberta:**
   - Inicie os servidores backend
   - Confirme que estão na porta correta

3. **Se os servidores estão rodando mas ainda há erro:**
   - Copie o erro completo do console
   - Verifique se há CORS configurado no backend
   - Verifique se a resposta da API está no formato esperado

---

## 📋 Checklist Final

- [ ] Servidor backend usuario na porta 5059 está rodando
- [ ] npm start foi executado e compilou sem erros
- [ ] Cache do navegador foi limpo
- [ ] Console (F12) mostra logs sem "TimeoutError"
- [ ] Network tab mostra status 200 ou 401 (não "pending")
- [ ] Credenciais estão corretas (usuario@agro.com / Senha123)

---

**Se continuar com problemas, verifique o arquivo de logs do servidor backend para ver o que está acontecendo.**
