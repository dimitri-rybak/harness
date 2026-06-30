# opencode-clean

Eigenständiges, kuratiertes OpenCode-Setup — herausgelöst aus ECC, ohne Abhängigkeit zum ECC-Repo.

## Nutzung
    cd ~/opencode-clean && opencode

## Enthalten
- **Kern-Agents**: planner, code-reviewer, security-reviewer, build-error-resolver, tdd-guide
- **GAN-Pipeline**: gan-planner / gan-generator / gan-evaluator
- **Commands**: /plan /code-review /security /build-fix /tdd /gan-build /gan-design /gan-plan
- **Skills (instructions)**: tdd-workflow, security-review, coding-standards
- **Modell-Routing**: MLX-Coder (Bauen) · glm-5.2:cloud (Reasoning/Review) · llama3.2 (small)
- **Provider**: mlx + ollama (eingebettet → portabel)

## GAN: Plan-Review-Build
    opencode run --command gan-plan "Brief: <idee>"     # nur Spec, dann stoppen
    # gan-harness/spec.md prüfen/korrigieren
    opencode run --command gan-build "Brief: <idee> --skip-planner --eval-mode code-only"

Alle Pfade in .opencode/opencode.json sind relativ → Ordner ist kopier-/versionierbar.
