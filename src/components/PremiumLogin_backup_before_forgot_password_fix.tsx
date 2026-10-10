import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import "./PremiumLogin.css";

type ActionResult = {
  success: boolean;
  message: string;
};

type PremiumLoginProps = {
  email: string;
  password: string;
  loginError: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword: (email: string) => Promise<ActionResult>;
  onCreateAccount: (
    email: string,
    password: string,
  ) => Promise<ActionResult>;
};

const particles = Array.from({ length: 26 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${20 + ((index * 17) % 72)}%`,
  duration: `${4 + (index % 8)}s`,
  delay: `-${(index * 3) % 8}s`,
  scale: 0.55 + (index % 5) * 0.2,
}));

const posters = [
  { left: "2%", top: "8%", width: 145, height: 205, rotate: -8, title: "Midnight Stories" },
  { left: "7%", bottom: "22%", width: 150, height: 215, rotate: 6, title: "Hidden Hearts" },
  { right: "5%", top: "9%", width: 150, height: 210, rotate: 8, title: "Love in Seoul" },
  { right: "7%", bottom: "21%", width: 155, height: 220, rotate: -7, title: "Beyond Time" },
  { left: "19%", top: "4%", width: 100, height: 145, rotate: 4, title: "Neon" },
  { right: "19%", top: "4%", width: 105, height: 150, rotate: -5, title: "Destiny" },
];

export default function PremiumLogin({
  email,
  password,
  loginError,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}: PremiumLoginProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNoticeOpen, setApprovalNoticeOpen] = useState(false);

  const showResult = (result: ActionResult) => {
    setActionSuccess(result.success);
    setActionMessage(result.message);
  };

  const handleForgotPassword = async () => {
    setActionMessage("");
    setActionLoading(true);

    try {
      showResult(await onForgotPassword(email));
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateAccount = () => {
    setCreateEmail(email);
    setCreatePassword("");
    setCreateConfirm("");
    setActionMessage("");
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setActionMessage("");

    if (createPassword !== createConfirm) {
      showResult({
        success: false,
        message: "Passwords do not match.",
      });
      return;
    }

    setActionLoading(true);

    try {
      const result = await onCreateAccount(
        createEmail,
        createPassword,
      );

      showResult(result);

      if (result.success) {
        setCreateOpen(false);
        setCreatePassword("");
        setCreateConfirm("");
        setActionMessage("");
        setApprovalNoticeOpen(true);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="premium-login-scene">
      <div className="premium-sky-glow" />

      <div className="premium-poster-wall" aria-hidden="true">
        {posters.map((poster, index) => {
          const style: CSSProperties = {
            left: poster.left,
            right: poster.right,
            top: poster.top,
            bottom: poster.bottom,
            width: `${poster.width}px`,
            height: `${poster.height}px`,
            transform: `rotate(${poster.rotate}deg)`,
          };

          return (
            <div
              key={poster.title}
              className={`premium-poster premium-poster-${index + 1}`}
              style={style}
            >
              <span>{poster.title}</span>
            </div>
          );
        })}
      </div>

      <div className="premium-ribbon premium-ribbon-one" />
      <div className="premium-ribbon premium-ribbon-two" />
      <div className="premium-floor" />

      <div className="premium-particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <i
            key={index}
            className="premium-particle"
            style={
              {
                left: particle.left,
                top: particle.top,
                "--particle-duration": particle.duration,
                "--particle-delay": particle.delay,
                "--particle-scale": particle.scale,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="premium-enter-chip">CineGen Digital</div>

      <div className="premium-center-stage">
        <div className="premium-brand-zone">
          <img
            src="/images/cinegen-logo.png"
            className="premium-logo-img"
            alt="CineGen Digital"
          />
          <div className="premium-slogan">Stories That Move You</div>
        </div>

        <section className="premium-login-card">
          <div className="premium-card-inner">
            <h1 className="premium-card-title">Welcome back</h1>

            <p className="premium-card-sub">
              Sign in to continue your CineGen journey.
            </p>

            <form onSubmit={onSubmit}>
              <div className="premium-field">
                <label htmlFor="premium-email">Email address</label>
                <input
                  id="premium-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    onEmailChange(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className="premium-field">
                <label htmlFor="premium-password">Password</label>
                <input
                  id="premium-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    onPasswordChange(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="premium-login-row">
                <label className="premium-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="premium-text-button"
                  onClick={handleForgotPassword}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Sending..."
                    : "Forgot password?"}
                </button>
              </div>

              {loginError && (
                <div className="premium-login-error">
                  {loginError}
                </div>
              )}

              {actionMessage && (
                <div
                  className={
                    actionSuccess
                      ? "premium-login-success"
                      : "premium-login-error"
                  }
                >
                  {actionMessage}
                </div>
              )}

              <button
                className="premium-signin-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>

              <div className="premium-signup">
                New to CineGen?
                <button
                  type="button"
                  className="premium-text-button premium-create-button"
                  onClick={openCreateAccount}
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {createOpen && (
        <div
          className="premium-create-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreateOpen(false);
            }
          }}
        >
          <section
            className="premium-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-account-title"
          >
            <button
              type="button"
              className="premium-create-close"
              onClick={() => setCreateOpen(false)}
              aria-label="Close create account"
            >
              <X size={18} />
            </button>

            <div className="premium-create-icon">✦</div>

            <h2 id="create-account-title">
              Create your CineGen account
            </h2>

            <p>
              Create an account and submit your access request.
              Admin approval is required before streaming.
            </p>

            <form onSubmit={handleCreateSubmit}>
              <div className="premium-field">
                <label htmlFor="create-email">Email address</label>
                <input
                  id="create-email"
                  type="email"
                  placeholder="you@example.com"
                  value={createEmail}
                  onChange={(event) =>
                    setCreateEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className="premium-field">
                <label htmlFor="create-password">Password</label>
                <input
                  id="create-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={createPassword}
                  onChange={(event) =>
                    setCreatePassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="premium-field">
                <label htmlFor="create-confirm">
                  Confirm password
                </label>
                <input
                  id="create-confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={createConfirm}
                  onChange={(event) =>
                    setCreateConfirm(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              {actionMessage && (
                <div
                  className={
                    actionSuccess
                      ? "premium-login-success"
                      : "premium-login-error"
                  }
                >
                  {actionMessage}
                </div>
              )}

              <button
                type="submit"
                className="premium-signin-button premium-create-submit"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Creating Account..."
                  : "Create Account →"}
              </button>
            </form>
          </section>
        </div>
      )}
      {approvalNoticeOpen && (
        <div
          className="premium-approval-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setApprovalNoticeOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-notice-title"
        >
          <section className="premium-approval-notice">
            <div className="premium-approval-icon">
              ✓
            </div>

            <span className="premium-approval-eyebrow">
              CINEGEN DIGITAL
            </span>

            <h2 id="approval-notice-title">
              Account Created Successfully
            </h2>

            <p>
              Your account has been created and is now
              <strong> waiting for Admin approval.</strong>
            </p>

            <div className="premium-approval-status">
              <span className="premium-approval-dot" />
              <span>Pending Admin Approval</span>
            </div>

            <p className="premium-approval-note">
              Once your access is approved, you can sign in
              and start watching CineGen content.
            </p>

            <button
              type="button"
              className="premium-approval-button"
              onClick={() => setApprovalNoticeOpen(false)}
            >
              Okay, Got It
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

