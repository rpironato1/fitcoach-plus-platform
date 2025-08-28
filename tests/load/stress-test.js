import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "10s", target: 50 }, // Ramp up rápido
    { duration: "1m", target: 100 }, // Stress test
    { duration: "10s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"], // Mais permissivo no stress
    http_req_failed: ["rate<0.2"], // 20% de erro aceitável
  },
};

const BASE_URL = "http://localhost:8080";

export default function () {
  // Teste de stress apenas com operações críticas

  // 1. Landing page
  let response = http.get(`${BASE_URL}/`);
  const landingOk = check(response, {
    "landing page responde": (r) => r.status === 200,
  });
  errorRate.add(!landingOk);

  sleep(0.5);

  // 2. API health check
  response = http.get(`${BASE_URL}/api/health`);
  const healthOk = check(response, {
    "API responde": (r) => r.status === 200,
  });
  errorRate.add(!healthOk);

  sleep(0.5);

  // 3. Consulta pública (sem auth)
  response = http.get(`${BASE_URL}/api/public/plans`);
  check(response, {
    "consulta pública funciona": (r) => r.status === 200,
  });

  sleep(0.2);
}
