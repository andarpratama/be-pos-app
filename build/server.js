"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logging_1 = __importDefault(require("./config/logging"));
app_1.APP.listen(app_1.PORT, () => {
    logging_1.default.info('SERVER', `MESSAGE: Server running on port http://localhost:${app_1.PORT}`);
});
