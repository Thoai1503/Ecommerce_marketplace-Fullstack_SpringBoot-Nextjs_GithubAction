// global.d.ts
declare module "bootstrap/dist/css/bootstrap.min.css";

declare module "*.css";

declare module "bootstrap-icons/font/bootstrap-icons.css";

declare namespace React {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
