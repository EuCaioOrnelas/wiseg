const express = require("express");
const moment = require("moment");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve os arquivos estáticos do frontend

// Dados das seguradoras
const cias = [
  { cia: "Alfa", slug: "ALFA" },
  { cia: "Aliro", slug: "ALIRO" },
  { cia: "Allianz", slug: "ALLIANZ" },
  { cia: "Azul", slug: "AZUL" },
  { cia: "BB", slug: "BB" },
  { cia: "Bradesco", slug: "BRADESCO" },
  { cia: "Caixa", slug: "CAIXA" },
  { cia: "Generali", slug: "GENERALI" },
  { cia: "HDI", slug: "HDI" },
  { cia: "Indiana", slug: "INDIANA" },
  { cia: "Liberty", slug: "LIBERTY" },
  { cia: "Mapfre", slug: "MAPFRE" },
  { cia: "Mitsui", slug: "MITSUI" },
  { cia: "Porto", slug: "PORTO" },
  { cia: "Sancor", slug: "SANCOR" },
  { cia: "SantanderAuto", slug: "SANTANDERAUTO" },
  { cia: "Sompo", slug: "SOMPO" },
  { cia: "SulamericaAuto", slug: "SULAMERICA" },
  { cia: "Tokio", slug: "TOKIOMARINE" },
  { cia: "Youse", slug: "YOUSE" },
  { cia: "Zurich", slug: "ZURICH" },
];

// Função de consulta à API externa
async function consult(placa, cia) {
  const date = moment().subtract(1, "days").format(); // Data do sinistro
  try {
    // Requisição à API externa para consultar a apólice de seguro
    const { data } = await axios.get(
      `https://oag.autoglass.com.br/atendimentos/api/web-app/apolices?Placa=${placa}&Seguradora=${cia.slug}&DataSinistro=${date}`
    );

    // Log para depuração, verifica o que está retornando da API externa
    console.log("Resposta da API para a seguradora", cia.cia, ":", data);

    // Verifica se a apólice não foi encontrada
    if (data.ApoliceNaoEncontrada) {
      return { cia, error: "not-found" };
    }

    // Se a apólice foi encontrada, retorna as informações relevantes
    return {
      cia: cia.cia,
      data: {
        modelo: data.DescricaoVeiculo || "Modelo não encontrado",
        placa: data.Placa || "Placa não encontrada",
        chassi: data.Chassi || "Chassi não encontrado",
      },
    };
  } catch (error) {
    // Se ocorrer um erro ao consultar a API, loga o erro
    console.error("Erro ao consultar a API:", error);
    return { cia, error: "error" };
  }
}

// Rota de consulta
app.get("/api/consultar-seguro", async (req, res) => {
  const { placa } = req.query; // Lê o parâmetro 'placa' da URL da requisição

  // Verifica se o parâmetro 'placa' foi fornecido
  if (!placa) {
    return res.status(400).json({ error: "Placa é necessária" }); // Retorna erro 400 se 'placa' não for fornecido
  }

  const result = [];
  for (const cia of cias) {
    const response = await consult(placa, cia); // Chama a função consult
    if (response.data) {
      result.push({
        seguradora: response.cia,
        modelo: response.data.modelo,
        placa: response.data.placa,
        chassi: response.data.chassi,
      });
      break; // Se encontrar uma apólice, interrompe a busca nas seguradoras
    }
  }

  // Se algum resultado for encontrado, retorna a resposta
  if (result.length > 0) {
    res.json(result);
  } else {
    // Caso contrário, retorna erro 404
    res.status(404).json({ error: "Seguro não encontrado" });
  }
});

// Serve o HTML e os recursos estáticos
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
