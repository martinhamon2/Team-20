import React from 'react';
import UserSignupForm from "@components/users/UserSignupForm";
import styles from '@styles/login.module.css';

export default async function Signup() {
  return (
    <main className={styles.loginMain}>
      <div className={styles.loginContainer}>
        <h1 className={`${styles.loginTitle} pageTitle`}>Signup</h1>
        <UserSignupForm/>
      </div>
    </main>
  );
}