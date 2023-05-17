const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");


const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require("swagger-jsdoc");
const options =  {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bird Sighting App',
            version: '1.0.0',
            description: 'Bird Sighting App documentation'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./routes/*.js']
};
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", apiRouter);

module.exports = app;


