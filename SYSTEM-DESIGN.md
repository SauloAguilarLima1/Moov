# SYSTEM-DESIGN — Moov

> Fonte da verdade visual/funcional do frontend do **Moov** (app de finanças pessoais, web, multiusuário).
> Destilado das **referências fornecidas** (9 prints do app Organizze) + dos documentos do projeto
> (`PRD.md`, `DESIGN_SYSTEM.md`). Cada seção traz um selo de confiança:
> 🟢 Extraído (visto na fonte) · 🟡 Inferido (deduzido, com origem) · 🔴 Lacuna (a decidir).

## 0. Essência (a "alma" do produto)

A referência (Organizze) é um app de finanças **limpo, denso de informação porém calmo**: cards brancos
sobre fundo neutro, um header colorido de marca, listas conta→valor muito legíveis, e UMA cor de marca
forte guiando a atenção. O PRD pede **manter essa estrutura** e trocar a pele verde por uma identidade
**azul marinho premium** (gradiente + glow + profundidade).

Princípios acionáveis (reproduzem o sentimento mesmo numa tela nova):
1. **Clareza acima de enfeite.** Cada tela responde "quanto eu tenho / quanto entrou / quanto saiu" em < 2s.
2. **Azul manda na hierarquia.** Saldos, ações primárias e destaques em azul; positivo/negativo discretos.
3. **Profundidade premium, não barulho.** Gradiente, glow e sombra suave só nos elementos-herói (saldo, FAB, botão primário). O resto é plano e branco.
4. **Ritmo e respiro.** Cards arredondados, espaçamento generoso, tipografia Inter com hierarquia clara.
5. **Mobile-first, desktop confortável.** Mesma informação, layout que se adapta (nav inferior no celular, lateral no desktop).

## 1. Cores (tokens) — 🟢 (do PRD/DESIGN_SYSTEM)

| Token              | Hex        | Uso                                                   |
|--------------------|------------|-------------------------------------------------------|
| `--navy`           | `#081F4D`  | Fundo escuro, header da marca, base                   |
| `--premium`        | `#123D91`  | Fim do gradiente, superfícies escuras                 |
| `--accent`         | `#1E5EFF`  | Cor primária, FAB, destaques, início do gradiente     |
| `--glow`           | `#4D7CFF`  | Bordas iluminadas, brilho, foco                       |
| `--white`          | `#FFFFFF`  | Cards claros, texto sobre escuro                      |
| `--gray-bg`        | `#F5F7FA`  | Fundo de tela (light)                                 |
| `--gray-text`      | `#6E7582`  | Texto secundário, legendas                            |
| `--ink`            | `#0E1726`  | 🟡 Texto principal sobre claro (inferido p/ contraste AA) |

Semânticas (discretas, secundárias ao azul) — 🟡 inferidas dos prints (valores em verde/vermelho):
| `--positive` | `#1FB97A` | Entradas/receitas, saldos positivos |
| `--negative` | `#E5484D` | Saídas/despesas |
| `--surface-muted` | `#EEF1F6` | Faixas/realces neutros (ex.: linha "disponível" do cartão) |

## 2. Gradiente e elevação premium — 🟢 (PRD)

- **Gradiente premium:** `linear-gradient(180deg, #1E5EFF 0%, #123D91 100%)`. Usado no card de saldo (herói), botão primário e header.
- **Glow de foco/herói:** `box-shadow: 0 0 20px rgba(77,124,255,0.25)`.
- **Sombra de card (repouso):** `0 6px 20px rgba(8,31,77,0.06)`. Hover (desktop): `0 10px 28px rgba(8,31,77,0.10)`.

## 3. Tipografia — 🟢 (DESIGN_SYSTEM) / 🟡 escala fina

- Família: **Inter** (Google Fonts), fallback system-ui.
- Escala: `display` ~32/700 (saldo) · `h1` ~22/700 · `section` ~16/600 · `body` ~14/500 · `caption` ~12/500 (`--gray-text`).
- Números monetários sempre **tabular** (`font-variant-numeric: tabular-nums`).

## 4. Espaçamento, raios — 🟢 (DESIGN_SYSTEM)

- Escala base 4: `--s-xs:4 · sm:8 · md:12 · lg:16 · xl:24 · xxl:32`.
- Raios: `--r-sm:12 · md:16 · lg:20 · pill:999`. Cards: 20. Botão: 16.

## 5. Movimento — 🟢 (DESIGN_SYSTEM/PRD)

- Navegação/transições: ~300ms, `cubic-bezier(0.22,1,0.36,1)` (easeOutCubic-like).
- Toque em botão: escala `0.96` + glow, 120–150ms.
- Hover de card (desktop): elevação suave.
- Respeitar `prefers-reduced-motion`.

## 6. Componentes (anatomia) — 🟢 estrutura dos prints / 🟡 pele azul

- **Header da tela:** faixa em gradiente/`--navy`; saudação "Boa tarde, {nome}" + ação à direita (ex.: sincronizar). No app: título centralizado nas telas internas.
- **Card herói "Saldo geral":** rótulo `caption`, valor `display`, botão "Ver detalhes" + olho para ocultar. Fundo gradiente premium.
- **Card de lista (conta/cartão):** ícone circular à esquerda · nome (`section`) + subtítulo (`caption`) · valor à direita (azul/positivo). Linha divisória sutil entre itens. Botão outline "Gerenciar contas/cartões" no rodapé do card.
- **Item de movimentação (fluxo):** ícone categórico · descrição + conta · valor com sinal + status ("não recebido"/"recebido").
- **Rodapé-resumo (fluxo):** 3 colunas Entradas · Saídas · Saldo, fixo na base.
- **Tabs (relatórios):** Categorias · Balanço · Tags; indicador sublinhado na ativa.
- **FAB:** círculo `--accent`, canto inferior direito; expande em Nova receita · Nova despesa · Transferência. (No print original o FAB é vermelho; aqui segue a marca azul, conforme PRD.)
- **Navegação:** mobile = barra inferior com 5 ícones → **aqui 4** (Home, Fluxo, Relatórios, Perfil; "Limites de Gastos" REMOVIDO por PRD). Desktop = sidebar vertical com os mesmos itens.
- **Botão primário:** gradiente premium, borda `1px --glow`, raio 16, sombra glow; estados hover/active/disabled/loading.
- **Inputs/MoneyInput:** campo claro, foco com borda `--accent` + halo `--glow`; dinheiro formatado `R$ #.###,##`, armazenado em centavos.

## 7. Estados e acessibilidade (barra de craft) — 🟡 elevação sobre a referência

Para TODO componente interativo: `hover` · `focus-visible` (anel `--glow` visível) · `active` · `disabled` · `loading` · `empty` · `error`.
- Empty states com mensagem amigável (a referência usa "Não há dados disponíveis no período" — replicar o tom).
- Contraste AA+ (texto sobre gradiente usa branco; cuidado com `--gray-text` sobre branco — ok).
- Toque mínimo 44px. Navegação por teclado em modais e tabs.

## 8. Telas (mapa) — 🟢 (PRD + prints)

1. **Landing / Auth** (`/`) — herói da marca + tabs **Entrar / Criar conta** (e-mail+senha, Supabase). 🔴 cópia/headline do herói a definir (proposta aplicada: "Suas finanças, em movimento.").
2. **Dashboard** (`/app`) — saudação, Saldo geral (herói), Minhas contas, Meus cartões, FAB.
3. **Fluxo de Caixa** (`/app/cashflow`) — navegação mensal `‹ Maio | Junho | Julho ›`, lista de lançamentos, rodapé Entradas/Saídas/Saldo.
4. **Relatórios** (`/app/reports`) — tabs Categorias (rosca) · Balanço (barras) · Tags (ranking).
5. **Perfil** (`/app/profile`) — avatar+nome, Editar perfil, cards Configure (Contas, Cartões, Categorias, Tags), Sair.

## 9. Lacunas (🔴 — dependem de decisão)

- Headline/copy da landing (proposta aplicada; ajustável).
- Confirmação de e-mail no cadastro: padrão Supabase = exige confirmar e-mail (configurável no painel). O fluxo trata ambos os casos.
- Open Finance / sincronização bancária: **fora do MVP** (no PRD aparece como conceito; não há backend de Open Finance). Botão pode ficar oculto/"em breve".
- Backup (JSON/CSV): previsto no PRD; entra como exportação simples de transações no Perfil (pós-MVP se faltar tempo).
