const axios = require("axios");
const moment = require("moment");

const date = moment().subtract(1, "days").format();

module.exports = async (req, res) => {
  const { placa, cpf } = req.query;

  if (!placa || !cpf) {
    return res.status(400).json({ message: "Placa e CPF são obrigatórios" });
  }

  const cias = [
    { cia: "Porto", slug: "PORTO" },
    // Adicione as seguradoras que você quiser aqui...
  ];

  try {
    for (const cia of cias) {
      const response = await axios.get(
        `https://oag.autoglass.com.br/atendimentos/api/web-app/apolices?CpfCnpj=${cpf}&DataSinistro=${date}&Placa=${placa}&Seguradora=${cia.slug}`
      );

      if (response.data && !response.data.ApoliceNaoEncontrada) {
        return res
          .status(200)
          .json({ seguradora: cia.cia, data: response.data });
      }
    }

    return res.status(404).json({ message: "Nenhuma apólice encontrada" });
  } catch (error) {
    console.error("Erro na consulta da API:", error);
    return res.status(500).json({ message: "Erro ao consultar a API" });
  }
};
