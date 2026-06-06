# 📱 UrbanBook

> Aplicativo mobile desenvolvido para as matérias de PI - Projeto e Implementação de Aplicativos e Banco de Dados.

## Guia de Execução do Projeto
Este documento detalha os passos necessários para configurar e executar a aplicação UrbanBook localmente. Há duas maneiras de rodar:
- Para Android, é possível baixar o arquivo (APK) disponível em https://drive.google.com/drive/u/1/folders/1hg8dTgrIAPkW1zSKNfN6VxxFKT2zMRwF, na pasta "ARQUIVO BAIXAVEL DO PROJETO". Porém, nesta opção, não é possível alterar fotos e subir fotos nos perfis devido a uma limitação própria da não-publicação em loja de aplicativo.
- Para iOS e Android, é possível rodá-lo localmente no aplicativo Expo Go. Neste caso, o projeto é dividido em duas partes principais: o **Servidor** (Back-End em Node.js com Prisma) e o **Aplicativo** (Front-End em React Native com Expo).

---

## Para rodar com o arquivo baixável (possível somente no Android):

Baixe o arquivo disponível no Drive https://drive.google.com/drive/u/1/folders/1hg8dTgrIAPkW1zSKNfN6VxxFKT2zMRwF, na pasta "ARQUIVO BAIXAVEL DO PROJETO". Ao baixar no celular, clique em Abrir e, caso seu celular dê mensagem de segurança, selecione "Abrir mesmo assim". 

Nesta opção, todas as funcionalidades estão operando normalmente (login, cadastro, busca de empresários, troca de endereço, agendamento), exceto as opções que incluem alterações em fotos, não sendo possível alterar nem subir novas fotos. Isso se deve a uma restrição do tipo de arquivo (APK), em versões futuras é possível gerar uma build específica para APP Store e Play Store, em que esta parte funciona plenamente.

---

## Para rodar com o Expo Go (possível em Android e iOS):

## 1. Pré-requisitos
Antes de iniciar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** instalado no smartphone (para testar o app físico).

---

## 2. Clonando o Repositório
Abra o terminal (pode ser o terminal do computador ou o terminal do VSCode) e execute o comando abaixo para baixar o código-fonte do projeto:

```bash
git clone [https://github.com/MaduAndradeS/UrbanBook.git](https://github.com/MaduAndradeS/UrbanBook.git)
cd UrbanBook
```

<img width="1919" height="1048" alt="image" src="https://github.com/user-attachments/assets/cef1511b-710f-478f-9ed5-5c2068196814" />

---

## 3. Configurando e Executando o Back-End (Servidor)
Atualmente, nosso backend está hospedado no Railway e rodando em nuvem. Porém, por garantia, recomendamos que:

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
npx prisma db pull
```
Este passo é opcional, o backend está em nuvem mas é possível utilizar desta maneira caso dê erro no local em que está hospedado (Railway):
**Passo 3.3: Iniciar o servidor**
```bash
npm run dev
```
*(Mantenha este terminal aberto para que o servidor continue rodando).*

Nota de Resolução de Problemas: Se ocorrer algum erro ao iniciar o servidor, é porque algumas dependências não são instaladas automaticamente com o comando padrão. Para resolver, instale os seguintes pacotes manualmente:

npm install bcryptjs crypto-js nodemailer

---

## 4. Configurando e Executando o Front-End (Aplicativo)

No Expo, o celular físico e o computador devem estar na mesma rede wifi ao rodar a instrução npx expo start ou, caso não consiga, use npx expo start --tunnel.

**Passo 4.0: Instalar dependências do Front-End**
Certifique-se de estar na pasta raiz do aplicativo e execute a instalação para garantir que todos os pacotes extras sejam baixados:

npm install

**Passo 4.1: Iniciar o servidor do Expo**
Em um **novo terminal**, certifique-se de que está na pasta raiz `UrbanBook` e execute:

```bash
npx expo start
```

Ou, caso não consiga usar a mesma rede, use:

```bash
npx expo start --tunnel
```

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/da595f58-e257-47f7-b22e-1523887f1a4b" />

---

## 5. Testando o Aplicativo
Após rodar o comando do Expo, um **QR Code** aparecerá no terminal.

1. Conecte seu smartphone na **mesma rede Wi-Fi** do computador.
2. Abra o aplicativo **Expo Go** no celular e escaneie o QR Code (ou use a câmera, caso seja um iPhone).
3. O aplicativo UrbanBook será compilado e aberto na tela do dispositivo, já integrado com o servidor e o banco de dados.

   
