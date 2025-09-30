/// <reference types="vite/client" />  
interface ImportMetaEnv extends APIClient {
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface APIClient {
    readonly VITE_API_BASE_URL: string
}