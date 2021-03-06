"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAccess = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
class roleAccess {
    static authentication(req, _res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // When user doesn't input access token
                if (!req.header('RolAccess')) {
                    throw { name: 'Missing Role Access' };
                }
                const decoded = jwt.verify(req.header('RolAccess').replace('Bearer ', ''), process.env.ROLE_KEY);
                req.roleAcess = decoded.roleAcess;
                next();
            }
            catch (err) {
                return next(err);
            }
        });
    }
    static authorization(req, _res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ambil req.roleAccess dari header
                // 
                const foundUser = yield user_model_1.UserModel.findOne({ _id: req.roleAcess });
                // User not found, when do query using access token's ID from user model
                if (!foundUser) {
                    throw { name: 'Access Token not Assosiated' };
                }
                if (String(foundUser._id) === req.params.userID) {
                    next();
                }
                else {
                    // When found user's ID not match with user's ID from params
                    throw { name: 'Forbidden Access' };
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.roleAccess = roleAccess;
