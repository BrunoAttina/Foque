import ExpoModulesCore

// iOS ainda não diferencia bloqueio de tela de sair do app (pendente; ver
// Documentacao/decisoes.md). Retorna "suportado: false" e o app mantém o
// comportamento antigo: ir para segundo plano cancela a sessão.
public class FocoTelaModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FocoTela")

    Function("estado") { () -> [String: Any] in
      return [
        "suportado": false,
        "telaAcesa": true,
        "bloqueada": false,
        "telaDesligadaEm": 0,
        "desbloqueadoEm": 0
      ]
    }
  }
}
