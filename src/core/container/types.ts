// Types for the Dependency Injection Container
export interface ServiceConstructor<T = any> {
  new (...args: any[]): T;
}

export interface ServiceFactory<T = any> {
  (): T;
}

export interface BindingBuilder<T> {
  to(implementation: ServiceConstructor<T>): void;
  toFactory(factory: ServiceFactory<T>): void;
  toValue(value: T): void;
}

export interface Container {
  bind<T>(token: string): BindingBuilder<T>;
  resolve<T>(token: string): T;
  isBound(token: string): boolean;
}

export enum ServiceLifetime {
  Transient = 'transient',
  Singleton = 'singleton'
}

export interface ServiceBinding<T = any> {
  type: 'constructor' | 'factory' | 'value';
  value: ServiceConstructor<T> | ServiceFactory<T> | T;
  lifetime: ServiceLifetime;
  instance?: T;
}