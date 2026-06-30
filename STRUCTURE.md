# Struktur von `~/opencode-clean`

Eigenständiges OpenCode-Setup, kuratiert aus ECC — **ohne** Abhängigkeit zum ECC-Repo.
Alle Pfade in der Config sind relativ → der Ordner ist kopier-/versionierbar.

> Hinweis: Der eigentliche Inhalt steckt im **versteckten** Ordner `.opencode/`.
> Sichtbar machen: Finder `Cmd+Shift+.` · Terminal `ls -R .opencode`

## Verzeichnisbaum

```
~/opencode-clean/
├── README.md                     # Kurzanleitung
├── STRUCTURE.md                  # diese Datei
└── .opencode/                    # (versteckt) das gesamte Setup
    ├── opencode.json             # ⭐ ZENTRALE CONFIG: Provider, Modelle, Agents, Commands
    ├── prompts/agents/           # die System-Prompts der Agents (als Datei)
    │   ├── planner.txt
    │   ├── code-reviewer.txt
    │   ├── security-reviewer.txt
    │   ├── build-error-resolver.txt
    │   ├── tdd-guide.txt
    │   ├── gan-planner.md
    │   ├── gan-generator.md
    │   └── gan-evaluator.md
    ├── commands/                 # die Templates der Slash-Commands
    │   ├── plan.md   code-review.md   security.md   build-fix.md   tdd.md
    │   └── gan-build.md   gan-design.md
    └── skills/                   # always-on Instructions
        ├── tdd-workflow/SKILL.md
        ├── security-review/SKILL.md
        └── coding-standards/SKILL.md
```

## Wie ein Agent zusammengesetzt ist

Ein Agent besteht aus **zwei Teilen** (es gibt KEINEN `agents/`-Ordner — der würde von
OpenCode auto-gescannt und mit Claude-Code-Frontmatter das Schema sprengen):

| Teil | Ort | Beispiel |
|------|-----|----------|
| Definition (Name, Modell, Tools, mode) | `opencode.json` → `agent: {}` | siehe unten |
| Prompt (Inhalt) | `prompts/agents/<name>.{txt,md}` | via `{file:...}` referenziert |

```jsonc
// in .opencode/opencode.json
"gan-planner": {
  "mode": "all",                              // primär UND als Subagent nutzbar
  "model": "ollama/glm-5.2:cloud",
  "prompt": "{file:prompts/agents/gan-planner.md}",
  "tools": { "read": true, "write": true, "edit": true, "bash": true }
}
```

## Agents & Modell-Routing

| Agent | Modell | Zweck |
|-------|--------|-------|
| build (primary) | MLX-Coder | Standard-Coding |
| planner | glm-5.2:cloud | Implementierungspläne |
| code-reviewer | glm-5.2:cloud | Code-Review |
| security-reviewer | glm-5.2:cloud | Security |
| build-error-resolver | MLX-Coder | Build-/Typ-Fehler fixen |
| tdd-guide | MLX-Coder | TDD-Workflow |
| gan-planner | glm-5.2:cloud | Brief → spec.md + eval-rubric.md |
| gan-generator | MLX-Coder | baut nach Spec, iteriert |
| gan-evaluator | glm-5.2:cloud | testet & bewertet |

`small_model` (Titel/Zusammenfassungen): `ollama/llama3.2`

## Commands

| Command | ruft Agent | Modus |
|---------|-----------|-------|
| `/plan` | planner | subtask |
| `/code-review` | code-reviewer | subtask |
| `/security` | security-reviewer | subtask |
| `/build-fix` | build-error-resolver | subtask |
| `/tdd` | tdd-guide | subtask |
| `/gan-build` | (Hauptagent orchestriert) | primär |
| `/gan-design` | (Hauptagent orchestriert) | primär |
| `/gan-plan` | gan-planner | subtask (nur Spec, kein Build) |

## Nutzung

```bash
cd ~/opencode-clean && opencode
```

GAN Plan→Review→Build:
```bash
opencode run --command gan-plan  "Brief: <idee>"                     # 1) nur Spec
#   gan-harness/spec.md prüfen/korrigieren                            # 2) Review
opencode run --command gan-build "Brief: <idee> --skip-planner --eval-mode code-only"  # 3) bauen
```

## Etwas Neues aus ECC übernehmen

1. Prompt-Datei kopieren → `.opencode/prompts/agents/<name>.md`
   (NIEMALS nach `.opencode/agents/` — das crasht das Schema)
2. In `.opencode/opencode.json` einen `agent`-Eintrag mit `"prompt": "{file:prompts/agents/<name>.md}"` ergänzen
3. Optional einen `command`-Eintrag dazu
4. Testen: `cd ~/opencode-clean && opencode agent list`
```
