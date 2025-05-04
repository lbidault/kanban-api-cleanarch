// swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kanban API",
      version: "1.0.0",
    },
  },
  apis: [path.join(__dirname, "app", "routes", "*.ts")], // ✅ pointage clair
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
};
