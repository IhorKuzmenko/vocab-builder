"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Icon from "../Icon/Icon";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthResult = {
  name?: string;
  email?: string;
  message?: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const isRegister = mode === "register";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const title = isRegister ? "Register" : "Login";

  const description = isRegister
    ? "To start using our services, please fill out the registration form below. All fields are mandatory:"
    : "Please enter your login details to continue using our service:";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const payload = isRegister
      ? {
          name: String(formData.get("name") ?? "").trim(),
          email,
          password,
        }
      : {
          email,
          password,
        };

    try {
      const response = await fetch(
        isRegister ? "/api/auth/signup" : "/api/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as AuthResult;

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      router.replace("/dictionary");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

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
            minLength={2}
            required
            disabled={isLoading}
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
          disabled={isLoading}
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
            disabled={isLoading}
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

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : title}
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
