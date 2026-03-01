declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare type IconElement = {
    el: 'path' | 'rect' | 'circle' | 'ellipse';
} & import('react').SVGAttributes<SVGElement>;

declare interface IconData {
    vb: string;
    g: IconElement[];
}