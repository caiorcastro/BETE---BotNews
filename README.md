# BETE - A Caçadora de Notícias

**BETE (BETMGM Feed Intelligence)** é um agregador de notícias inteligente projetado para fornecer insights cruciais sobre o mercado de iGaming e apostas esportivas no Brasil. A aplicação utiliza o poder da API do Google Gemini para analisar, classificar e resumir artigos de dezenas de fontes de notícias em tempo real, transformando um mar de informações em inteligência acionável.

---

## ✨ Funcionalidades Principais

*   **Acesso Seguro e Restrito:** A plataforma é protegida por um sistema de login (via Supabase Auth), garantindo que apenas usuários autorizados com e-mails `@betmgm.com.br` e `@artplan.com.br` possam acessar os dados.
*   **Busca em Tempo Real:** Ao logar ou clicar em "Atualizar Fontes", a aplicação busca, processa e classifica as notícias mais recentes diretamente no seu navegador. Os dados são sempre ao vivo, garantindo que você tenha as informações mais atuais.
*   **Classificação com IA (Gemini):**
    *   **Análise de Relevância:** Classifica cada notícia como `High`, `Medium` ou `Low`.
    *   **Rastreamento de Concorrentes:** Identifica e marca menções dos principais concorrentes do mercado.
*   **Painel de Controle Avançado:**
    *   **Filtros Dinâmicos:** Filtre notícias por fonte, período, relevância, palavras-chave e concorrentes.
    *   **Exportação para CSV:** Exporte facilmente a lista de notícias filtrada para análise offline.
*   **Chatbot Integrado com Gemini:**
    *   **Análise de Artigos:** Peça resumos e análises aprofundadas de qualquer notícia.
    *   **Múltiplos Modos de IA:** Alterne entre modos para respostas rápidas (`Flash`), baseadas em buscas na web (`Grounded`) ou com raciocínio complexo (`Thinking`).

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Backend & Auth:** Supabase (Auth, Database for user profiles)
*   **Inteligência Artificial:** Google Gemini API
    *   **`gemini-2.5-flash`**: Usado para a classificação de artigos e para os modos de chat "Flash" e "Grounded".
    *   **`gemini-2.5-pro`**: Usado para o modo de chat "Thinking".

---

## 🚀 Como Executar o Projeto

A aplicação é executada 100% no navegador, mas requer uma configuração no Supabase para gerenciar os usuários. **As notícias não são salvas no banco de dados.**

### Pré-requisitos

1.  **Chave de API do Google Gemini:** Você precisa de uma chave de API válida.
2.  **Conta no Supabase:** Você precisará de um projeto Supabase configurado.

### 1. Configuração do Frontend

1.  **Chave de API Gemini:** A aplicação espera que a chave da API esteja disponível como uma variável de ambiente `process.env.API_KEY`. Em ambientes como o AI Studio, esta variável é injetada automaticamente.
2.  **Credenciais Supabase:** As credenciais do seu projeto Supabase (URL e chave anônima) já estão configuradas em `services/supabase.ts`.

### 2. Configuração do Banco de Dados Supabase (Obrigatório)

Siga os passos abaixo no seu painel do Supabase. Vá para o **SQL Editor** e execute o script a seguir. Este script cria a tabela `profiles` para armazenar informações dos usuários (como o nome) e um `trigger` que a preenche automaticamente sempre que um novo usuário se cadastra.

```sql
-- Cria a tabela para os perfis públicos dos usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT
);

-- Habilita a segurança em nível de linha (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Define as políticas de acesso para a tabela de perfis
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Este trigger cria automaticamente um perfil quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'email');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa o trigger ao evento de criação de usuário no Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

Com essa configuração, a aplicação está pronta para ser usada.