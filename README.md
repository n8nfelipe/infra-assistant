<div align="center">

# 🚀 InfraStack

### Your AI-Powered Linux Infrastructure Assistant

*Talk to your server like a human. Let it do the rest.*

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## O que é o InfraStack?

**InfraStack** é uma ferramenta instalável via Docker que transforma linguagem natural em comandos de servidor Linux. Sem memorizar comandos. Sem consultar documentação. Apenas peça o que você quer — e execute com um clique.

> *"Instala o htop e git no servidor"* → O AI gera o comando correto para o seu sistema → Você aprova → Execução em tempo real no terminal integrado. Simples assim.

---

## ✨ Funcionalidades

| Feature | Detalhe |
|---|---|
| 🧠 **Natural Language** | Descreva o que quer em português ou inglês |
| 🎯 **OS-Aware** | Detecta automaticamente o sistema (Alpine, Ubuntu, Debian, CentOS...) e usa o gerenciador de pacotes correto (`apk`, `apt`, `yum`...) |
| 🛡️ **Execução Segura** | O AI propõe o comando, você **aprova antes** de executar |
| 📟 **Terminal em Tempo Real** | Veja a saída do comando sendo executado ao vivo, direto na interface |
| 💎 **Interface Premium** | UI moderna com glassmorphism, gradientes e animações suaves |
| 🐳 **100% Docker** | Instalação com um único comando |

---

## 🚀 Instalação

### Pré-requisitos
- Docker e Docker Compose instalados
- Uma **chave de API Gemini** gratuita → [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone o repositório

```bash
git clone <repo-url>
cd infra-assistant
```

### 2. Configure sua chave de API

```bash
echo "GEMINI_API_KEY=sua_chave_aqui" > .env
```

### 3. Suba o container

```bash
docker-compose up -d
```

### 4. Acesse a interface

```
http://localhost:3001
```

**Pronto!** 🎉

---

## 💬 Exemplos de uso

```
"Instala o git, curl e wget no servidor"
"Verifica o uso de disco e memória"
"Lista todos os containers Docker rodando"
"Configura o timezone para America/Sao_Paulo"
"Mostra os logs do nginx"
"Quanto espaço livre tem no disco?"
```

---

## 🏗️ Arquitetura

```
infra-assistant/
├── client/                  # Frontend React (Vite)
│   └── src/
│       ├── App.jsx          # Interface de chat principal
│       └── index.css        # Design premium (glassmorphism)
├── server/                  # Backend Node.js / Express 5
│   ├── index.js             # API endpoints + serve frontend
│   ├── gemini.js            # Integração Gemini AI + detecção de OS
│   └── executor.js          # Execução segura de comandos (streaming)
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Configuração de deploy
└── .env                     # Suas chaves (não commitado)
```

### Como funciona internamente

```
Usuário digita → API /generate → Gemini AI analisa
    → Retorna JSON com comando + explicação
    → Usuário aprova → API /execute
    → Backend executa com child_process
    → Output streamed em tempo real para o browser
```

---

## 🔒 Segurança

- **Aprovação Obrigatória**: Nenhum comando é executado sem confirmação explícita do usuário.
- **Avisos automáticos**: O AI indica riscos potenciais de cada comando antes da execução.
- **`.gitignore` configurado**: Suas credenciais nunca são expostas no repositório.

---

## ⚙️ Configuração Avançada

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `GEMINI_API_KEY` | Sua chave da API do Google Gemini | **Obrigatório** |
| `PORT` | Porta da aplicação | `3001` |

### Múltiplos arquivos de ambiente

```bash
# .env → configurações padrão
# .env.local → sobrescreve localmente (não commitado)
echo "GEMINI_API_KEY=minha_chave" > .env.local
```

---

## 🤝 Contribuindo

PRs são bem-vindos! Se você tem ideias de novas features — como histórico de comandos, suporte a múltiplos servidores via SSH, ou integrações com Kubernetes — abra uma issue.

---

<div align="center">

Feito com ☕ e muito terminal.

</div>
