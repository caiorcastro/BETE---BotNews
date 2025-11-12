# BETE - A Caçadora de Notícias

**BETE (BETMGM Feed Intelligence)** é um agregador de notícias inteligente projetado para fornecer insights cruciais sobre o mercado de iGaming e apostas esportivas no Brasil. A aplicação utiliza o poder da API do Google Gemini para analisar, classificar e resumir artigos de dezenas de fontes de notícias em tempo real, transformando um mar de informações em inteligência acionável.

---

## ✨ Funcionalidades Principais

*   **Acesso Seguro e Restrito:** A plataforma é protegida por um sistema de login, garantindo que apenas usuários autorizados com e-mails `@betmgm.com.br` e `@artplan.com.br` possam acessar os dados.
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
*   **Inteligência Artificial:** Google Gemini API
    *   **`gemini-2.5-flash-lite`**: Usado para a classificação de artigos em alta velocidade e para os modos de chat "Flash" e "Grounded".
    *   **`gemini-2.5-pro`**: Usado para o modo de chat "Thinking", que exige raciocínio complexo.

---

## 🚀 Como Executar o Projeto

A aplicação é projetada para ser executada diretamente no navegador sem a necessidade de um processo de build complexo.

### Pré-requisitos

1.  **Chave de API do Google Gemini:** Você precisa de uma chave de API válida para o Google Gemini.
2.  **Navegador Moderno:** Qualquer navegador atual como Chrome, Firefox, Safari ou Edge.

### Configuração e Acesso

1.  **Chave de API:** A aplicação espera que a chave da API do Gemini esteja disponível como uma variável de ambiente chamada `process.env.API_KEY`. Em ambientes de desenvolvimento como o AI Studio, esta variável é injetada automaticamente.

2.  **Acesso à Aplicação:**
    *   Ao abrir a aplicação, você será apresentado a uma página de login.
    *   **Para criar uma nova conta, você DEVE usar um endereço de e-mail dos domínios permitidos: `@artplan.com.br` ou `@betmgm.com.br`.**
    *   Após criar a conta, utilize suas credenciais para fazer o login e acessar o painel de inteligência.

3.  **Servidor Local (Opcional):** Embora você possa abrir o `index.html` diretamente, a melhor maneira de executar o projeto é através de um servidor local simples para evitar problemas com CORS (apesar de usarmos um proxy).
    *   Se você tiver o Node.js instalado, pode usar o `serve`:
        ```bash
        npx serve .
        ```
    *   Acesse o endereço fornecido (geralmente `http://localhost:3000`).

---

## ⚙️ Arquitetura e Funcionamento

1.  **`App.tsx`**: O componente principal que gerencia o estado de autenticação e atua como um roteador, exibindo a página de login ou o painel principal.
2.  **`components/LandingPage.tsx` e `components/Auth.tsx`**: Compõem a tela de entrada, explicando o produto e gerenciando o processo de login/registro com restrição de domínio.
3.  **`services/rssService.ts`**: Responsável por:
    *   Buscar o conteúdo dos feeds RSS através de um proxy CORS.
    *   Analisar o XML para extrair os dados brutos dos artigos.
    *   Orquestrar o processo de classificação, enviando os artigos para o `geminiService` de forma **sequencial e com pausas** para respeitar os limites de taxa da API.
4.  **`services/geminiService.ts`**: O cérebro da aplicação.
    *   **Classificação:** Envia os artigos brutos para o modelo `gemini-2.5-flash-lite` com um *system prompt* detalhado que instrui a IA sobre as regras de filtragem, classificação e formatação da saída em JSON.
    *   **Chatbot:** Gerencia a comunicação com a API Gemini para as funcionalidades do chat, selecionando o modelo apropriado para cada modo.
5.  **`constants.ts`**: Armazena dados estáticos, como a lista inicial de feeds RSS (`INITIAL_FEEDS`) e a lista de concorrentes (`COMPETITOR_LIST`).
6.  **`components/`**: Contém todos os componentes reutilizáveis da interface, como a lista de artigos, os controles de filtro e o chatbot.
