import {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  ConfigPlugin,
} from 'expo/config-plugins';

const { getMainActivityOrThrow } = AndroidConfig.Manifest;

type TypeDeclaration = {
  extension: string;
  custom?: {
    ios?: {
      typeConformsTo?: string[];
      typeDescription?: string;
      typeIdentifier?: string;
      bundleTypeRole?: string;
      handlerRank?: string;
    };
    android?: {
      actions?: string[];
      categories?: string[];
      mimeTypes?: string[];
      schemes?: string[];
      hosts?: string[];
      pathPatterns?: string[];
    };
  };
};

type Props = {
  types: TypeDeclaration[];
  custom?: {
    ios?: {
      supportsDocumentBrowser?: boolean;
      supportsFileSharingEnabled?: boolean;
      supportsOpeningDocumentsInPlace?: boolean;
    };
  };
};

const withOpenWithFile: ConfigPlugin<Props> = (config, { types, custom }) => {
  config = withInfoPlist(config, config => {
    const exportedTypeDeclarations = types.map(type => {
      return {
        UTTypeConformsTo: type.custom?.ios?.typeConformsTo ?? [
          'public.data',
          'public.item',
        ],
        UTTypeDescription:
          type.custom?.ios?.typeDescription ?? type.extension.toUpperCase(),
        UTTypeIdentifier:
          type.custom?.ios?.typeIdentifier ??
          `com.${config.name}.${type.extension}`.toLowerCase(),
        UTTypeTagSpecification: {
          'public.filename-extension': [
            type.extension.toLowerCase(),
            type.extension.toUpperCase(),
          ],
        },
      };
    });
    const documentTypes = types.map(type => {
      return {
        CFBundleTypeName: type.extension.toUpperCase(),
        CFBundleTypeRole: type.custom?.ios?.bundleTypeRole ?? 'Editor',
        LSHandlerRank: type.custom?.ios?.handlerRank ?? 'Owner',
        LSItemContentTypes: [
          `com.${config.name}.${type.extension}`.toLowerCase(),
        ],
      };
    });
    config.modResults['UTExportedTypeDeclarations'] = exportedTypeDeclarations;
    config.modResults['CFBundleDocumentTypes'] = documentTypes;
    config.modResults['UIFileSharingEnabled'] =
      custom?.ios?.supportsFileSharingEnabled ?? false;
    config.modResults['UISupportsDocumentBrowser'] =
      custom?.ios?.supportsDocumentBrowser ?? false;
    config.modResults['LSSupportsOpeningDocumentsInPlace'] =
      custom?.ios?.supportsOpeningDocumentsInPlace ?? false;
    return config;
  });

  config = withAndroidManifest(config, config => {
    const mainActivity = getMainActivityOrThrow(config.modResults);
    const intentFilters = mainActivity['intent-filter'] || [];

    const newIntentFilters = types.map(type => {
      const actions = type.custom?.android?.actions ?? ['VIEW', 'EDIT'];
      const categories = type.custom?.android?.categories ?? [
        'BROWSABLE',
        'DEFAULT',
      ];
      const mimeTypes = type.custom?.android?.mimeTypes ?? [
        `application/${type.extension}`,
        'application/octet-stream',
      ];
      const schemes = type.custom?.android?.schemes ?? ['file', 'content'];
      const hosts = type.custom?.android?.hosts ?? [];
      const pathPatterns = type.custom?.android?.pathPatterns ?? [
        `.*\\\\.${type.extension}`,
        `.*\\\\..*\\\\.${type.extension}`,
        `.*\\\\..*\\\\..*\\\\.${type.extension}`,
      ];
      const data: { $: { [key: string]: string } }[] = [];
      schemes.forEach(scheme => {
        data.push({ $: { 'android:scheme': scheme } });
      });
      mimeTypes.forEach(mimeType => {
        data.push({ $: { 'android:mimeType': mimeType } });
      });
      hosts.forEach(host => {
        data.push({ $: { 'android:host': host } });
      });
      pathPatterns.forEach(pathPattern => {
        data.push({ $: { 'android:pathPattern': pathPattern } });
      });
      return {
        action: actions.map(action => {
          return { $: { 'android:name': `android.intent.action.${action}` } };
        }),
        category: categories.map(category => {
          return {
            $: { 'android:name': `android.intent.category.${category}` },
          };
        }),
        data,
      };
    });

    mainActivity['intent-filter'] = [...intentFilters, ...newIntentFilters];

    return config;
  });

  return config;
};

export default withOpenWithFile;
