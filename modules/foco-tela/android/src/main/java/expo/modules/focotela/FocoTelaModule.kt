package expo.modules.focotela

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Diferencia "bloqueou a tela" de "saiu do app" durante uma sessão de foco.
 *
 * O AppState do React Native fica "background" nos dois casos. Aqui ouvimos os
 * avisos do sistema (tela apagou, celular desbloqueado) e expomos o estado da tela
 * para o JavaScript decidir se cancela a sessão.
 */
class FocoTelaModule : Module() {
  @Volatile private var telaDesligadaEm: Long = 0
  @Volatile private var desbloqueadoEm: Long = 0
  private var receptor: BroadcastReceiver? = null

  private val contexto: Context?
    get() = appContext.reactContext?.applicationContext

  override fun definition() = ModuleDefinition {
    Name("FocoTela")

    OnCreate {
      val ctx = contexto ?: return@OnCreate
      val novoReceptor = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
          when (intent?.action) {
            Intent.ACTION_SCREEN_OFF -> telaDesligadaEm = System.currentTimeMillis()
            Intent.ACTION_USER_PRESENT -> desbloqueadoEm = System.currentTimeMillis()
          }
        }
      }
      val filtro = IntentFilter().apply {
        addAction(Intent.ACTION_SCREEN_OFF)
        addAction(Intent.ACTION_USER_PRESENT)
      }
      // São avisos do sistema: chegam mesmo com o receptor não exportado.
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ctx.registerReceiver(novoReceptor, filtro, Context.RECEIVER_NOT_EXPORTED)
      } else {
        ctx.registerReceiver(novoReceptor, filtro)
      }
      receptor = novoReceptor
    }

    OnDestroy {
      val ctx = contexto
      val atual = receptor
      if (ctx != null && atual != null) {
        try {
          ctx.unregisterReceiver(atual)
        } catch (_: IllegalArgumentException) {
          // Já removido.
        }
      }
      receptor = null
    }

    /**
     * telaAcesa: a tela está ligada e interativa.
     * bloqueada: a tela de bloqueio está ativa.
     * telaDesligadaEm / desbloqueadoEm: horários (ms) dos últimos avisos; 0 se nunca.
     */
    Function("estado") {
      val ctx = contexto
      val power = ctx?.getSystemService(Context.POWER_SERVICE) as? PowerManager
      val keyguard = ctx?.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
      return@Function mapOf(
        "suportado" to true,
        "telaAcesa" to (power?.isInteractive ?: true),
        "bloqueada" to (keyguard?.isKeyguardLocked ?: false),
        "telaDesligadaEm" to telaDesligadaEm.toDouble(),
        "desbloqueadoEm" to desbloqueadoEm.toDouble()
      )
    }
  }
}
