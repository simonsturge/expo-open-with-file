import ExpoModulesCore
import Foundation

public class ExpoOpenWithFileModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoOpenWithFile")
        
        Function("readFile", readFile)
    }
    
    private func readFile(path: String) -> String? {
        guard let url = URL(string: path) else { return nil }
        let accessGranted = url.startAccessingSecurityScopedResource()
        var contents: String? = nil;
        if accessGranted {
            if let data = try? Data(contentsOf: url) {
                contents = data.base64EncodedString()
            }
            url.stopAccessingSecurityScopedResource()
        }
        return contents;
    }
}
