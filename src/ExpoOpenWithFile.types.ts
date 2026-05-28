export type OpenedFile = {
  info: {
    exists: boolean;
    uri?: string;
    size?: number;
    modificationTime?: number;
  };
  fileName: string | null;
  base64: string;
};
