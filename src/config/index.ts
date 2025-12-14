import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration interface.
 */
export interface Config {
	port: number;
	dbType: "mongo" | "postgres";
	mongoURI: string;
	postgresURI: string;
	jwtSecret: string;
	refreshTokenSecret: string;
	jwtExpiry: string;
	refreshTokenExpiry: string;
	email: {
		host: string;
		port: number;
		secure: boolean;
		auth: {
			user: string;
			pass: string;
		};
	};
}

/**
 * Application configuration object.
 * Contains server port, MongoDB connection URI, JWT secrets, token expiry, and email settings.
 */
export const config: Config = {
	port: parseInt(process.env.PORT || "3000", 10),
	dbType: (process.env.DB_TYPE as "mongo" | "postgres") || "mongo",
	mongoURI:
		process.env.MONGODB_URI || "mongodb://localhost:27017/cortex-backend",
	postgresURI:
		process.env.POSTGRES_URI ||
		"postgresql://user:password@localhost:5432/cortex",
	jwtSecret: process.env.JWT_SECRET || "your-secret-key",
	refreshTokenSecret:
		process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key",
	jwtExpiry: "15m",
	refreshTokenExpiry: "7d",
	email: {
		host: process.env.EMAIL_HOST || "smtp.gmail.com",
		port: parseInt(process.env.EMAIL_PORT || "587", 10),
		secure: false,
		auth: {
			user: process.env.EMAIL_USER || "your-email@gmail.com",
			pass: process.env.EMAIL_PASS || "your-app-password",
		},
	},
};
