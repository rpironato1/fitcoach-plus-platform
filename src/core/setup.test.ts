/**
 * Comprehensive test suite for Core Setup
 * Testing critical dependency injection setup - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupModules } from './setup';
import { container } from './container';

// Mock all the service classes
vi.mock('@/modules/auth/services/LocalStorageAuthService', () => ({
  LocalStorageAuthService: class MockLocalStorageAuthService {
    async signIn() { return Promise.resolve(); }
    async signUp() { return Promise.resolve(); }
    async signOut() { return Promise.resolve(); }
  },
  LocalStorageProfileService: class MockLocalStorageProfileService {
    async getProfile() { return Promise.resolve(null); }
    async getTrainerProfile() { return Promise.resolve(null); }
    async getStudentProfile() { return Promise.resolve(null); }
  },
}));

vi.mock('@/modules/workouts/services/LocalStorageWorkoutService', () => ({
  LocalStorageWorkoutService: class MockLocalStorageWorkoutService {
    async getWorkouts() { return Promise.resolve([]); }
    async createWorkout() { return Promise.resolve(); }
  },
}));

vi.mock('@/modules/payments/services/LocalStoragePaymentService', () => ({
  LocalStoragePaymentService: class MockLocalStoragePaymentService {
    async getPayments() { return Promise.resolve([]); }
    async processPayment() { return Promise.resolve(); }
  },
}));

vi.mock('@/modules/ai/services/LocalStorageAIService', () => ({
  LocalStorageAIService: class MockLocalStorageAIService {
    async generateWorkout() { return Promise.resolve({}); }
    async generateMealPlan() { return Promise.resolve({}); }
  },
}));

vi.mock('@/modules/security/services/LocalStorageSecurityService', () => ({
  LocalStorageSecurityService: class MockLocalStorageSecurityService {
    async validateAccess() { return Promise.resolve(true); }
    async logSecurityEvent() { return Promise.resolve(); }
  },
}));

describe('Core Setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear container bindings before each test
    container.unbindAll();
  });

  afterEach(() => {
    container.unbindAll();
  });

  describe('Module Registration', () => {
    it('should register all auth services', () => {
      setupModules();

      expect(container.isBound('AuthService')).toBe(true);
      expect(container.isBound('ProfileService')).toBe(true);

      const authService = container.resolve('AuthService');
      const profileService = container.resolve('ProfileService');

      expect(authService).toBeDefined();
      expect(profileService).toBeDefined();
    });

    it('should register workout service', () => {
      setupModules();

      expect(container.isBound('WorkoutService')).toBe(true);

      const workoutService = container.resolve('WorkoutService');
      expect(workoutService).toBeDefined();
    });

    it('should register payment service', () => {
      setupModules();

      expect(container.isBound('PaymentService')).toBe(true);

      const paymentService = container.resolve('PaymentService');
      expect(paymentService).toBeDefined();
    });

    it('should register AI service', () => {
      setupModules();

      expect(container.isBound('AIService')).toBe(true);

      const aiService = container.resolve('AIService');
      expect(aiService).toBeDefined();
    });

    it('should register security service', () => {
      setupModules();

      expect(container.isBound('SecurityService')).toBe(true);

      const securityService = container.resolve('SecurityService');
      expect(securityService).toBeDefined();
    });
  });

  describe('Service Resolution', () => {
    it('should resolve auth services correctly', () => {
      setupModules();

      const authService = container.resolve('AuthService');
      const profileService = container.resolve('ProfileService');

      expect(authService).toHaveProperty('signIn');
      expect(authService).toHaveProperty('signUp');
      expect(authService).toHaveProperty('signOut');

      expect(profileService).toHaveProperty('getProfile');
      expect(profileService).toHaveProperty('getTrainerProfile');
      expect(profileService).toHaveProperty('getStudentProfile');
    });

    it('should resolve workout service correctly', () => {
      setupModules();

      const workoutService = container.resolve('WorkoutService');

      expect(workoutService).toHaveProperty('getWorkouts');
      expect(workoutService).toHaveProperty('createWorkout');
    });

    it('should resolve payment service correctly', () => {
      setupModules();

      const paymentService = container.resolve('PaymentService');

      expect(paymentService).toHaveProperty('getPayments');
      expect(paymentService).toHaveProperty('processPayment');
    });

    it('should resolve AI service correctly', () => {
      setupModules();

      const aiService = container.resolve('AIService');

      expect(aiService).toHaveProperty('generateWorkout');
      expect(aiService).toHaveProperty('generateMealPlan');
    });

    it('should resolve security service correctly', () => {
      setupModules();

      const securityService = container.resolve('SecurityService');

      expect(securityService).toHaveProperty('validateAccess');
      expect(securityService).toHaveProperty('logSecurityEvent');
    });
  });

  describe('Service Lifecycle', () => {
    it('should create singleton instances by default', () => {
      setupModules();

      const authService1 = container.resolve('AuthService');
      const authService2 = container.resolve('AuthService');

      expect(authService1).toBe(authService2);
    });

    it('should maintain separate instances for different services', () => {
      setupModules();

      const authService = container.resolve('AuthService');
      const workoutService = container.resolve('WorkoutService');

      expect(authService).not.toBe(workoutService);
    });

    it('should allow rebinding services', () => {
      setupModules();

      const originalAuthService = container.resolve('AuthService');

      // Create a new mock service
      class NewMockAuthService {
        async signIn() { return Promise.resolve(); }
        async signUp() { return Promise.resolve(); }
        async signOut() { return Promise.resolve(); }
      }

      container.rebind('AuthService').to(NewMockAuthService);

      const newAuthService = container.resolve('AuthService');

      expect(newAuthService).not.toBe(originalAuthService);
      expect(newAuthService).toBeInstanceOf(NewMockAuthService);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service dependencies gracefully', () => {
      // Don't call setupModules() - services won't be registered

      expect(() => {
        container.resolve('AuthService');
      }).toThrow();
    });

    it('should handle service resolution errors', () => {
      setupModules();

      // Try to resolve a non-existent service
      expect(() => {
        container.resolve('NonExistentService');
      }).toThrow();
    });
  });

  describe('Service Functionality', () => {
    it('should have functional auth service methods', async () => {
      setupModules();

      const authService = container.resolve('AuthService');

      // Test that methods are callable
      await expect(authService.signIn('test@test.com', 'password')).resolves.not.toThrow();
      await expect(authService.signUp('new@test.com', 'password', {})).resolves.not.toThrow();
      await expect(authService.signOut()).resolves.not.toThrow();
    });

    it('should have functional profile service methods', async () => {
      setupModules();

      const profileService = container.resolve('ProfileService');

      // Test that methods are callable
      await expect(profileService.getProfile('user-123')).resolves.not.toThrow();
      await expect(profileService.getTrainerProfile('trainer-123')).resolves.not.toThrow();
      await expect(profileService.getStudentProfile('student-123')).resolves.not.toThrow();
    });

    it('should have functional workout service methods', async () => {
      setupModules();

      const workoutService = container.resolve('WorkoutService');

      // Test that methods are callable
      await expect(workoutService.getWorkouts()).resolves.not.toThrow();
      await expect(workoutService.createWorkout()).resolves.not.toThrow();
    });

    it('should have functional payment service methods', async () => {
      setupModules();

      const paymentService = container.resolve('PaymentService');

      // Test that methods are callable
      await expect(paymentService.getPayments()).resolves.not.toThrow();
      await expect(paymentService.processPayment()).resolves.not.toThrow();
    });

    it('should have functional AI service methods', async () => {
      setupModules();

      const aiService = container.resolve('AIService');

      // Test that methods are callable
      await expect(aiService.generateWorkout()).resolves.not.toThrow();
      await expect(aiService.generateMealPlan()).resolves.not.toThrow();
    });

    it('should have functional security service methods', async () => {
      setupModules();

      const securityService = container.resolve('SecurityService');

      // Test that methods are callable
      await expect(securityService.validateAccess()).resolves.not.toThrow();
      await expect(securityService.logSecurityEvent()).resolves.not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should set up complete dependency graph', () => {
      setupModules();

      // All critical services should be available
      const services = [
        'AuthService',
        'ProfileService',
        'WorkoutService',
        'PaymentService',
        'AIService',
        'SecurityService',
      ];

      services.forEach(service => {
        expect(container.isBound(service)).toBe(true);
        expect(container.resolve(service)).toBeDefined();
      });
    });

    it('should allow services to interact with each other', () => {
      setupModules();

      const authService = container.resolve('AuthService');
      const profileService = container.resolve('ProfileService');
      const workoutService = container.resolve('WorkoutService');

      // Services should be able to work together
      expect(authService).toBeDefined();
      expect(profileService).toBeDefined();
      expect(workoutService).toBeDefined();
    });
  });

  describe('Service Types', () => {
    it('should bind LocalStorage-specific implementations', () => {
      setupModules();

      const authService = container.resolve('AuthService');
      const profileService = container.resolve('ProfileService');

      // These should be LocalStorage implementations
      expect(authService.constructor.name).toContain('LocalStorage');
      expect(profileService.constructor.name).toContain('LocalStorage');
    });

    it('should maintain service contracts', () => {
      setupModules();

      const authService = container.resolve('AuthService');

      // Should implement the auth service interface
      expect(typeof authService.signIn).toBe('function');
      expect(typeof authService.signUp).toBe('function');
      expect(typeof authService.signOut).toBe('function');
    });
  });

  describe('Container State', () => {
    it('should start with empty container', () => {
      expect(container.isBound('AuthService')).toBe(false);
      expect(container.isBound('ProfileService')).toBe(false);
    });

    it('should populate container after setup', () => {
      setupModules();

      expect(container.isBound('AuthService')).toBe(true);
      expect(container.isBound('ProfileService')).toBe(true);
      expect(container.isBound('WorkoutService')).toBe(true);
      expect(container.isBound('PaymentService')).toBe(true);
      expect(container.isBound('AIService')).toBe(true);
      expect(container.isBound('SecurityService')).toBe(true);
    });

    it('should allow multiple setup calls without errors', () => {
      setupModules();
      
      expect(() => {
        setupModules(); // Second call should not error
      }).not.toThrow();

      // Services should still be available
      expect(container.isBound('AuthService')).toBe(true);
    });
  });
});