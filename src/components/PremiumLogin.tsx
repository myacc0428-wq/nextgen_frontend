import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { X } from "lucide-react";
import "./PremiumLogin.css";

type ActionResult = {
  success: boolean;
  message: string;
};

type PremiumLoginProps = {
  loginError: string;
  loading: boolean;
  onSubmit: (email: string, password: string) => void;
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
  { angle: -170, title: 'Midnight Stories' },
  { angle: -150, title: 'Hidden Hearts' },
  { angle: -130, title: 'Love in Seoul' },
  { angle: -110, title: 'Beyond Time' },
  { angle: -90, title: 'Neon Dreams' },
  { angle: -70, title: 'Destiny' },
  { angle: -50, title: 'Moonlight' },
  { angle: -30, title: 'Last Promise' },
  { angle: -10, title: 'Blue Summer' },
  { angle: 10, title: 'Secret Love' },
  { angle: 30, title: 'After Midnight' },
  { angle: 50, title: 'Golden Hour' },
  { angle: 70, title: 'Falling Stars' },
  { angle: 90, title: 'Parallel Hearts' },
  { angle: 110, title: 'Night Drive' },
  { angle: 130, title: 'First Kiss' },
  { angle: 150, title: 'Silent Ocean' },
  { angle: 170, title: 'Forever Us' },
];

export default function PremiumLogin({
  loginError,
  loading,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}: PremiumLoginProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNoticeOpen, setApprovalNoticeOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [dustBurst, setDustBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const [dustFall, setDustFall] = useState<{ x: number; y: number; id: number } | null>(null);
  const dustHoldTimer = useRef<number | null>(null);
  const dustPressing = useRef(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handleBackgroundPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(".premium-login-card, .premium-brand-zone, .premium-enter-chip, button, input, textarea, select, a")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    dustPressing.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDustBurst({ x, y, id: Date.now() });
    if (dustHoldTimer.current !== null) window.clearTimeout(dustHoldTimer.current);
    dustHoldTimer.current = window.setTimeout(() => {
      if (!dustPressing.current) return;
      setDustFall({ x, y, id: Date.now() });
    }, 320);
  };

  const handleBackgroundPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dustPressing.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setDustFall((current) => {
      if (!current) return current;
      return { ...current, x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
  };

  const handleBackgroundPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dustPressing.current = false;
    if (dustHoldTimer.current !== null) {
      window.clearTimeout(dustHoldTimer.current);
      dustHoldTimer.current = null;
    }
    setDustFall(null);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const showResult = (result: ActionResult) => {
    setActionSuccess(result.success);
    setActionMessage(result.message);
  };

  const openForgotPassword = () => {
    setForgotPasswordEmail(loginEmail);
    setForgotPasswordMessage("");
    setForgotPasswordSuccess(false);
    setForgotPasswordOpen(true);
  };

  const submitForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setForgotPasswordMessage("");
    setForgotPasswordLoading(true);

    try {
      const result = await onForgotPassword(
        forgotPasswordEmail,
      );

      setForgotPasswordSuccess(result.success);
      setForgotPasswordMessage(result.message);

      if (result.success) {
        setLoginEmail(forgotPasswordEmail.trim());
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const openCreateAccount = () => {
    setCreateEmail(loginEmail);
    setCreatePassword("");
    setCreateConfirm("");
    setActionMessage("");
    setCreateOpen(true);
  };
  const closeCreateAccount = useCallback(() => {
    setCreateOpen(false);
    window.requestAnimationFrame(() => createTriggerRef.current?.focus());
  }, []);
  useEffect(() => {
    if (!createOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCreateAccount();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [createOpen, closeCreateAccount]);
  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(loginEmail, loginPassword);
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
    <div className="premium-login-scene" onPointerDown={handleBackgroundPointerDown} onPointerMove={handleBackgroundPointerMove} onPointerUp={handleBackgroundPointerUp} onPointerCancel={handleBackgroundPointerUp}>
      <div className="premium-sky-glow" />
      <div className="premium-space-flight-effects" aria-hidden="true">
        <span className="premium-space-rocket premium-space-rocket-one">
          <span className="premium-space-rocket-body">
            <span className="premium-space-rocket-window" />
          </span>
          <span className="premium-space-rocket-flame" />
        </span>

        <span className="premium-space-rocket premium-space-rocket-two">
          <span className="premium-space-rocket-body">
            <span className="premium-space-rocket-window" />
          </span>
          <span className="premium-space-rocket-flame" />
        </span>

        <span className="premium-space-rocket premium-space-rocket-three">
          <span className="premium-space-rocket-body">
            <span className="premium-space-rocket-window" />
          </span>
          <span className="premium-space-rocket-flame" />
        </span>

        <span className="premium-space-shooting-star premium-space-star-one" />
        <span className="premium-space-shooting-star premium-space-star-two" />
        <span className="premium-space-shooting-star premium-space-star-three" />
        <span className="premium-space-shooting-star premium-space-star-four" />
        <span className="premium-space-shooting-star premium-space-star-five" />
      </div>
      {dustBurst && (
        <div className="premium-dust-burst" style={{ left: dustBurst.x, top: dustBurst.y }} aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => {
            const angle = (360 / 18) * index;
            const distance = 28 + ((index * 17) % 42);
            const size = 1.5 + (index % 3) * 0.7;
            const delay = (index % 4) * 12;
            return (
              <span
                key={`${dustBurst.id}-${index}`}
                className="premium-dust-particle"
                style={{
                  "--dust-angle": `${angle}deg`,
                  "--dust-distance": `${distance}px`,
                  "--dust-size": `${size}px`,
                  "--dust-delay": `${delay}ms`,
                } as CSSProperties}
              />
            );
          })}
        </div>
      )}



      {dustFall && (
        <div className="premium-dust-fall" style={{ left: dustFall.x, top: dustFall.y }} aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => {
            const offset = ((index * 19) % 80) - 40;
            const size = 1.5 + (index % 3) * 0.7;
            const delay = (index % 8) * 55;
            const drift = ((index * 23) % 50) - 25;
            return (
              <span
                key={`${dustFall.id}-${index}`}
                className="premium-dust-fall-particle"
                style={{
                  "--fall-offset": `${offset}px`,
                  "--fall-size": `${size}px`,
                  "--fall-delay": `${delay}ms`,
                  "--fall-drift": `${drift}px`,
                } as CSSProperties}
              />
            );
          })}
        </div>
      )}

      <div className="premium-poster-wall" aria-hidden="true">
        {posters.map((poster, index) => {
          const style: CSSProperties = {
            '--poster-angle': (index * 20) + 'deg',
            '--poster-counter-angle': -(index * 20) + 'deg',
          } as CSSProperties;

          return (
            <div
              key={poster.title}
              className={`premium-poster premium-poster-${index + 1}`}
              style={style}
            >
              <div className="premium-poster-topline"><span>CINEGEN ORIGINAL</span><b>HD</b></div><div className="premium-poster-copy"><strong>{poster.title}</strong><small>ROMANCE  �  DRAMA</small><em>? 8.7</em></div>
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
            draggable={false}
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

            <form onSubmit={handleLoginSubmit}>
              <div className="premium-field">
                <label htmlFor="premium-email">Email address</label>
                <input
                  id="premium-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="premium-field">
                <label htmlFor="premium-password">Password</label>
                <input
                  id="premium-password"
                  type="password"
                  placeholder="��������"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
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
                  onClick={openForgotPassword}
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
                {loading ? "Signing In..." : "Sign In ?"}
              </button>

              <div className="premium-signup">
                New to CineGen?
                <button
                  type="button"
                  className="premium-text-button premium-create-button"
                  ref={createTriggerRef}
                  onClick={openCreateAccount}
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <nav className="premium-legal-links" aria-label="CineGen information">
        <a href="/legal/about">About</a>
        <a href="/legal/privacy">Privacy</a>
        <a href="/legal/terms">Terms</a>
        <a href="/legal/contact">Contact</a>
        <a href="/legal/faq">FAQ</a>
      </nav>

      {forgotPasswordOpen && (
        <div
          className="premium-create-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setForgotPasswordOpen(false);
            }
          }}
        >
          <section
            className="premium-forgot-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
          >
            <button
              type="button"
              className="premium-create-close"
              onClick={() => setForgotPasswordOpen(false)}
              aria-label="Close password reset"
            >
              <X size={18} />
            </button>

            <div className="premium-create-icon premium-forgot-icon">
              ?
            </div>

            <h2 id="forgot-password-title">
              Reset your password
            </h2>

            <p>
              Enter the email address connected to your CineGen
              account and we'll send you a password reset link.
            </p>

            <form onSubmit={submitForgotPassword}>
              <div className="premium-field">
                <label htmlFor="forgot-password-email">
                  Email address
                </label>

                <input
                  id="forgot-password-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotPasswordEmail}
                  onChange={(event) =>
                    setForgotPasswordEmail(event.target.value)
                  }
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              {forgotPasswordMessage && (
                <div
                  className={
                    forgotPasswordSuccess
                      ? "premium-login-success"
                      : "premium-login-error"
                  }
                >
                  {forgotPasswordMessage}
                </div>
              )}

              <button
                type="submit"
                className="premium-signin-button premium-create-submit"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading
                  ? "Sending Reset Link..."
                  : "Send Reset Link ?"}
              </button>
            </form>
          </section>
        </div>
      )}
      {createOpen && (
        <div
          className="premium-create-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateAccount();
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
              onClick={closeCreateAccount}
              aria-label="Close create account"
            >
              <X size={18} />
            </button>

            <div className="premium-create-icon">?</div>

            <h2 id="create-account-title">
              Create your CineGen account
            </h2>

            <p>
              Create an account and submit your access request.
              Admin approval is required before streaming.
            </p>

            <form className="premium-create-form" onSubmit={handleCreateSubmit}>
              <div className="premium-field premium-create-email-field">
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
                  autoFocus
                  required
                />
              </div>

              <div className="premium-field premium-create-password-field">
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

              <div className="premium-field premium-create-confirm-field">
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
                {actionMessage === "Passwords do not match." && (
                  <div className="premium-login-error premium-create-field-error" role="alert">
                    {actionMessage}
                  </div>
                )}
              </div>

              {actionMessage && actionMessage !== "Passwords do not match." && (
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
                  : "Create Account"}
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
              ?
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












