# BETE - A Caçadora de Notícias

**BETE (BETMGM Feed Intelligence)** é um agregador de notícias inteligente projetado para fornecer insights cruciais sobre o mercado de iGaming e apostas esportivas no Brasil. A aplicação utiliza o poder da API do Google Gemini para analisar, classificar e resumir artigos de dezenas de fontes de notícias em tempo real, transformando um mar de informações em inteligência acionável.

---

## ✨ Funcionalidades Principais

*   **Acesso Seguro e Restrito:** A plataforma é protegida por um sistema de login (via Supabase Auth), garantindo que apenas usuários autorizados com e-mails `@betmgm.com.br` e `@artplan.com.br` possam acessar os dados.
*   **Agregação Inteligente de RSS:** Coleta notícias de mais de 50 fontes de notícias pré-configuradas, incluindo portais de iGaming, notícias de esportes, finanças e fontes governamentais.
*   **Classificação com IA (Gemini):**
    *   **Filtragem Automática:** Descarta automaticamente artigos irrelevantes ou em idiomas estrangeiros.
    *   **Análise de Relevância:** Classifica cada notícia como `High`, `Medium` ou `Low` com base em critérios de negócios pré-definidos.
    *   **Rastreamento de Concorrentes:** Identifica e marca menções dos principais concorrentes do mercado.
*   **Painel de Controle Avançado:**
    *   **Filtros Dinâmicos:** Filtre notícias por fonte, período, nível de relevância, palavras-chave e menções a concorrentes.
    *   **Carregamento Progressivo:** Veja os resultados aparecerem em tempo real à medida que a IA processa as fontes, uma a uma.
    *   **Exportação para CSV:** Exporte facilmente a lista de notícias filtrada para análise offline.
*   **Chatbot Integrado com Gemini:**
    *   **Análise de Artigos:** Peça resumos e análises aprofundadas de qualquer notícia com um único clique.
    *   **Múltiplos Modos de IA:** Alterne entre modos para obter respostas rápidas (`Flash`), respostas baseadas em buscas na web (`Grounded`) ou raciocínio complexo (`Thinking`).
*   **Interface Responsiva:** O design limpo e moderno se adapta perfeitamente a desktops, tablets e dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Backend & Auth:** Supabase
*   **Inteligência Artificial:** Google Gemini API
    *   **`gemini-2.5-flash-lite`**: Usado para a classificação de artigos em alta velocidade e para os modos de chat "Flash" e "Grounded".
    *   **`gemini-2.5-pro`**: Usado para o modo de chat "Thinking", que exige raciocínio complexo.

---

## 🚀 Como Executar o Projeto

A aplicação é projetada para ser executada diretamente no navegador sem a necessidade de um processo de build complexo.

### Pré-requisitos

1.  **Chave de API do Google Gemini:** Você precisa de uma chave de API válida para o Google Gemini.
2.  **Credenciais Supabase:** Você precisará da URL do projeto e da chave anônima (anon key) do seu projeto Supabase.
3.  **Navegador Moderno:** Qualquer navegador atual como Chrome, Firefox, Safari ou Edge.

### Configuração e Acesso

1.  **Chave de API Gemini:** A aplicação espera que a chave da API do Gemini esteja disponível como uma variável de ambiente chamada `process.env.API_KEY`. Em ambientes de desenvolvimento como o AI Studio, esta variável é injetada automaticamente.
2.  **Configuração Supabase:** As credenciais do Supabase (URL e chave anônima) devem ser inseridas no arquivo `services/supabase.ts`.

3.  **Acesso à Aplicação:**
    *   Ao abrir a aplicação, você será apresentado a uma página de login.
    *   **Para criar uma nova conta, você DEVE usar um endereço de e-mail dos domínios permitidos: `@artplan.com.br` ou `@betmgm.com.br`.**
    *   Após o registro, você precisará confirmar seu endereço de e-mail clicando no link enviado para sua caixa de entrada.
    *   Após a confirmação, utilize suas credenciais para fazer o login e acessar o painel de inteligência.

---

## ⚙️ Configuração do Supabase (Opcional, para Dados de Usuário)

Para armazenar informações adicionais do usuário (como o nome completo), é recomendado criar uma tabela `users` no seu projeto Supabase e uma função para sincronizar novos usuários.

**1. Crie a tabela `users`:**
Execute o seguinte comando no Editor SQL do seu projeto Supabase.
```sql
-- Cria a tabela para armazenar os perfis dos usuários
create table public.users (
  id uuid not null references auth.users on delete cascade,
  name text,
  email text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Habilita a segurança em nível de linha
alter table public.users enable row level security;
```

**2. Crie uma Função e um Trigger:**
Execute este SQL para criar uma função que insere automaticamente um novo perfil quando um novo usuário se inscreve.

```sql
-- Função para criar um perfil para um novo usuário
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  return new;
end;
$$;

-- Trigger para executar a função a cada novo usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
