# UrbanBook
Aplicativo mobile desenvolvido para as matérias de PI - Desenvolvimento de Aplicativos e Banco de Dados

Guia de Execução do Projeto: UrbanBook
Este documento detalha os passos necessários para configurar e executar a aplicação UrbanBook localmente. O projeto é dividido em duas partes: o Servidor (Back-End em Node.js com Prisma) e o Aplicativo (Front-End em React Native com Expo).

1. Pré-requisitos
  Antes de iniciar, certifique-se de ter instalado em sua máquina:
    Node.js (versão 18 ou superior)
    Git
    Aplicativo Expo Go instalado no smartphone (para testar o app físico).

2. Clonando o Repositório
  Abra o terminal e execute o comando abaixo para baixar o código-fonte do projeto:

  git clone https://github.com/MaduAndradeS/UrbanBook.git
  
  cd UrbanBook

  <img width="1919" height="1048" alt="image" src="https://github.com/user-attachments/assets/cef1511b-710f-478f-9ed5-5c2068196814" />

3. Configurando e Executando o Back-End (Servidor)
  Abra um terminal e navegue até a pasta do servidor:
  cd backend

  Passo 3.1: Instale todas as dependências do projeto.
    npm install

  Passo 3.2: Configure o Banco de Dados (Prisma ORM).
    Gere o cliente do Prisma e sincronize as tabelas com o banco de dados:
    npx prisma generate
    npx prisma db push

  Passo 3.4: Inicie o servidor.
    npm start

4. No aplicativo Expo, o celular físico não reconhece localhost. É necessário colocar o endereço de IP da máquina onde o servidor está rodando.
  Edite o arquivo UrbanBook/config/api.ts e aponte para o IP da sua rede Wi-Fi local:

  # Exemplo de IP local. Verifique o seu IP via comando 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux)
  EXPO_PUBLIC_API_URL="http://192.168.X.X:3000"

  Passo 4.3: Em um novo terminal inicie o servidor do Expo dentro da pasta UrbanBook.
    npx expo start

  <img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/da595f58-e257-47f7-b22e-1523887f1a4b" />

  5. Testando a Aplicação
    Após rodar o comando do Expo, um QR Code aparecerá no terminal.
      Conecte seu smartphone na mesma rede Wi-Fi do computador.
      Abra o aplicativo Expo Go no celular e escaneie o QR Code (ou use a câmera do iPhone).
      O aplicativo UrbanBook será compilado e aberto na tela do dispositivo, já integrado com o servidor local e o banco de dados.
