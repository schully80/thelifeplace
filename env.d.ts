/// <reference types="astro/client" />

export {};

declare global {
  interface Window {
    __TLP_LIVE__?: boolean;
    dataLayer: unknown[][];
  }

}

declare namespace App {
  interface Locals {
    runtime?: {
      env?: Record<string, unknown>;
    };
  }
}

declare module "react" {
  export type ReactNode = any;
  export type Ref<T> = any;
  export type ComponentPropsWithoutRef<T> = any;
  export interface ButtonHTMLAttributes<T> extends Record<string, any> {}
  export interface ForwardRefExoticComponent<P> {
    (props: P): any;
  }
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => any): ForwardRefExoticComponent<P>;
}

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}
