"use client";

import React, { useState, useContext } from "react";
import styles from "@styles/login.module.css";
import { StatusMessage } from "@types";
import { useRouter } from "next/navigation";
import UserService from "@services/UserService";
import classNames from "classnames";
import { AuthContext } from "@context/AuthContext";
import Link from "next/link";
import { Role } from "@types";

const UserLoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [StatusMessage, setStatusMessage] = useState<StatusMessage[] | null>(
    null
  );
  const router = useRouter();

  const context = useContext(AuthContext);
  if (!context)
    throw new Error("UserLoginForm must be used within an AuthProvider");
  const { login } = context;

  const clearErrors = () => {
    setUsernameError(null);
    setPasswordError(null);
  };

  const validate = (): boolean => {
    let isValid = true;

    if (!username || username.trim() == "") {
      setUsernameError("Username is required");
      isValid = false;
    }

    if (!password || password.trim() == "") {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    clearErrors();

    if (!validate()) {
      return;
    }

    const unauthenticatedUser = {
      username: username,
      password,
      role: Role.USER,
    };
    try {
      const loggedInUser = await UserService.authenticate(unauthenticatedUser);
      setStatusMessage([
        {
          message: "login successful. redirecting to homepage...",
          type: "success",
        },
      ]);

      login(loggedInUser);

      if (
        loggedInUser?.role === Role.ADMIN ||
        loggedInUser?.role === Role.STAFF
      ) {
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else if (loggedInUser?.role === Role.USER) {
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      setStatusMessage([{ message: (error as Error).message, type: "error" }]);
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        {StatusMessage && (
          <div className="row">
            <ul className="list-none mb-3 mx-auto">
              {StatusMessage.map(({ message, type }, index) => (
                <li
                  key={index}
                  className={classNames({
                    "text-red-800": type === "error",
                    "text-green-800": type === "success",
                  })}
                >
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <label htmlFor="username" className={styles.inputLabel}>
          Username
        </label>
        <input
          type="text"
          id="username"
          className={styles.inputField}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {usernameError && <span className="text-red-800">{usernameError}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.inputLabel}>
          Password
        </label>
        <input
          type="password"
          id="password"
          className={styles.inputField}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <span className="text-red-800">{passwordError}</span>}
      </div>

      <button type="submit" className={styles.loginButton}>
        Login
      </button>

      <div className="text-center">
        <Link
          href="/signup"
          className="text-blue-700 hover:text-purple-800 underline transition-colors"
        >
          Don't have an account yet? Signup here
        </Link>
      </div>
    </form>
  );
};
export default UserLoginForm;
