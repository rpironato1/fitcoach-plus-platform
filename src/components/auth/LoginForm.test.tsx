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
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
    error: null,
  }),
}))

// Mock do useToast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar formulário de login', () => {
    render(<LoginForm />)
    
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/sua senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve chamar signIn com dados corretos', async () => {
    mockSignIn.mockResolvedValue(undefined)
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/sua senha/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'password123')
    })
  })

  it('deve exibir toast de sucesso ao fazer login', async () => {
    mockSignIn.mockResolvedValue(undefined)
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/sua senha/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
      })
    })
  })

  it('deve exibir toast de erro quando login falha', async () => {
    mockSignIn.mockRejectedValue(new Error('Credenciais inválidas'))
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/sua senha/i), {
      target: { value: 'wrong-password' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro no login',
        description: 'Credenciais inválidas',
        variant: 'destructive',
      })
    })
  })

  it('deve mostrar estado de loading durante login', async () => {
    // Mock que demora para resolver
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<LoginForm />)
    
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'user@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/sua senha/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    
    expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument()
  })
})
