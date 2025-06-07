import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// --- Constants ---
const CREDENTIALS_FILE_NAME = "credentials.json";
// IMPORTANT: In a production environment, use a strong, unique secret stored securely (e.g., environment variable).
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-and-complex-jwt-key-please-change-me";
const SALT_ROUNDS = 10;

// --- Interfaces ---
export interface UserCredentials {
    username: string;
    passwordHash: string;
}

export interface JwtPayload {
    username: string;
    // You can add more data to the payload if needed, e.g., userId, roles
}

// --- Utility Functions ---
function getCredentialsFilePath(userDataPath: string): string {
    return path.join(userDataPath, CREDENTIALS_FILE_NAME);
}

// --- Credential Management ---
export async function loadCredentials(userDataPath: string): Promise<UserCredentials | null> {
    const filePath = getCredentialsFilePath(userDataPath);
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data) as UserCredentials;
    } catch (error: any) {
        if (error.code === "ENOENT") {
            // File does not exist
            return null;
        }
        console.error("Error loading credentials:", error);
        throw error; // Re-throw other errors
    }
}

export async function saveCredentials(userDataPath: string, credentials: UserCredentials): Promise<void> {
    const filePath = getCredentialsFilePath(userDataPath);
    try {
        await fs.writeFile(filePath, JSON.stringify(credentials, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving credentials:", error);
        throw error;
    }
}

export async function initializeCredentials(userDataPath: string): Promise<void> {
    let credentials = await loadCredentials(userDataPath);
    if (!credentials) {
        console.warn(
            `Credentials file not found at ${getCredentialsFilePath(userDataPath)}. ` +
                `Creating with default credentials (admin/admin). ` +
                `PLEASE CHANGE THESE CREDENTIALS IMMEDIATELY via the /auth/change-credentials endpoint.`,
        );
        const defaultPasswordHash = await bcrypt.hash("admin", SALT_ROUNDS);
        credentials = { username: "admin", passwordHash: defaultPasswordHash };
        await saveCredentials(userDataPath, credentials);
    }
}

// --- Password Hashing ---
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// --- JWT Management ---
export function generateToken(username: string): string {
    const payload: JwtPayload = { username };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" }); // Token expires in 24 hours
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

// --- Authentication Middleware ---
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        res.status(401).json({ code: 401, data: null, err: "Access denied. No token provided." });
        return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        res.status(403).json({ code: 403, data: null, err: "Access denied. Invalid or expired token." });
        return;
    }

    req.user = decoded; // Add decoded user info to the request object
    next();
}
