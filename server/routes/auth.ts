import type { Request, Response, Router } from "express";
import express from "express";

// In-memory demo data store (ephemeral)
interface UserRec {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "admin" | "staff";
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  assignedClasses: string[];
  assignedSubjects: string[];
  allowCrossClass: boolean;
  password: string; // plaintext for demo only
  registrationToken?: string | null;
  mustSetPassword?: boolean;
}

// Shared in-memory list (simple singleton via module scope)
const users: UserRec[] = [];
let nextId = 1;

function ensureSeed() {
  if (users.length === 0) {
    users.push(
      {
        id: nextId++,
        username: "admin",
        email: "admin@ialibu.edu.pg",
        firstName: "System",
        lastName: "Administrator",
        userType: "admin",
        department: "Administration",
        position: "System Administrator",
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: ["all"],
        assignedClasses: [],
        assignedSubjects: [],
        allowCrossClass: true,
        password: "admin123",
        registrationToken: null,
        mustSetPassword: false,
      },
      {
        id: nextId++,
        username: "staff",
        email: "staff@ialibu.edu.pg",
        firstName: "Demo",
        lastName: "Teacher",
        userType: "staff",
        department: "Academic",
        position: "Teacher",
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: ["students", "attendance", "grades", "reports"],
        assignedClasses: ["9A", "10A"],
        assignedSubjects: ["Mathematics", "English", "Science"],
        allowCrossClass: false,
        password: "staff123",
        registrationToken: null,
        mustSetPassword: false,
      },
    );
  }
}

function toApiUser(u: UserRec) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    user_type: u.userType,
    department: u.department,
    position: u.position,
    is_active: u.isActive,
    created_at: u.createdAt,
    last_login: u.lastLogin,
    permissions: u.permissions,
    assigned_classes: u.assignedClasses,
    assigned_subjects: u.assignedSubjects,
    allow_cross_class: u.allowCrossClass,
    must_set_password: !!u.mustSetPassword,
    registration_token: u.registrationToken ?? null,
  };
}

export function createAuthRouter(): Router {
  ensureSeed();
  const router = express.Router();

  // POST /api/auth/register
  router.post("/register", (req: Request, res: Response) => {
    const { username, email, password, firstName, lastName, userType } =
      req.body || {};

    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !userType
    ) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    if (!/@ialibu\.edu\.pg$/i.test(String(email))) {
      return res.json({
        success: false,
        message: "Email must be a valid ialibu.edu.pg address",
      });
    }
    const exists = users.some(
      (u) =>
        u.username === username ||
        u.email.toLowerCase() === String(email).toLowerCase(),
    );
    if (exists) {
      return res.json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const newUser: UserRec = {
      id: nextId++,
      username,
      email,
      firstName,
      lastName,
      userType: userType === "admin" ? "admin" : "staff",
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions:
        userType === "admin"
          ? ["all"]
          : ["students", "attendance", "grades", "reports"],
      assignedClasses: [],
      assignedSubjects: [],
      allowCrossClass: userType === "admin",
      password,
      registrationToken: null,
      mustSetPassword: false,
    };
    users.push(newUser);

    return res.json({
      success: true,
      message: "Registration successful. You can now log in.",
    });
  });

  // POST /api/auth/login
  router.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    const user = users.find((u) => u.username === username && u.isActive);
    if (!user)
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    if (user.password !== password)
      return res.json({
        success: false,
        message: "Invalid username or password",
      });

    user.lastLogin = new Date().toISOString();
    const token = `token_${user.id}_${Date.now()}`;

    return res.json({
      success: true,
      message: "Login successful",
      user: toApiUser(user),
      token,
    });
  });

  // POST /api/auth/complete_registration (simple stub)
  router.post("/complete_registration", (req: Request, res: Response) => {
    const { username, token, password } = req.body || {};
    const user = users.find((u) => u.username === username);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (!user.registrationToken || user.registrationToken !== token) {
      return res.json({ success: false, message: "Invalid registration code" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    user.password = password;
    user.mustSetPassword = false;
    user.registrationToken = null;
    return res.json({ success: true, message: "Registration completed" });
  });

  return router;
}

export function createUsersRouter(): Router {
  ensureSeed();
  const router = express.Router();

  // GET /api/users (list)
  router.get("/", (_req: Request, res: Response) => {
    return res.json({ success: true, users: users.map(toApiUser) });
  });

  // POST /api/users (add)
  router.post("/", (req: Request, res: Response) => {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      userType,
      assignedClasses,
      assignedSubjects,
      allowCrossClass,
    } = req.body || {};
    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !userType
    ) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    if (!/@ialibu\.edu\.pg$/i.test(String(email))) {
      return res.json({
        success: false,
        message: "Email must be a valid ialibu.edu.pg address",
      });
    }
    const exists = users.some(
      (u) =>
        u.username === username ||
        u.email.toLowerCase() === String(email).toLowerCase(),
    );
    if (exists)
      return res.json({
        success: false,
        message: "Username or email already exists",
      });

    const newUser: UserRec = {
      id: nextId++,
      username,
      email,
      firstName,
      lastName,
      userType: userType === "admin" ? "admin" : "staff",
      isActive: true,
      createdAt: new Date().toISOString(),
      permissions:
        userType === "admin"
          ? ["all"]
          : ["students", "attendance", "grades", "reports"],
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      assignedSubjects: Array.isArray(assignedSubjects) ? assignedSubjects : [],
      allowCrossClass: !!allowCrossClass,
      password,
      registrationToken: null,
      mustSetPassword: false,
    };
    users.push(newUser);
    return res.json({ success: true, message: "User added successfully" });
  });

  // PUT /api/users/:id (update)
  router.put("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1)
      return res.json({ success: false, message: "User not found" });

    const u = users[idx];
    const updates = req.body || {};
    // Basic updates
    users[idx] = {
      ...u,
      username: updates.username ?? u.username,
      email: updates.email ?? u.email,
      firstName: updates.firstName ?? u.firstName,
      lastName: updates.lastName ?? u.lastName,
      userType: updates.userType ?? u.userType,
      department: updates.department ?? u.department,
      position: updates.position ?? u.position,
      isActive: updates.isActive ?? u.isActive,
      permissions: Array.isArray(updates.permissions)
        ? updates.permissions
        : u.permissions,
      assignedClasses: Array.isArray(updates.assignedClasses)
        ? updates.assignedClasses
        : u.assignedClasses,
      assignedSubjects: Array.isArray(updates.assignedSubjects)
        ? updates.assignedSubjects
        : u.assignedSubjects,
      allowCrossClass: updates.allowCrossClass ?? u.allowCrossClass,
      password: updates.password ?? u.password,
    };
    return res.json({ success: true, message: "User updated successfully" });
  });

  // DELETE /api/users/:id (soft delete)
  router.delete("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const u = users.find((user) => user.id === id);
    if (!u) return res.json({ success: false, message: "User not found" });
    if (u.username === "admin")
      return res.json({
        success: false,
        message: "Cannot delete the admin user",
      });
    u.isActive = false;
    return res.json({ success: true, message: "User deleted successfully" });
  });

  return router;
}
