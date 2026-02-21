import React from 'react';
import UserLoginForm from "@components/users/UserLoginForm";
import styles from '@styles/login.module.css';

export default async function Login() {
  return (
    <main className={styles.loginMain}>
      <div className={styles.loginContainer}>
        <h1 className={`${styles.loginTitle} pageTitle`}>Login</h1>
        <UserLoginForm />
      </div>
    </main>
  );
}