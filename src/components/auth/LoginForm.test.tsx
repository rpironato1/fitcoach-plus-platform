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

// Mock do AuthProvider
const mockSignIn = vi.fn()
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
    error: null,
  }),
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('deve validar formato de email', async () => {
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'email-inválido' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument()
    })
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
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123'
      })
    })
  })

  it('deve exibir erro de autenticação', async () => {
    mockSignIn.mockResolvedValue({ 
      error: { message: 'Credenciais inválidas' } 
    })
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: 'wrong-password' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
    })
  })
})
