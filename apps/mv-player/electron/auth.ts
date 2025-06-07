import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// --- Constants ---
const PUBLIC_SALT_FILE_NAME = "public-salt.json";
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
function getPublicSaltFilePath(userDataPath: string): string {
    return path.join(userDataPath, PUBLIC_SALT_FILE_NAME);
}

function getCredentialsFilePath(userDataPath: string): string {
    return path.join(userDataPath, CREDENTIALS_FILE_NAME);
}

// --- Public Salt Management ---
export async function getPublicSalt(userDataPath: string): Promise<string> {
    const filePath = getPublicSaltFilePath(userDataPath);
    try {
        const data = await fs.readFile(filePath, "utf-8");
        const saltData = JSON.parse(data);
        if (saltData && saltData.salt) {
            return saltData.salt;
        }
        // If file exists but content is invalid, generate a new one
        console.warn(`Invalid content in public salt file: ${filePath}. Regenerating.`);
    } catch (error: any) {
        if (error.code !== "ENOENT") {
            console.error("Error loading public salt:", error);
            // For other errors, we might still want to try generating a new one
            // or re-throw depending on desired robustness. For now, let's try generating.
        }
    }

    // Generate, save, and return a new salt
    const newSalt = crypto.randomBytes(32).toString("hex"); // 32 bytes = 256 bits
    try {
        await fs.writeFile(filePath, JSON.stringify({ salt: newSalt }, null, 2), "utf-8");
        console.log(`New public salt generated and saved to ${filePath}`);
        return newSalt;
    } catch (saveError) {
        console.error("Error saving new public salt:", saveError);
        throw saveError; // If we can't save it, it's a critical issue
    }
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
        // Get the public salt (it will be created if it doesn't exist)
        const publicSalt = await getPublicSalt(userDataPath);
        
        // Simulate client-side hashing for the default password
        const defaultPassword = "admin";
        const clientHashedDefaultPassword = crypto.createHmac("sha512", publicSalt)
            .update(defaultPassword)
            .digest("hex");

        const finalBcryptHash = await bcrypt.hash(clientHashedDefaultPassword, SALT_ROUNDS);
        credentials = { username: "admin", passwordHash: finalBcryptHash };
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
