import { describe, it, expect, beforeEach } from 'vitest';
import { container } from './index';

// Test classes for DI container
class TestService {
  getValue() {
    return 'test-value';
  }
}

class DependentService {
  constructor(private testService: TestService) {}
  
  getTestValue() {
    return this.testService.getValue();
  }
}

describe('DI Container', () => {
  beforeEach(() => {
    container.clear();
  });

  it('deve registrar e resolver serviços por construtor', () => {
    container.bind<TestService>('TestService').to(TestService);
    
    const instance = container.resolve<TestService>('TestService');
    
    expect(instance).toBeInstanceOf(TestService);
    expect(instance.getValue()).toBe('test-value');
  });

  it('deve registrar e resolver serviços por factory', () => {
    container.bind<string>('TestString').toFactory(() => 'factory-value');
    
    const value = container.resolve<string>('TestString');
    
    expect(value).toBe('factory-value');
  });

  it('deve registrar e resolver valores diretos', () => {
    const testValue = { name: 'test', value: 42 };
    container.bind('TestValue').toValue(testValue);
    
    const resolved = container.resolve('TestValue');
    
    expect(resolved).toBe(testValue);
  });

  it('deve verificar se um token está registrado', () => {
    expect(container.isBound('NonExistent')).toBe(false);
    
    container.bind('TestService').to(TestService);
    
    expect(container.isBound('TestService')).toBe(true);
  });

  it('deve lançar erro para tokens não registrados', () => {
    expect(() => {
      container.resolve('NonExistent');
    }).toThrow('No binding found for token: NonExistent');
  });

  it('deve criar instâncias diferentes para serviços transient', () => {
    container.bind<TestService>('TestService').to(TestService);
    
    const instance1 = container.resolve<TestService>('TestService');
    const instance2 = container.resolve<TestService>('TestService');
    
    expect(instance1).not.toBe(instance2);
    expect(instance1).toBeInstanceOf(TestService);
    expect(instance2).toBeInstanceOf(TestService);
  });
});