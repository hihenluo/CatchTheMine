declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}