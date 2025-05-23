import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações completas (nada para substituir)
const TOKEN_ESPERADO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ODZmODU2MC0yODVkLTQ4OGEtYTdmZi0yZTM4NmMwZGYzYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ3OTgyODg5fQ.ZJ-BsjSvdvIixt_uorU-cdVnSQTowMmMyk_GaTgiaYQ";
const N8N_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ODZmODU2MC0yODVkLTQ4OGEtYTdmZi0yZTM4NmMwZGYzYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ3OTgyODg5fQ.ZJ-BsjSvdvIixt_uorU-cdVnSQTowMmMyk_GaTgiaYQ";
const PROJECT_ID = "1"; // ID padrão do projeto N8n se não estiver usando multi-projeto
const N8N_BASE_URL = "https://n8n-production-16c8.up.railway.app";
const N8N_API_URL = `${N8N_BASE_URL}/api/v1/workflows`;

app.use(bodyParser.json());

app.post("/webhook/teste", async (req, res) => {
  const { comando, token, nome, fluxo, workflowId, novoFluxo } = req.body;

  if (token !== TOKEN_ESPERADO) {
    return res.status(403).json({ error: "Token inválido" });
  }

  try {
    switch (comando) {
      case "criar_fluxo":
        if (!nome || !fluxo?.nodes) {
          return res.status(400).json({ error: "Parâmetros ausentes para criação" });
        }

        const criar = await axios.post(
          N8N_API_URL,
          {
            name: nome,
            nodes: fluxo.nodes,
            connections: fluxo.connections || {},
            settings: {},
            tags: [],
            pinData: {},
            versionId: 1,
            projectId: PROJECT_ID,
          },
          {
            headers: {
              Authorization: `Bearer ${N8N_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(200).json({ message: "Fluxo criado com sucesso", id: criar.data.id });

      case "listar_fluxos":
        const lista = await axios.get(N8N_API_URL, {
          headers: { Authorization: `Bearer ${N8N_API_TOKEN}` },
        });
        return res.status(200).json({ fluxos: lista.data });

      case "executar_fluxo":
        if (!workflowId) {
          return res.status(400).json({ error: "workflowId obrigatório" });
        }

        const exec = await axios.post(
          `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/execute`,
          {},
          {
            headers: { Authorization: `Bearer ${N8N_API_TOKEN}` },
          }
        );
        return res.status(200).json({ message: "Execução iniciada", execId: exec.data.id });

      case "deletar_fluxo":
        if (!workflowId) {
          return res.status(400).json({ error: "workflowId obrigatório" });
        }

        await axios.delete(`${N8N_API_URL}/${workflowId}`, {
          headers: { Authorization: `Bearer ${N8N_API_TOKEN}` },
        });
        return res.status(200).json({ message: "Fluxo deletado com sucesso" });

      case "editar_fluxo":
        if (!workflowId || !novoFluxo?.nodes) {
          return res.status(400).json({ error: "Parâmetros ausentes para edição" });
        }

        const editar = await axios.patch(
          `${N8N_API_URL}/${workflowId}`,
          {
            ...novoFluxo,
            projectId: PROJECT_ID,
          },
          {
            headers: {
              Authorization: `Bearer ${N8N_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        return res.status(200).json({ message: "Fluxo editado com sucesso", id: editar.data.id });

      default:
        return res.status(400).json({ error: "Comando não reconhecido" });
    }
  } catch (error) {
    console.error("Erro:", error.message);
    return res.status(500).json({ error: "Erro interno", detalhe: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

