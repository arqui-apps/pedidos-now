require("dotenv").config();
const express = require("express");
const logger = require("./middleware/logger");
const brokerRoutes = require("./routes/brokerRoutes");

const app = express();
const PORT = process.env.BROKER_PORT || 4000;

app.use(express.json());
app.use(logger);

app.use("/api/broker", brokerRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta del broker no encontrada",
    message: "El unico endpoint disponible es POST /api/broker/request",
  });
});

app.listen(PORT, () => {
  console.log(`Broker business-service corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint: POST http://localhost:${PORT}/api/broker/request`);
});
