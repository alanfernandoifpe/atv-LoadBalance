// Aplicação propositalmente simples: o foco é a camada de rede.
// NADA é fixo no código: identidade e cor vêm de variáveis de ambiente.
const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || 'app-desconhecida';

// Cor vem de COLOR; se não for informada, é derivada do INSTANCE_ID (hash -> matiz HSL).
function corDerivada(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h}, 65%, 40%)`;
}
const COLOR = process.env.COLOR || corDerivada(INSTANCE_ID);

// Todas as respostas levam o cabeçalho de identificação e não podem ser cacheadas.
app.use((req, res, next) => {
  res.set('X-Served-By', INSTANCE_ID);
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${INSTANCE_ID}</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; flex-direction:column;
           align-items:center; justify-content:center; background:${COLOR};
           color:#fff; font-family:Arial, sans-serif; text-align:center; }
    h1 { font-size:4rem; margin:0 0 1rem; }
    p  { font-size:1.4rem; margin:.3rem; }
  </style>
</head>
<body>
  <h1>Respondido por: ${INSTANCE_ID}</h1>
  <p>Hostname: ${os.hostname()}</p>
  <p>Horário: ${new Date().toLocaleString('pt-BR')}</p>
</body>
</html>`);
});

// Usado pelo Docker (healthcheck) e disponível para o balanceador.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', instance: INSTANCE_ID }));

app.listen(PORT, () => console.log(`[${INSTANCE_ID}] ouvindo na porta ${PORT}`));
