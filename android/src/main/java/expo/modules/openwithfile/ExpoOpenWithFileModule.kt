package expo.modules.openwithfile

import android.net.Uri
import android.provider.OpenableColumns

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoOpenWithFileModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoOpenWithFile")
    AsyncFunction("readFile") { path: String ->
      return@AsyncFunction true
    }
    AsyncFunction("getFileName") { path: String ->
      val uri = Uri.parse(path)
      val contentResolver = appContext.reactContext?.contentResolver

      if (contentResolver != null) {
        val cursor = contentResolver.query(uri, null, null, null, null)

        cursor?.use {
          val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
          if (nameIndex >= 0 && it.moveToFirst()) {
            val fileName = it.getString(nameIndex)
            return@AsyncFunction fileName
          }
        }
      }

      return@AsyncFunction "undefined"
    }
  }
}