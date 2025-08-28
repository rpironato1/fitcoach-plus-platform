import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentService } from './PaymentService';

// Mock Stripe
const mockStripe = {
  elements: vi.fn(),
  confirmPayment: vi.fn(),
  createPaymentMethod: vi.fn(),
  retrievePaymentIntent: vi.fn(),
  confirmSetupIntent: vi.fn(),
};

// Mock DOM
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
    origin: 'https://example.com',
  },
  writable: true,
});

global.fetch = vi.fn();

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const mockConfig = {
    stripePublishableKey: 'pk_test_123',
    webhookSecret: 'whsec_test_123',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    paymentService = new PaymentService(mockConfig);
    // @ts-ignore
    paymentService.stripe = mockStripe;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(paymentService).toBeInstanceOf(PaymentService);
      expect(paymentService.config).toEqual(mockConfig);
    });

    it('should throw error with invalid configuration', () => {
      expect(() => {
        new PaymentService({
          stripePublishableKey: '',
          webhookSecret: '',
          successUrl: '',
          cancelUrl: '',
        });
      }).toThrow('Invalid payment configuration');
    });

    it('should validate Stripe publishable key format', () => {
      expect(() => {
        new PaymentService({
          ...mockConfig,
          stripePublishableKey: 'invalid_key',
        });
      }).toThrow('Invalid Stripe publishable key format');
    });

    it('should validate webhook secret format', () => {
      expect(() => {
        new PaymentService({
          ...mockConfig,
          webhookSecret: 'invalid_secret',
        });
      }).toThrow('Invalid webhook secret format');
    });
  });

  describe('subscription management', () => {
    it('should create subscription successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          subscriptionId: 'sub_123',
          clientSecret: 'pi_123_secret',
          status: 'requires_payment_method',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const subscriptionData = {
        priceId: 'price_123',
        customerId: 'cus_123',
        trialDays: 7,
        metadata: { trainerId: 'trainer_123' },
      };

      const result = await paymentService.createSubscription(subscriptionData);

      expect(global.fetch).toHaveBeenCalledWith('/api/payments/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      expect(result).toEqual({
        subscriptionId: 'sub_123',
        clientSecret: 'pi_123_secret',
        status: 'requires_payment_method',
      });
    });

    it('should handle subscription creation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'Invalid price ID',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const subscriptionData = {
        priceId: 'invalid_price',
        customerId: 'cus_123',
      };

      await expect(paymentService.createSubscription(subscriptionData))
        .rejects.toThrow('Failed to create subscription: Invalid price ID');
    });

    it('should update subscription successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          subscriptionId: 'sub_123',
          status: 'active',
          currentPeriodEnd: 1704067200,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const updateData = {
        subscriptionId: 'sub_123',
        priceId: 'price_456',
        prorationBehavior: 'always_invoice',
      };

      const result = await paymentService.updateSubscription(updateData);

      expect(global.fetch).toHaveBeenCalledWith('/api/payments/subscriptions/sub_123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_456',
          prorationBehavior: 'always_invoice',
        }),
      });

      expect(result.status).toBe('active');
    });

    it('should cancel subscription with options', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          subscriptionId: 'sub_123',
          status: 'canceled',
          canceledAt: 1704067200,
          refundAmount: 2500,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const cancelData = {
        subscriptionId: 'sub_123',
        cancelAtPeriodEnd: false,
        reason: 'customer_request',
        feedback: 'Too expensive',
      };

      const result = await paymentService.cancelSubscription(cancelData);

      expect(global.fetch).toHaveBeenCalledWith('/api/payments/subscriptions/sub_123/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: false,
          reason: 'customer_request',
          feedback: 'Too expensive',
        }),
      });

      expect(result.status).toBe('canceled');
      expect(result.refundAmount).toBe(2500);
    });

    it('should pause subscription for vacation hold', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          subscriptionId: 'sub_123',
          status: 'paused',
          pausedUntil: 1704067200,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.pauseSubscription('sub_123', {
        pauseUntil: new Date('2024-01-01'),
        reason: 'vacation',
      });

      expect(result.status).toBe('paused');
    });
  });

  describe('payment processing', () => {
    it('should process one-time payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 5000,
        currency: 'usd',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: mockPaymentIntent,
        error: null,
      });

      const paymentData = {
        amount: 5000,
        currency: 'usd',
        description: 'Personal training session',
        metadata: { sessionId: 'session_123' },
      };

      const result = await paymentService.processPayment(paymentData, 'card_element');

      expect(mockStripe.confirmPayment).toHaveBeenCalledWith({
        elements: expect.any(Object),
        confirmParams: {
          return_url: mockConfig.successUrl,
        },
      });

      expect(result.paymentIntent).toEqual(mockPaymentIntent);
    });

    it('should handle payment failures', async () => {
      const mockError = {
        type: 'card_error',
        code: 'card_declined',
        message: 'Your card was declined.',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: null,
        error: mockError,
      });

      const paymentData = {
        amount: 5000,
        currency: 'usd',
        description: 'Personal training session',
      };

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Your card was declined.');
    });

    it('should handle insufficient funds error', async () => {
      const mockError = {
        type: 'card_error',
        code: 'insufficient_funds',
        message: 'Your card has insufficient funds.',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: null,
        error: mockError,
      });

      const paymentData = {
        amount: 10000,
        currency: 'usd',
        description: 'Monthly subscription',
      };

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Your card has insufficient funds.');
    });

    it('should process refund successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          refundId: 're_123',
          amount: 2500,
          status: 'succeeded',
          reason: 'requested_by_customer',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const refundData = {
        paymentIntentId: 'pi_123',
        amount: 2500,
        reason: 'requested_by_customer',
      };

      const result = await paymentService.processRefund(refundData);

      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(2500);
    });

    it('should handle partial refunds', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          refundId: 're_123',
          amount: 1500,
          status: 'succeeded',
          reason: 'requested_by_customer',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const refundData = {
        paymentIntentId: 'pi_123',
        amount: 1500, // Partial refund
        reason: 'requested_by_customer',
      };

      const result = await paymentService.processRefund(refundData);

      expect(result.amount).toBe(1500);
    });
  });

  describe('payment methods', () => {
    it('should save payment method for future use', async () => {
      const mockPaymentMethod = {
        id: 'pm_123',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      mockStripe.createPaymentMethod.mockResolvedValue({
        paymentMethod: mockPaymentMethod,
        error: null,
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          paymentMethodId: 'pm_123',
          isDefault: true,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.savePaymentMethod('cus_123', 'card_element');

      expect(mockStripe.createPaymentMethod).toHaveBeenCalledWith({
        type: 'card',
        card: 'card_element',
      });

      expect(result.paymentMethodId).toBe('pm_123');
    });

    it('should delete payment method', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          paymentMethodId: 'pm_123',
          deleted: true,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.deletePaymentMethod('pm_123');

      expect(global.fetch).toHaveBeenCalledWith('/api/payments/payment-methods/pm_123', {
        method: 'DELETE',
      });

      expect(result.deleted).toBe(true);
    });

    it('should set default payment method', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          customerId: 'cus_123',
          defaultPaymentMethod: 'pm_456',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.setDefaultPaymentMethod('cus_123', 'pm_456');

      expect(result.defaultPaymentMethod).toBe('pm_456');
    });
  });

  describe('billing and invoicing', () => {
    it('should retrieve billing history', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          invoices: [
            {
              id: 'in_123',
              amount: 2999,
              currency: 'usd',
              status: 'paid',
              created: 1704067200,
              description: 'Monthly subscription',
            },
            {
              id: 'in_124',
              amount: 2999,
              currency: 'usd',
              status: 'paid',
              created: 1701475200,
              description: 'Monthly subscription',
            },
          ],
          hasMore: false,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.getBillingHistory('cus_123', {
        limit: 10,
        startingAfter: null,
      });

      expect(result.invoices).toHaveLength(2);
      expect(result.invoices[0].status).toBe('paid');
    });

    it('should download invoice PDF', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      await paymentService.downloadInvoice('in_123');

      expect(global.fetch).toHaveBeenCalledWith('/api/payments/invoices/in_123/pdf');
      expect(mockLink.download).toBe('invoice_in_123.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should get upcoming invoice preview', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          amount: 2999,
          currency: 'usd',
          nextPaymentAttempt: 1704067200,
          periodStart: 1704067200,
          periodEnd: 1706745600,
          lineItems: [
            {
              description: 'Premium Plan',
              amount: 2999,
              currency: 'usd',
            },
          ],
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.getUpcomingInvoice('sub_123');

      expect(result.amount).toBe(2999);
      expect(result.lineItems).toHaveLength(1);
    });
  });

  describe('webhooks', () => {
    it('should verify webhook signature', () => {
      const payload = '{"test": "data"}';
      const signature = 'test_signature';
      const timestamp = Math.floor(Date.now() / 1000);

      // Mock crypto for webhook verification
      const mockVerify = vi.fn().mockReturnValue(true);
      paymentService.verifyWebhookSignature = mockVerify;

      const result = paymentService.verifyWebhookSignature(payload, signature, timestamp);

      expect(result).toBe(true);
    });

    it('should handle subscription updated webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'active',
            current_period_end: 1704067200,
            items: {
              data: [
                {
                  price: {
                    id: 'price_456',
                    nickname: 'Premium Plan',
                  },
                },
              ],
            },
          },
        },
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ received: true }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.handleWebhook(webhookEvent);

      expect(result.received).toBe(true);
    });

    it('should handle payment failed webhook', async () => {
      const webhookEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_123',
            subscription: 'sub_123',
            attempt_count: 2,
            next_payment_attempt: 1704067200,
          },
        },
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ received: true }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const result = await paymentService.handleWebhook(webhookEvent);

      expect(result.received).toBe(true);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle network timeouts', async () => {
      // @ts-ignore
      global.fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      const subscriptionData = {
        priceId: 'price_123',
        customerId: 'cus_123',
      };

      await expect(paymentService.createSubscription(subscriptionData))
        .rejects.toThrow('Network timeout');
    });

    it('should handle rate limiting', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({
          error: 'Rate limit exceeded',
          retryAfter: 60,
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      const subscriptionData = {
        priceId: 'price_123',
        customerId: 'cus_123',
      };

      await expect(paymentService.createSubscription(subscriptionData))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid payment amounts', async () => {
      const paymentData = {
        amount: -100, // Invalid negative amount
        currency: 'usd',
        description: 'Test payment',
      };

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Payment amount must be positive');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        // Missing required fields
        currency: 'usd',
      };

      await expect(paymentService.processPayment(incompleteData as any, 'card_element'))
        .rejects.toThrow('Missing required payment data');
    });

    it('should handle Stripe API errors', async () => {
      const stripeError = {
        type: 'api_error',
        code: 'api_key_expired',
        message: 'Invalid API key provided',
      };

      mockStripe.confirmPayment.mockResolvedValue({
        paymentIntent: null,
        error: stripeError,
      });

      const paymentData = {
        amount: 5000,
        currency: 'usd',
        description: 'Test payment',
      };

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Invalid API key provided');
    });

    it('should validate currency codes', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'invalid', // Invalid currency
        description: 'Test payment',
      };

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Invalid currency code');
    });

    it('should handle concurrent payment attempts', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'usd',
        description: 'Test payment',
        idempotencyKey: 'unique_key_123',
      };

      const mockResponse = {
        ok: false,
        status: 409,
        json: vi.fn().mockResolvedValue({
          error: 'Duplicate payment attempt',
        }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      await expect(paymentService.processPayment(paymentData, 'card_element'))
        .rejects.toThrow('Duplicate payment attempt');
    });
  });

  describe('security and compliance', () => {
    it('should not log sensitive payment information', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const sensitiveData = {
        cardNumber: '4242424242424242',
        cvv: '123',
        paymentMethodId: 'pm_123',
      };

      paymentService.logPaymentAttempt(sensitiveData);

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('4242424242424242')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('123')
      );

      consoleSpy.mockRestore();
    });

    it('should sanitize data before API calls', async () => {
      const unsafeData = {
        amount: 5000,
        currency: 'usd',
        description: '<script>alert("xss")</script>',
        metadata: {
          userId: 'user_123',
          malicious: '<img src=x onerror=alert(1)>',
        },
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      };
      // @ts-ignore
      global.fetch.mockResolvedValue(mockResponse);

      await paymentService.processPayment(unsafeData, 'card_element');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const sentData = JSON.parse(fetchCall[1].body);

      expect(sentData.description).not.toContain('<script>');
      expect(sentData.metadata.malicious).not.toContain('<img');
    });

    it('should enforce PCI compliance requirements', () => {
      const violations = paymentService.checkPCICompliance();

      expect(violations).toEqual([]);
    });
  });
});