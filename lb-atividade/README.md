# Escalabilidade com Load Balancer (NGINX + Docker Compose)

## Tecnologias
Node.js (Express), NGINX (proxy reverso/balanceador), Docker e Docker Compose.

## Arquitetura
```
Cliente -> NGINX (:8080) -> app1 (app-01, azul)
                         -> app2 (app-02, verde)
                         -> app3 (app-03, laranja)
```
As três instâncias usam a mesma imagem; só `INSTANCE_ID` e `COLOR` mudam (variáveis de ambiente).
Apenas o NGINX publica porta no host.

## Como o balanceamento foi configurado
`nginx/nginx.conf`: bloco `upstream` com round-robin (padrão), `max_fails=2` e `fail_timeout=10s`
(health check passivo) e `proxy_next_upstream` para reenviar a requisição a outra instância em caso de falha.
O log registra `$upstream_addr`, mostrando qual instância atendeu.
Os containers também têm `healthcheck` do Docker consultando `/health`.

## Como executar
```
docker compose up -d --build
```
Acesse http://localhost:8080 (nunca as instâncias diretamente).

## Testes (seção 4)
1. Navegador: recarregar 10x com Ctrl+F5.
2. `./testes.sh 2`
3. `./testes.sh 3` (100 requisições, contagem por instância)
4. `docker compose stop app2` -> repetir teste 3 -> `docker compose start app2`
5. `./testes.sh 5` (instruções para a app-04)
6. `./testes.sh 6` (logs) e `docker compose logs app1 app2 app3`

Prova negativa:
```
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d
# abrir http://localhost:3002 -> o indicador nunca muda
```

## Limitações e evolução
- Health check passivo (NGINX open source); o ativo exige HAProxy ou NGINX Plus.
- Estado em memória some ao alternar instâncias: usar `ip_hash` (sticky sessions) ou Redis/banco externo.
- Evolução: mais instâncias, `least_conn`, auto scaling (Swarm/Kubernetes/nuvem).
