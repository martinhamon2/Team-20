"use client";

import React, {useState, useContext} from "react";
import styles from "@styles/login.module.css";
import {Role, StatusMessage} from "@types";
import {useRouter} from "next/navigation";
import UserService from "@services/UserService";
import classNames from "classnames";
import {AuthContext} from "@context/AuthContext";

const UserSignupForm: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [StatusMessage, setStatusMessage] = useState<StatusMessage[] | null>(null);
	const router = useRouter();
	const [longPassword1, setlongPassword1] = useState<boolean>(false);

	const clearErrors = (option?: string) => {
		if (option == "") {
			setUsernameError(null);
			setPasswordError(null);
		}
		if (option == "username") {
			setUsernameError(null);
		}
		if (option == "password") {
			setPasswordError(null);
		}
	};

	const validate = (): boolean => {
		let isValid = true;

		if (!username || username.trim() == "") {
			setUsernameError("Username is required");
			isValid = false;
		}

		if (!password1 || password1.trim() == "") {
			setPasswordError("Password is required");
			isValid = false;
		} else if (password1.length < 5) {
			setPasswordError("Password is too short. Must be at least 5 characters long");
			isValid = false;
		} else if (!password2 || password2.trim() == "") {
			setPasswordError("Please retype your password");
			isValid = false;
		} else if (password1 !== password2 && longPassword1) {
			setPasswordError("Passwords do not match");
			isValid = false;
		}

		return isValid;
	};

	const context = useContext(AuthContext);
	if (!context) throw new Error("UserLoginForm must be used within an AuthProvider");
	const {login} = context;

	const handleSubmit = async (event: {preventDefault: () => void}) => {
		event.preventDefault();
		clearErrors();

		if (!validate()) {
			return;
		}

		const user = {username: username, password: password1, role: Role.USER};
		try {
			await UserService.signup(user);

			setStatusMessage([
				{
					message: "Signup successful! Redirecting to login...",
					type: "success",
				},
			]);

			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (error) {
			setStatusMessage([{message: (error as Error).message, type: "error"}]);
		}
	};

	const showRetype = (password: string) => {
		if (password.length >= 5) {
			setlongPassword1(true);
			clearErrors("password");
		} else {
			setlongPassword1(false);
			setPassword2("");
		}
	};

	return (
		<form className={styles.loginForm} onSubmit={handleSubmit}>
			<div className={styles.inputGroup}>
				{StatusMessage && (
					<div className="row">
						<ul className="list-none mb-3 mx-auto">
							{StatusMessage.map(({message, type}, index) => (
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
					Choose a username
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
					Choose a password
				</label>
				<input
					type="password"
					id="password"
					className={styles.inputField}
					placeholder="Enter your password"
					value={password1}
					onChange={(e) => {
						setPassword1(e.target.value);
						showRetype(e.target.value);
					}}
				/>
				{!longPassword1 && passwordError && <span className="text-red-800">{passwordError}</span>}
			</div>

			{longPassword1 && (
				<div className={styles.inputGroup}>
					<label htmlFor="password" className={styles.inputLabel}>
						Retype your password
					</label>
					<input
						type="password"
						id="password"
						className={styles.inputField}
						placeholder="Enter your password again"
						value={password2}
						onChange={(e) => setPassword2(e.target.value)}
					/>
					{passwordError && <span className="text-red-800">{passwordError}</span>}
				</div>
			)}

			<button type="submit" className={styles.loginButton}>
				Signup
			</button>
		</form>
	);
};
export default UserSignupForm;
