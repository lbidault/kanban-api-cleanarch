import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kanban API",
      version: "1.0.0",
    },
  },
  apis: [
    isProd
      ? path.join(__dirname, "routes", "*.js") // dist/routes/*.js en prod
      : path.join(__dirname, "app", "routes", "*.ts"), // app/routes/*.ts en dev
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
};
