"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import Icon from "../Icon/Icon";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const title = isRegister ? "Register" : "Login";

  const description = isRegister
    ? "To start using our services, please fill out the registration form below. All fields are mandatory:"
    : "Please enter your login details to continue using our service:";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (isRegister && !name) {
      setMessage("Please enter your name.");
      return;
    }

    if (!email || !password) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setMessage("Form is ready. API integration is the next step.");
  };

  return (
    <section className={styles.formSection}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {isRegister && (
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="Name"
            aria-label="Name"
            autoComplete="name"
            required
          />
        )}

        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          required
        />

        <div className={styles.passwordField}>
          <input
            className={styles.passwordInput}
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />

          <button
            type="button"
            className={styles.eyeButton}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <Icon name={showPassword ? "eye" : "eye-off"} />
          </button>
        </div>

        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}

        <button type="submit" className={styles.submitButton}>
          {title}
        </button>
      </form>

      <Link
        href={isRegister ? "/login" : "/register"}
        className={styles.switchLink}
      >
        {isRegister ? "Login" : "Register"}
      </Link>
    </section>
  );
}
