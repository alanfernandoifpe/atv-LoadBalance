#!/usr/bin/env bash
# Roteiro dos testes da seção 4. Uso: ./testes.sh [1|2|3|4|5|6]
URL=${URL:-http://localhost:8080}

case "$1" in
  2) echo "== Teste 2: CLI =="
     for i in $(seq 1 6); do curl -sI $URL | grep -i x-served-by; done ;;
  3) echo "== Teste 3: 100 requisições =="
     for i in $(seq 1 100); do curl -sI $URL | grep -i x-served-by; done | sort | uniq -c ;;
  4) echo "== Teste 4: falha =="
     echo "1) docker compose stop app2"
     echo "2) ./testes.sh 3   (app-02 não deve aparecer)"
     echo "3) docker compose start app2   (volta a aparecer)" ;;
  5) echo "== Teste 5: escala =="
     echo "1) descomente a linha app4 em nginx/nginx.conf"
     echo "2) docker compose --profile scale up -d app4"
     echo "3) docker compose exec nginx nginx -s reload"
     echo "4) ./testes.sh 3" ;;
  6) echo "== Teste 6: logs =="
     docker compose logs --tail=30 nginx ;;
  *) echo "Uso: ./testes.sh [2|3|4|5|6]   (teste 1 = navegador em $URL)" ;;
esac
