# Guia de Migração para Firebase

Este guia descreve os passos para migrar a aplicação de `localStorage` para Firebase.

## 1. Habilitar Firebase (Blaze Plan)
- Acesse o Console do Firebase.
- Habilite o plano **Blaze** (pago conforme o uso) para permitir o deploy de Cloud Functions.

## 2. Configurar Firebase
- Substitua o conteúdo de `src/firebase-applet-config.json` com as credenciais do seu projeto Firebase.

## 3. Deploy das Cloud Functions
- Instale o Firebase CLI: `npm install -g firebase-tools`
- Faça login: `firebase login`
- Inicialize: `firebase init functions`
- Copie o código de `functions/index.ts` para `functions/src/index.ts`.
- Deploy: `firebase deploy --only functions`

## 4. Migração de Dados
- Configure `serviceAccountKey.json` com as credenciais de administrador do seu projeto Firebase.
- Execute o script de migração: `node script_migracao.js` (remova o comentário da última linha para executar).

## 5. Rollback
- Para reverter, restaure os arquivos originais e remova a dependência do Firebase.
