# AgroSolutions Dashboard Web - Guia de Instalação e Uso

## 📋 Visão Geral

Dashboard web responsivo para monitoramento de talhões em propriedades rurais. Integra dados de sensores, alertas e previsão do tempo em uma interface intuitiva.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 14+ e npm 6+
- Angular CLI 15+
- Uma conta OpenWeatherMap (gratuita em https://openweathermap.org/api)

### Instalação

```bash
# O projeto já foi clonado e as dependências instaladas
# Se precisar reinstalar:
npm install --ignore-scripts
```

### Configuração

#### 1. Variáveis de Ambiente

Edite `src/environments/environment.ts` com as URLs reais das APIs:

```typescript
export const environment = {
  production: false,
  apiUrls: {
    usuario: 'http://localhost:5000',    // Seu IP/domínio da API Usuario
    sensores: 'http://localhost:5001',   // Sua URL da API Sensores
    monitoracao: 'http://localhost:5002', // Sua URL da API Monitoracao
    propriedade: 'http://localhost:5003'  // Sua URL da API Propriedade
  },
  openWeatherMap: {
    apiKey: 'SUA_CHAVE_API_AQUI',  // Obtenha em https://openweathermap.org/api
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  }
};
```

#### 2. CORS (Importante!)

As APIs backend devem ter CORS habilitado para aceitar requisições do frontend. Adicione no seu Program.cs das APIs:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb", p =>
        p.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});

app.UseCors("AllowWeb");
```

### Rodar o Projeto

```bash
# Desenvolvimento (com hot reload)
npm start
# Acesse: http://localhost:4200

# Build para produção
npm run build:prod
# Resultado em ./dist/
```

## 📱 Estrutura do Projeto

```
src/app/
├── core/
│   ├── auth/                    # Autenticação
│   │   ├── services/auth.service.ts
│   │   ├── guards/auth.guard.ts
│   │   ├── interceptors/auth.interceptor.ts
│   │   └── models/
│   ├── services/                # APIs
│   │   ├── sensores.service.ts
│   │   ├── monitoracao.service.ts
│   │   ├── propriedade.service.ts
│   │   └── clima.service.ts
│   └── models/                  # Interfaces TypeScript
│
├── features/
│   ├── login/                   # Tela de login
│   │   ├── login.component.ts
│   │   └── login.module.ts
│   └── dashboard/               # Dashboard principal
│       ├── dashboard.component.ts
│       ├── components/
│       │   ├── card-talhao/     # Status do talhão
│       │   ├── grafico-sensores/ # Gráfico Chart.js
│       │   ├── card-clima/      # Previsão de tempo
│       │   └── lista-alertas/   # Tabela de alertas
│       └── dashboard.module.ts
│
├── shared/                      # Componentes reutilizáveis
│   ├── components/
│   └── utils/
│
└── app-routing.module.ts       # Rotas principais
```

## 🔐 Fluxo de Autenticação

1. Usuário acessa `/login`
2. Submete email + senha
3. AuthService faz POST `/login` (API Usuario)
4. Token JWT recebido e armazenado em localStorage
5. AuthInterceptor injeta token em todas as requisições
6. Se 401 recebido → logout automático + redireciona `/login`

## 📊 Estrutura de Dados

### Leitura de Sensores
```json
{
  "id": "mongo-id",
  "idTalhao": "uuid",
  "dataLeitura": "2026-02-27T10:30:00Z",
  "umidadeSolo": 60.5,
  "temperatura": 28.3,
  "precipitacao": 0
}
```

### Alerta
```json
{
  "id": "alerta-id",
  "idTalhao": "uuid",
  "tipo": "Seca",
  "mensagem": "Umidade do solo abaixo de 60%",
  "criadoEm": "2026-02-27T10:20:00Z",
  "status": "Ativo"
}
```

### Propriedade com Talhões
```json
{
  "idPropriedade": "uuid",
  "nome": "Fazenda do João",
  "talhoes": [
    {
      "idTalhao": "uuid",
      "nome": "Talhão A",
      "cultura": "Milho",
      "areaHectares": 50
    }
  ]
}
```

## 🎨 Components Principais

### DashboardComponent
- **Responsabilidade**: Orquestrator principal
- **Dados**: Carrega propriedade, talhão, leituras, alertas, clima
- **Auto-refresh**: A cada 5 minutos

### CardTalhaoComponent
- **Exibe**: Nome, cultura, área, umidade, temperatura
- **Status**: Normal/Alerta/Risco (baseado em alertas ativos)
- **Inputs**: talhao, leituraAtual, alertas

### GraficoSensoresComponent
- **Tipo**: Chart.js com 2 eixos Y
- **Dados**: Últimos 7 dias
- **Séries**: Umidade (%) e Temperatura (°C)

### CardClimaComponent
- **Integração**: OpenWeatherMap API
- **Exibe**: Temperatura atual, sensação térmica, umidade
- **Previsão**: Próximos 5 dias

### ListaAlertasComponent
- **Tipo**: Tabela responsiva
- **Ações**: Botão para resolver alerta
- **Emit**: Evento ao clicar resolver

## 🔑 APIs Integradas

### POST /login (Usuario API)
```typescript
// Request
{ email: string, senha: string }

// Response
{
  token: "eyJ...",
  expiresAtUtc: "2026-02-27T...",
  usuario: { id, nome, email }
}
```

### GET /leituras (Sensores API)
```
Query params:
- idTalhao (required)
- de, ate (ISO date strings)
- limite (default: 100)
```

### GET /alertas (Monitoracao API)
```
Query params:
- idTalhao (required)
- somenteAtivos (default: true)
- limite (default: 50)
```

### POST /alertas/{id}/resolver (Monitoracao API)
```
Marca alerta como resolvido
```

### GET /propriedades?idProdutor={id} (Propriedade API)
```
Retorna todas as propriedades do produtor
```

## ⚙️ Variáveis de Ambiente (prod)

Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrls: {
    usuario: 'https://SEU_DOMINIO.com/usuario',
    sensores: 'https://SEU_DOMINIO.com/sensores',
    monitoracao: 'https://SEU_DOMINIO.com/monitoracao',
    propriedade: 'https://SEU_DOMINIO.com/propriedade'
  },
  openWeatherMap: {
    apiKey: 'SUA_CHAVE_PRODUCAO',
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  }
};
```

## 🧪 Testes Manuais

### 1. Fluxo de Login
- [ ] Acesse http://localhost:4200
- [ ] Será redirecionado para `/login`
- [ ] Submeta credenciais válidas
- [ ] Verifique se token foi armazenado em localStorage
- [ ] Dashboard carrega automaticamente

### 2. Carregamento de Dados
- [ ] Verifique console para erros
- [ ] Cards exibem dados corretos
- [ ] Gráfico mostra 7 dias de dados
- [ ] Clima mostra previsão

### 3. Resolução de Alertas
- [ ] Com alertas ativos, clique "Resolver"
- [ ] Alerta é removido da lista
- [ ] Spinner aparece enquanto processa

### 4. Token Expirado
- [ ] Simule expiração (deletar localStorage)
- [ ] Faça uma requisição qualquer
- [ ] Será redirecionado para `/login`

## 📦 Build para Produção

```bash
# Build otimizado
npm run build:prod

# Resultado em ./dist/agrosolutions-web/
# Serve com seu servidor web favorito (Nginx, Apache, etc)
```

## 🐛 Troubleshooting

### CORS Error
**Problema**: "Access to XMLHttpRequest blocked by CORS policy"
**Solução**: Adicione CORS middleware na API backend

### Token não está sendo enviado
**Problema**: Requisições não incluem "Authorization: Bearer ..."
**Solução**: Verifique se AuthInterceptor está registrado em AuthModule

### Gráfico não aparece
**Problema**: Canvas vazio
**Solução**: Aguarde um momento, Chart.js é carregado após component init

### Clima retorna erro 401
**Problema**: "Invalid API key"
**Solução**: Configure chave OpenWeatherMap válida em environment.ts

## 📚 Recursos

- [Angular Docs](https://angular.io/docs)
- [Chart.js Docs](https://www.chartjs.org/)
- [Bootstrap 4 Docs](https://getbootstrap.com/docs/4.0/)
- [OpenWeatherMap API](https://openweathermap.org/api)

## 📝 Notas Importantes

1. **LocalStorage**: Token e dados do usuário são salvos em localStorage
2. **Auto-refresh**: Dashboard atualiza alertas a cada 5 minutos
3. **Responsividade**: Layout adapta para mobile/tablet automáticamente
4. **Sem Redux**: Estado gerenciado com RxJS Subjects (mantém simplicidade)
5. **Sem Testes Unitários**: Focar em testes manuais E2E

## 📧 Suporte

Para dúvidas ou problemas, verifique os logs do console (F12 > Console tab).
