"use client";

import React, { useState, useContext } from "react";
import styles from "@styles/login.module.css";
import { StatusMessage, Role } from "@types";
import { useRouter } from "next/navigation";
import UserService from "@services/UserService";
import classNames from "classnames";
import { AuthContext } from "@context/AuthContext";

interface TwoFactorFormProps {
  username: string;
  onBack: () => void;
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ username, onBack }) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const context = useContext(AuthContext);
  if (!context)
    throw new Error("TwoFactorForm must be used within an AuthProvider");
  const { login } = context;

  const clearErrors = () => {
    setCodeError(null);
  };

  const validate = (): boolean => {
    let isValid = true;

    if (!code || code.trim() === "") {
      setCodeError("Verification code is required");
      isValid = false;
    } else if (code.length !== 6 || !/^\d+$/.test(code)) {
      setCodeError("Code must be exactly 6 digits");
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

    setIsLoading(true);
    try {
      const loggedInUser = await UserService.verify2FA(username, code);
      setStatusMessage([
        {
          message: "2FA verification successful. Redirecting...",
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-4">Two-Factor Authentication</h2>
      
      <div className={styles.inputGroup}>
        {statusMessage && (
          <div className="row">
            <ul className="list-none mb-3 mx-auto">
              {statusMessage.map(({ message, type }, index) => (
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

        <p className="text-sm text-gray-600 mb-4 text-center">
          We've sent a 6-digit verification code to your email. Please enter it below.
        </p>

        <label htmlFor="code" className={styles.inputLabel}>
          Verification Code
        </label>
        <input
          type="text"
          id="code"
          className={styles.inputField}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          disabled={isLoading}
        />
        {codeError && <span className="text-red-800">{codeError}</span>}
      </div>

      <button 
        type="submit" 
        className={styles.loginButton}
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </button>

      <div className="flex flex-col gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 underline transition-colors text-sm"
          disabled={isLoading}
        >
          Back to login
        </button>
      </div>
    </form>
  );
};

export default TwoFactorForm;
