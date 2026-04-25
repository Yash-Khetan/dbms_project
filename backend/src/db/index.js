"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.db = void 0;
require("dotenv/config");
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema = require("./schema.js");
exports.schema = schema;
var client = (0, postgres_1.default)({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
exports.db = (0, postgres_js_1.drizzle)(client, { schema: schema });
