const db = require("../db/db");
const bcrypt = require("bcryptjs");

const userSignUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Account Created!" });
  } catch (error) {
    console.error("Signup error:", error);

    // Specific error handling for different database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Email already exists",
        details: "An account with this email address is already registered"
      });
    }

    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        error: "Database table not found",
        details: "The users table does not exist. Please contact support."
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        error: "Database schema error",
        details: "Invalid column name in database query"
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Database connection failed",
        details: "Unable to connect to the database server"
      });
    }

    if (error.code === "ETIMEDOUT" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({
        error: "Database connection timeout",
        details: "The database connection timed out. Please try again."
      });
    }

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        error: "Database authentication failed",
        details: "Database access denied. Please contact support."
      });
    }

    if (error.code === "ER_TOO_MANY_USER_CONNECTIONS") {
      return res.status(503).json({
        error: "Database overload",
        details: "Too many database connections. Please try again later."
      });
    }

    // Generic database error
    res.status(500).json({
      error: "Database error during signup",
      details: "An unexpected error occurred while creating your account"
    });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "No account found with this email address"
      });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "The password you entered is incorrect"
      });
    }

    res.json({
      message: "Login successful!",
      userId: user.id
    });
  } catch (error) {
    console.error("Login error:", error);

    // Specific error handling for different database errors
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        error: "Database table not found",
        details: "The users table does not exist. Please contact support."
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        error: "Database schema error",
        details: "Invalid column name in database query"
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Database connection failed",
        details: "Unable to connect to the database server"
      });
    }

    if (error.code === "ETIMEDOUT" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({
        error: "Database connection timeout",
        details: "The database connection timed out. Please try again."
      });
    }

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        error: "Database authentication failed",
        details: "Database access denied. Please contact support."
      });
    }

    if (error.code === "ER_TOO_MANY_USER_CONNECTIONS") {
      return res.status(503).json({
        error: "Database overload",
        details: "Too many database connections. Please try again later."
      });
    }

    // Generic server error
    res.status(500).json({
      error: "Server error during login",
      details: "An unexpected error occurred while processing your login"
    });
  }
};

module.exports = { userSignUp, userLogin };
