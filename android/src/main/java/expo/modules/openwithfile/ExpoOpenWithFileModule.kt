package expo.modules.openwithfile

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoOpenWithFileModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoOpenWithFile")
    AsyncFunction("readFile") { path: String ->
      return@AsyncFunction true
    }
  }
}