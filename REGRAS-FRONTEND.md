# REGRAS-FRONTEND — Moov

Regras de ouro do frontend. Detalhe completo em [`SYSTEM-DESIGN.md`](./SYSTEM-DESIGN.md). Leia antes de codar tela.

1. **Nunca hardcode cor/tamanho/raio.** Use as CSS vars de `src/index.css` (`--accent`, `--navy`, `--s-lg`, `--r-lg`…). Fonte: SYSTEM-DESIGN §1–4.
2. **Azul manda.** Saldos, ação primária e destaques em `--accent`/gradiente. Positivo/negativo (`--positive`/`--negative`) são discretos. Nada de verde como cor de marca (era do Organizze original).
3. **Profundidade só nos heróis.** Gradiente+glow+sombra apenas no card de Saldo, botão primário e FAB. O resto: card branco plano, sombra leve. SYSTEM-DESIGN §2.
4. **Dinheiro sempre em centavos** no estado/DB; formatação só via `formatBRL()` (`src/lib/format.ts`). Números com `tabular-nums`.
5. **4 abas, não 5.** Home · Fluxo · Relatórios · Perfil. "Limites de Gastos" foi REMOVIDO (PRD). Não recriar.
6. **Mobile-first + desktop.** Barra inferior no celular, sidebar no desktop, via mesmo `AppShell`. Testar nos dois extremos.
7. **Todos os estados.** hover · focus-visible (anel `--glow`) · active · disabled · loading · empty · error. Empty state com tom amigável (ex.: "Nenhum lançamento no período"). SYSTEM-DESIGN §7.
8. **Movimento com intenção.** 300ms nas transições, escala 0.96 no toque; honrar `prefers-reduced-motion`. SYSTEM-DESIGN §5.
9. **Acesso a dados só via camada Supabase** (`src/lib/db.ts` / hooks). Nunca montar query solta dentro de JSX de tela. RLS garante isolamento por usuário — sempre confiar no `user_id` do auth, nunca filtrar manualmente por usuário no client como única proteção.
10. **pt-BR em tudo.** Textos, R$, datas (`pt-BR`).
11. **Não inventar funcionalidade fora do PRD.** Exceção: pedido explícito do Saulo. Lacunas 🔴 do SYSTEM-DESIGN §9 = perguntar, não improvisar.
