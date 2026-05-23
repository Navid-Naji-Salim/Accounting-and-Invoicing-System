import { useState } from "react";
import { ApiError } from "../api";

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-brand">
          <p className="eyebrow">Admin workspace</p>
          <h1>Accounting with a calm command center.</h1>
          <p>
            A focused books system for managing the first foundations: items,
            customers, and vendors.
          </p>
        </div>
        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage("");
            setIsSubmitting(true);

            const formData = new FormData(event.currentTarget);
            try {
              await onLogin(
                String(formData.get("email") ?? ""),
                String(formData.get("password") ?? ""),
              );
            } catch (error) {
              setMessage(error instanceof ApiError ? error.message : "Unable to log in.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div>
            <p className="eyebrow">Secure access</p>
            <h2>Admin login</h2>
            <p className="muted">No signup is available. Admin credentials are configured on the server.</p>
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" defaultValue="admin@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" defaultValue="admin12345" required />
          </div>
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Enter dashboard"}
          </button>
          <div className="message">{message}</div>
        </form>
      </section>
    </main>
  );
};
