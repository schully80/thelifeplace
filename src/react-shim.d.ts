declare module "react" {
  export type ReactNode = any;
  export type Ref<T> = any;
  export interface ButtonHTMLAttributes<T> extends Record<string, any> {
    className?: string;
  }
  export interface ForwardRefExoticComponent<P> {
    (props: P): any;
    displayName?: string;
  }
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => any): ForwardRefExoticComponent<P>;
}

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}
