import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// Token do N8n (já incluso no código)
const N8N_API_TOKEN = "SEU_TOKEN_AQUI";

// ID fixo do projeto onde os fluxos serão criados
const PROJECT_ID = "SEU_PROJECT_ID_AQUI";

// URL base do N8n em nuvem
const N8N_API_URL = "https://n8n-production-XXXXX.up.railway.app/api/v1/workflows";

app.use(bodyParser.json());

app.post("/create-flow", async (req, res) => {
  try {
    const { name, nodes } = req.body;

    const response = await axios.post(
      N8N_API_URL,
      {
        name,
        nodes,
        connections: {},
        settings: {},
        tags: [],
        pinData: {},
        versionId: "",
        projectId: PROJECT_ID,
      },
      {
        headers: {
          "Authorization": `Bearer ${N8N_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ message: "Fluxo criado com sucesso!", data: response.data });
  } catch (error) {
    console.error("Erro ao criar fluxo:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar fluxo." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

