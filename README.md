
# expo-open-with-file

Allow users to open your expo iOS / Android app when selecting files in other apps.

## Install

```
npx expo install expo-open-with-file
```

## Basic setup

Add plugin in `app.json`, and run `expo prebuild`

```json
{
  "plugins": [
    [
      "expo-open-with-file",
      {
        "types": [
          {
            "extension": "dlc"
          }
        ]
      }
    ]
  ]
}
```

## Usage

  To access the file, use `useOpenWithFile`. This will give you some file info (if available, like size, uri...) and the contents of the file in `Base64`.

```typescript
export  default  function  App() {
	const { file } =  useOpenWithFile({ resetOnBackground:  true });

	useEffect(() => {
		if (file) {
			console.log('Info', JSON.stringify(file.info));
			console.log('Base64', JSON.stringify(file.base64));
		}
	}, [file]);

	return (
		<View  style={{ flex:  1, alignItems:  'center', justifyContent:  'center' }}>
			<Text>File: {file?.info.uri || 'none'}</Text>
		</View>
	);
}
```

 ## Optional configurations

You can provide extra properties for iOS to support opening documents in place. This will use the native module for requesting access to read the file.

```json
{
  "plugins": [
    [
      "expo-open-with-file",
      {
        "types": [
          {
            "extension": "dlc"
          }
        ],
        "custom": {
          "ios": {
	        "supportsDocumentBrowser": true,
	        "supportsFileSharingEnabled": true,
            "supportsOpeningDocumentsInPlace": true,
          }
        }
      }
    ]
  ]
}
```
| Prop | Default | Docs |
|  :----------------  |  :------:  |  ----:  |
| supportsDocumentBrowser | false | [# UISupportsDocumentBrowser](https://developer.apple.com/documentation/bundleresources/information_property_list/uisupportsdocumentbrowser) |
| supportsFileSharingEnabled | false | [# UIFileSharingEnabled](https://developer.apple.com/documentation/bundleresources/information_property_list/uifilesharingenabled) |
| supportsOpeningDocumentsInPlace | false | [# LSSupportsOpeningDocumentsInPlace](https://developer.apple.com/documentation/bundleresources/information_property_list/lssupportsopeningdocumentsinplace) |

 ## File type configurations

The plugin uses a default configuration to make set up easy. Lots of properties are configurable so you can customise for your use case.

```json
{
  "plugins": [
    [
      "expo-open-with-file",
      {
        "types": [
          {
            "extension": "dlc",
            "custom": {
              "ios": {
                "typeConformsTo": [
                  "public.data",
                  "public.item"
                ],
                "typeDescription": "DLC",
                "typeIdentifier": "com.example.dlc",
                "bundleTypeRole": "Editor",
                "handlerRank": "Owner"
              },
              "android": {
                "actions": [
                  "VIEW",
                  "EDIT"
                ],
                "categories": [
                  "BROWSABLE",
                  "DEFAULT"
                ],
                "mimeTypes": [
                  "application/dlc",
                  "application/octet-stream"
                ],
                "schemes": [
                  "file",
                  "content"
                ],
                "hosts": [],
                "pathPatterns": [
                  ".*\\\\.dlc",
                  ".*\\\\..*\\\\.dlc",
                  ".*\\\\..*\\\\..*\\\\.dlc"
                ]
              }
            }
          }
        ]
      }
    ]
  ]
}
```

 #### iOS custom props

| Prop | Default | Maps to |
|  :----------------  |  :------:  |  ----:  |
| typeConformsTo | `public.data` & `public.item` | UTTypeConformsTo |
| typeDescription | `extension.toUpperCase()` | UTTypeDescription |
| typeIdentifier | `com.${config.name}.${extension}.toLowerCase()` | UTTypeIdentifier |
| bundleTypeRole | `Editor` | CFBundleTypeRole |
| handlerRank | `Owner` | LSHandlerRank |

 #### Android custom props

| Prop | Default | Maps to |
|  :----------------  |  :------:  |  ----:  |
| actions | `VIEW` & `EDIT` | `android.intent.action.${action}` |
| categories | `BROWSABLE` & `DEFAULT` | `android.intent.category.${category}` |
| mimeTypes | `application/${extension}` & `application/octet-stream` | `android:mimeType` |
| schemes | `file` & `content` | `android:scheme` |
| hosts | `Empty (none)` | `android:host` |
| pathPatterns | `.*\\\\.${extension}` & `.*\\\\..*\\\\.${extension}` & `.*\\\\..*\\\\..*\\\\.${extension}` | `android:pathPattern` |

 #### Contributions

Please open a PR if you want to provide improvements / extra functionality! This is technically possible without the use of a custom plugin, but this is all about convenience and providing an out of the box solution. If you know how to make this better, please do.
