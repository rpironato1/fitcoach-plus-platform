import { 
  Container, 
  BindingBuilder, 
  ServiceBinding, 
  ServiceConstructor, 
  ServiceFactory, 
  ServiceLifetime 
} from './types';

class DIBindingBuilder<T> implements BindingBuilder<T> {
  constructor(
    private container: DIContainer,
    private token: string
  ) {}

  to(implementation: ServiceConstructor<T>): void {
    this.container.register(this.token, {
      type: 'constructor',
      value: implementation,
      lifetime: ServiceLifetime.Transient
    });
  }

  toFactory(factory: ServiceFactory<T>): void {
    this.container.register(this.token, {
      type: 'factory',
      value: factory,
      lifetime: ServiceLifetime.Transient
    });
  }

  toValue(value: T): void {
    this.container.register(this.token, {
      type: 'value',
      value,
      lifetime: ServiceLifetime.Singleton
    });
  }
}

class DIContainer implements Container {
  private bindings = new Map<string, ServiceBinding>();

  bind<T>(token: string): BindingBuilder<T> {
    return new DIBindingBuilder<T>(this, token);
  }

  register<T>(token: string, binding: ServiceBinding<T>): void {
    this.bindings.set(token, binding);
  }

  resolve<T>(token: string): T {
    const binding = this.bindings.get(token);
    
    if (!binding) {
      throw new Error(`No binding found for token: ${token}`);
    }

    // Return singleton instance if it exists
    if (binding.lifetime === ServiceLifetime.Singleton && binding.instance) {
      return binding.instance as T;
    }

    let instance: T;

    switch (binding.type) {
      case 'constructor': {
        const Constructor = binding.value as ServiceConstructor<T>;
        instance = new Constructor();
        break;
      }
        
      case 'factory': {
        const factory = binding.value as ServiceFactory<T>;
        instance = factory();
        break;
      }
        
      case 'value':
        instance = binding.value as T;
        break;
        
      default:
        throw new Error(`Unknown binding type for token: ${token}`);
    }

    // Store singleton instances
    if (binding.lifetime === ServiceLifetime.Singleton) {
      binding.instance = instance;
    }

    return instance;
  }

  isBound(token: string): boolean {
    return this.bindings.has(token);
  }

  // Method to clear all bindings (useful for testing)
  clear(): void {
    this.bindings.clear();
  }
}

export const container = new DIContainer();