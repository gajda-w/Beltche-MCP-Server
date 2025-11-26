# Beltche MCP Server - Setup Guide

## 🎯 Co zostało zaimplementowane

OAuth flow do autoryzacji użytkowników Beltche + pobieranie prawdziwych danych studentów.

### Tools:
1. **`authorize`** - Zwraca URL do autoryzacji OAuth
2. **`get_students`** - Pobiera listę studentów (wymaga `linkToken` po autoryzacji)

---

## 🔧 Setup krok po kroku

### 1. Pobierz credentials od kolegi

Poproś kolegę o utworzenie OAuth Application w FusionAuth z następującymi danymi:
- **Redirect URI**: `https://your-ngrok-url.ngrok-free.app/auth/callback` (zaktualizujesz po uruchomieniu ngrok)
- **Scope**: `openid profile email`

Otrzymasz:
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`

### 2. Uzupełnij `.env`

Edytuj plik `.env` i wklej otrzymane wartości:

```env
OAUTH_CLIENT_ID=twoj-client-id-z-fusionauth
OAUTH_CLIENT_SECRET=twoj-client-secret-z-fusionauth
OAUTH_AUTHORIZE_URL=https://auth.beltche.com/oauth2/authorize
OAUTH_TOKEN_URL=https://auth.beltche.com/oauth2/token
OAUTH_REDIRECT_BASE=https://your-ngrok-url.ngrok-free.app
PORT=3000
```

### 3. Uruchom serwer lokalnie

```bash
npx tsx server.ts
```

### 4. Uruchom ngrok

W **nowym terminalu**:

```bash
ngrok http 3000
```

Skopiuj URL typu: `https://xxxx-xx-xx.ngrok-free.app`

### 5. Zaktualizuj `.env` i FusionAuth

1. W `.env` zmień `OAUTH_REDIRECT_BASE` na Twój ngrok URL
2. Poproś kolegę o zaktualizowanie Redirect URI w FusionAuth na: `https://twoj-ngrok-url.ngrok-free.app/auth/callback`
3. **Zrestartuj serwer** (`Ctrl+C` i ponownie `npx tsx server.ts`)

### 6. Połącz z ChatGPT

1. W ChatGPT otwórz konfigurację MCP servers
2. Dodaj nowy server z URL: `https://twoj-ngrok-url.ngrok-free.app/mcp`

---

## 📱 Testowanie flow

### Krok 1: Autoryzacja

W ChatGPT napisz:
```
Call the authorize tool
```

ChatGPT poprosi o pozwolenie (kliknij **Confirm**). Otrzymasz:
- `linkToken` (np. `a1b2c3d4-e5f6-...`)
- `authUrl` (link do logowania)

### Krok 2: Zaloguj się

1. **Kliknij w `authUrl`** (otworzy przeglądarkę)
2. Zaloguj się na konto admina Beltche
3. Po zalogowaniu zostaniesz przekierowany z powrotem - zobaczysz "✅ Authorization Complete"

### Krok 3: Pobierz studentów

W ChatGPT napisz:
```
Get my students using linkToken: a1b2c3d4-e5f6-...
```

(Podstaw swój prawdziwy `linkToken`)

ChatGPT wywoła `get_students` i zwróci listę Twoich prawdziwych studentów z Beltche! 🎉

---

## 🔍 Debugging

### Logi serwera
Wszystkie requesty są logowane w terminalu gdzie uruchomiłeś `npx tsx server.ts`

### Sprawdź czy token został zapisany
Po autoryzacji w logach zobaczysz:
```
✅ Authorization successful for linkToken: xxxx-xxxx-xxxx
```

### Błędy OAuth
- **401/403**: Client ID/Secret niepoprawne
- **Redirect URI mismatch**: Zaktualizuj w FusionAuth
- **No token**: Użytkownik nie dokończył autoryzacji

---

## 🚀 Co dalej?

Możesz dodać więcej tools:
- `get_trainings` - lista treningów
- `add_student` - dodawanie studentów
- `update_belt` - zmiana pasa studenta

Każdy tool będzie używał tego samego tokenu z `tokenStore.get(linkToken)`.

---

## 🔒 Security Notes

⚠️ **Development only** - obecna implementacja używa in-memory storage dla tokenów. W produkcji:
- Użyj bazy danych (PostgreSQL, Redis)
- Zaszyfruj tokeny (AES-256)
- Ogranicz lifetime linkToken
- Implementuj refresh token flow
- Dodaj rate limiting
- Używaj HTTPS zawsze (ngrok zapewnia to w dev)
