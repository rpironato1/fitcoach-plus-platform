import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas
export const errorRate = new Rate('errors');
export const loginDuration = new Trend('login_duration');

// Configuração do teste
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up para 10 usuários
    { duration: '5m', target: 10 }, // Permanecer em 10 usuários
    { duration: '2m', target: 20 }, // Ramp up para 20 usuários
    { duration: '5m', target: 20 }, // Permanecer em 20 usuários
    { duration: '2m', target: 0 },  // Ramp down para 0 usuários
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requests < 500ms
    http_req_failed: ['rate<0.1'],    // Taxa de erro < 10%
    errors: ['rate<0.1'],             // Taxa de erro customizada < 10%
  },
};

const BASE_URL = 'http://localhost:8080';

// Dados de teste
const users = [
  { email: 'trainer1@test.com', password: 'password123', role: 'trainer' },
  { email: 'trainer2@test.com', password: 'password123', role: 'trainer' },
  { email: 'student1@test.com', password: 'password123', role: 'student' },
  { email: 'student2@test.com', password: 'password123', role: 'student' },
];

export default function () {
  // Selecionar usuário aleatório
  const user = users[Math.floor(Math.random() * users.length)];

  // 1. Acessar página inicial
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'página inicial carregou': (r) => r.status === 200,
    'página inicial tem título': (r) => r.body.includes('FitCoach'),
  });

  sleep(1);

  // 2. Fazer login
  const loginStart = Date.now();
  response = http.post(`${BASE_URL}/api/auth/signin`, {
    email: user.email,
    password: user.password,
  });

  const loginSuccess = check(response, {
    'login bem-sucedido': (r) => r.status === 200,
    'recebeu token': (r) => r.json('access_token') !== undefined,
  });

  errorRate.add(!loginSuccess);
  loginDuration.add(Date.now() - loginStart);

  if (!loginSuccess) {
    return; // Parar se login falhou
  }

  const token = response.json('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  sleep(1);

  // 3. Acessar dashboard baseado no role
  const dashboardUrl = user.role === 'trainer' 
    ? `${BASE_URL}/trainer` 
    : `${BASE_URL}/student`;

  response = http.get(dashboardUrl, { headers });
  check(response, {
    'dashboard carregou': (r) => r.status === 200,
    'dashboard tem conteúdo': (r) => r.body.length > 1000,
  });

  sleep(2);

  // 4. Operações específicas por role
  if (user.role === 'trainer') {
    // Listar alunos
    response = http.get(`${BASE_URL}/api/students`, { headers });
    check(response, {
      'lista de alunos carregou': (r) => r.status === 200,
    });

    sleep(1);

    // Listar sessões
    response = http.get(`${BASE_URL}/api/sessions`, { headers });
    check(response, {
      'lista de sessões carregou': (r) => r.status === 200,
    });

  } else {
    // Student: ver próprias sessões
    response = http.get(`${BASE_URL}/api/my-sessions`, { headers });
    check(response, {
      'minhas sessões carregaram': (r) => r.status === 200,
    });

    sleep(1);

    // Ver planos de dieta
    response = http.get(`${BASE_URL}/api/my-diet-plans`, { headers });
    check(response, {
      'meus planos de dieta carregaram': (r) => r.status === 200,
    });
  }

  sleep(1);

  // 5. Logout
  response = http.post(`${BASE_URL}/api/auth/signout`, {}, { headers });
  check(response, {
    'logout bem-sucedido': (r) => r.status === 200,
  });

  sleep(1);
}
