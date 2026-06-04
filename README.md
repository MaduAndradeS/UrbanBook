# 📱 UrbanBook

> Aplicativo mobile desenvolvido para as matérias de PI - Projeto e Implementação de Aplicativos e Banco de Dados.

## Guia de Execução do Projeto
Este documento detalha os passos necessários para configurar e executar a aplicação UrbanBook localmente. O projeto é dividido em duas partes principais: o **Servidor** (Back-End em Node.js com Prisma) e o **Aplicativo** (Front-End em React Native com Expo).

---

## 1. Pré-requisitos
Antes de iniciar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** instalado no smartphone (para testar o app físico).

---

## 2. Clonando o Repositório
Abra o terminal e execute o comando abaixo para baixar o código-fonte do projeto:

```bash
git clone [https://github.com/MaduAndradeS/UrbanBook.git](https://github.com/MaduAndradeS/UrbanBook.git)
cd UrbanBook
```

<img width="1919" height="1048" alt="image" src="https://github.com/user-attachments/assets/cef1511b-710f-478f-9ed5-5c2068196814" />

---

## 3. Configurando e Executando o Back-End (Servidor)
No terminal, navegue até a pasta do servidor:

```bash
cd backend
```

**Passo 3.1: Instalar dependências**
```bash
npm install
```

**Passo 3.2: Configurar o Banco de Dados (Prisma ORM)**
Gere o cliente do Prisma e sincronize as tabelas com o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

**Passo 3.3: Iniciar o servidor**
```bash
npm run dev
```
*(Mantenha este terminal aberto para que o servidor continue rodando).*

---

## 4. Configurando e Executando o Front-End (Aplicativo)

No Expo, o celular físico não reconhece o endereço `localhost`. É estritamente necessário colocar o endereço de IP da máquina onde o servidor está rodando.

**Passo 4.1: Configurar o IP Local**
Edite o arquivo `UrbanBook/config/api.ts` e aponte para o IP da sua rede Wi-Fi local:

```typescript
// Exemplo de IP local. Verifique o seu IP via comando 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux)
export const EXPO_PUBLIC_API_URL = "[http://192.168.](http://192.168.)X.X:3000";
```

**Passo 4.2: Iniciar o servidor do Expo**
Em um **novo terminal**, certifique-se de que está na pasta raiz `UrbanBook` e execute:

```bash
npx expo start
```

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/da595f58-e257-47f7-b22e-1523887f1a4b" />

---

## 5. Testando o Aplicativo
Após rodar o comando do Expo, um **QR Code** aparecerá no terminal.

1. Conecte seu smartphone na **mesma rede Wi-Fi** do computador.
2. Abra o aplicativo **Expo Go** no celular e escaneie o QR Code (ou use a câmera, caso seja um iPhone).
3. O aplicativo UrbanBook será compilado e aberto na tela do dispositivo, já integrado com o servidor local e o banco de dados.

   
