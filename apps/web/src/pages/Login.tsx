import { Button, Form, Input } from "antd";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [emailOpen, setEmailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(params.get("error") || "");

  async function submit(values: { email: string; password: string }) {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/auth/login", values);
      navigate("/");
    } catch (caught: unknown) {
      const response = caught as { response?: { data?: { message?: string } } };
      setError(response.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <section className="login-panel">
        <div className="brand">
          <span className="mark">C</span>
          <strong>CommunityApp</strong>
        </div>
        <h1>The room, the list, and who sits with whom.</h1>
        <p>Members, groups, and seating, kept for the people who run the community.</p>
      </section>
      <section className="login-form">
        <div>
          <p className="eyebrow">Admin sign in</p>
          <h2>Welcome back</h2>
          <p className="lede">Use an approved email account. Google sign-in is temporarily disabled.</p>
          {error ? <div className="banner">{error}</div> : null}
          <button type="button" className="text-link email-toggle" onClick={() => setEmailOpen((open) => !open)}>
            {emailOpen ? "Hide email sign in" : "Sign in with email instead"}
          </button>
          {emailOpen ? (
            <Form layout="vertical" onFinish={submit} requiredMark={false}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input autoComplete="username" placeholder="you@community.org" />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password autoComplete="current-password" placeholder="Password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Sign in
              </Button>
            </Form>
          ) : null}
        </div>
      </section>
    </div>
  );
}
