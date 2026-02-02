const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IPL Data Platform API",
      version: "1.0.0",
      description:
        "Backend APIs for IPL Teams, Players, Stats and Team Comparison",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // 👈 route files scan karega
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;