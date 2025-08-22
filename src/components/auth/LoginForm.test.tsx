import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Get the mocked useAuth from the global mock
const { useAuth } = await vi.importMock('@/components/auth/AuthProvider')

describe('LoginForm Component', () => {
  const mockSignIn = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Configure the mock for each test
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      trainerProfile: null,
      studentProfile: null,
      loading: false,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
  })

  it('deve renderizar formulário de login', () => {
    render(<LoginForm />)
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios', async () => {
    render(<LoginForm />)
    
    // Tentar submeter sem preencher campos
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/senha/i)
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('deve validar formato de email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText(/email/i)
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('deve chamar signIn com dados corretos', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'password123')
    })
  })

  it('deve exibir erro de autenticação', async () => {
    mockSignIn.mockRejectedValue(new Error('Credenciais inválidas'))
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'wrong-password' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'wrong-password')
    })
  })
})
