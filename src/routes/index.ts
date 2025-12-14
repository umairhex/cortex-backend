import express from "express";
import {
	forgotPassword,
	forgotPasswordValidation,
	logout,
	refresh,
	resetPassword,
	resetPasswordValidation,
	signin,
	signinValidation,
	signup,
	signupValidation,
} from "../controllers/auth.js";
import {
	createCollection,
	deleteCollection,
	getCollectionById,
	getCollections,
	updateCollection,
} from "../controllers/collection.js";
import {
	createIntegration,
	deleteIntegration,
	getIntegrations,
	invokeIntrospection,
	invokeTableIntrospection,
	testConnection,
} from "../controllers/integration.js";
import {
	createItem,
	deleteItem,
	getItemById,
	getItems,
	updateItem,
} from "../controllers/item.js";
import {
	getPublicCollections,
	getPublicItemById,
	getPublicItems,
} from "../controllers/public.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { authRateLimit, publicReadLimit } from "../middleware/rateLimit.js";
import User from "../models/User.js";
import { getHealth } from "./health.js";
import uploadRoutes from "./upload.js";

/**
 * Express router for API routes.
 * Defines all application routes.
 */
const router: express.Router = express.Router();

/**
 * Health check route.
 */
router.get("/health", getHealth);

router.use("/upload", uploadRoutes);

/**
 * Public Read-Only Routes (Static Site Generation Support)
 */
router.get("/public/collections", publicReadLimit, getPublicCollections);
router.get(
	"/public/collections/:collectionId/items",
	publicReadLimit,
	getPublicItems,
);
router.get(
	"/public/collections/:collectionId/items/:id",
	publicReadLimit,
	getPublicItemById,
);
router.get("/public/items/:id", publicReadLimit, getPublicItemById);

/**
 * User signup route with rate limiting and validation.
 */
router.post("/signup", authRateLimit, signupValidation, signup);

/**
 * User signin route with rate limiting and validation.
 */
router.post("/signin", authRateLimit, signinValidation, signin);

/**
 * Token refresh route.
 */
router.post("/refresh", refresh);

/**
 * User logout route.
 */
router.post("/logout", logout);

/**
 * Forgot password route with rate limiting and validation.
 */
router.post(
	"/forgot-password",
	authRateLimit,
	forgotPasswordValidation,
	forgotPassword,
);

/**
 * Reset password route with validation.
 */
router.post("/reset-password", resetPasswordValidation, resetPassword);

/**
 * Get user profile route, requires authentication.
 */
router.get(
	"/profile",
	authenticateToken,
	/**
	 * Get user profile handler.
	 * Retrieves the authenticated user's profile data.
	 */ async (req, res) => {
		try {
			const user = await User.findById(req.user._id).select(
				"-password -refreshToken",
			);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json({ user });
		} catch (error) {
			console.error("Profile fetch error:", error);
			res.status(500).json({ message: "Server error" });
		}
	},
);

/**
 * Integration Routes
 */
router.post(
	"/integrations",
	authenticateToken,
	authorizeRoles("admin"),
	createIntegration,
);
router.get(
	"/integrations",
	authenticateToken,
	authorizeRoles("admin"),
	getIntegrations,
);
router.delete(
	"/integrations/:id",
	authenticateToken,
	authorizeRoles("admin"),
	deleteIntegration,
);
router.post(
	"/integrations/test",
	authenticateToken,
	authorizeRoles("admin"),
	testConnection,
);
router.post(
	"/integrations/:id/introspect",
	authenticateToken,
	authorizeRoles("admin"),
	invokeIntrospection,
);
router.get(
	"/integrations/:id/schema/:tableName",
	authenticateToken,
	authorizeRoles("admin"),
	invokeTableIntrospection,
);

/**
 * Create collection route, requires authentication.
 */

router.post(
	"/collections",
	authenticateToken,
	authorizeRoles("admin"),
	createCollection,
);

/**
 * Get all collections route, requires authentication.
 */
router.get("/collections", authenticateToken, getCollections);

/**
 * Get collection by ID route, requires authentication.
 */
router.get("/collections/:id", authenticateToken, getCollectionById);

/**
 * Update collection by ID route, requires authentication.
 */
router.put(
	"/collections/:id",
	authenticateToken,
	authorizeRoles("admin"),
	updateCollection,
);

/**
 * Delete collection by ID route, requires authentication.
 */
router.delete(
	"/collections/:id",
	authenticateToken,
	authorizeRoles("admin"),
	deleteCollection,
);

/**
 * Item Routes
 */

router.post("/collections/:collectionId/items", authenticateToken, createItem);

router.get("/collections/:collectionId/items", authenticateToken, getItems);

router.get(
	"/collections/:collectionId/items/:id",
	authenticateToken,
	getItemById,
);
router.put(
	"/collections/:collectionId/items/:id",
	authenticateToken,
	updateItem,
);
router.delete(
	"/collections/:collectionId/items/:id",
	authenticateToken,
	deleteItem,
);

router.get("/items/:id", authenticateToken, getItemById);

router.put("/items/:id", authenticateToken, updateItem);

router.delete("/items/:id", authenticateToken, deleteItem);

export default router;
