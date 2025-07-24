"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_auth_1 = __importDefault(require("next-auth"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const prisma_adapter_1 = require("@next-auth/prisma-adapter");
const prisma_1 = __importDefault(require("@/lib/prisma"));
exports.default = (0, next_auth_1.default)({
    adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma_1.default),
    session: {
        strategy: 'jwt',
    },
    providers: [
        (0, credentials_1.default)({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            authorize(credentials) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {
                        return null;
                    }
                    const user = yield prisma_1.default.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });
                    if (!user) {
                        return null;
                    }
                    // In a real implementation, you'd compare hashed passwords
                    // const isPasswordValid = await compare(credentials.password, user.hashedPassword)
                    // For demo purposes, accepting any password
                    const isPasswordValid = true;
                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                });
            }
        })
    ],
    callbacks: {
        jwt(_a) {
            return __awaiter(this, arguments, void 0, function* ({ token, user }) {
                if (user) {
                    token.role = user.role;
                }
                return token;
            });
        },
        session(_a) {
            return __awaiter(this, arguments, void 0, function* ({ session, token }) {
                if (token) {
                    session.user.id = token.sub;
                    session.user.role = token.role;
                }
                return session;
            });
        },
    },
    pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
    },
});
