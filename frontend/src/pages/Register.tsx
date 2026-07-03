// pages/Register.tsx
import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();

  const isMismatch = password && confirmPassword && password !== confirmPassword;
  const isWeak = password && password.length < 6;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await registerUser(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Account might exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: theme.colors.background,
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}20 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.colors.secondary}20 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div 
          className="rounded-2xl shadow-2xl p-8 backdrop-blur-sm border transition-all duration-300"
          style={{
            background: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: `0 30px 80px ${theme.colors.shadow}`,
          }}
        >
          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h1 className="text-3xl font-bold mb-2" style={{ 
              color: theme.colors.text,
              fontFamily: theme.typography.headingFont,
            }}>
              Create Account
            </h1>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Start your knowledge journey today
            </p>
          </div>

          {error && (
            <div 
              className="mb-6 p-4 rounded-xl border-l-4 transition-all duration-300"
              style={{
                background: `${theme.colors.error}15`,
                borderColor: theme.colors.error,
                color: theme.colors.error,
              }}
            >
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                style={{
                  background: theme.colors.input,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                Create Password
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: theme.colors.input,
                    borderColor: isWeak ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl transition-colors duration-200"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              {isWeak && (
                <p className="text-xs mt-1" style={{ color: theme.colors.error }}>
                  ⚠ Password must be at least 6 characters
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                Confirm Password
              </label>
              <input 
                id="confirmPassword"
                type={showPassword ? "text" : "password"} 
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                style={{
                  background: theme.colors.input,
                  borderColor: isMismatch ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                }}
                placeholder="••••••••"
              />
              {isMismatch && (
                <p className="text-xs mt-1" style={{ color: theme.colors.error }}>
                  ⚠ Passwords do not match
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !!isMismatch || !!isWeak}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{
                background: loading || isMismatch || isWeak ? theme.colors.muted : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textSecondary }}>
            Already have an account?{" "}
            <Link 
              to="/" 
              className="font-semibold transition-colors duration-200 hover:underline"
              style={{ color: theme.colors.primary }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}