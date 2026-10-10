import CustomerDashboard from "./CustomerDashboard";

type GateUser = { email?: string | null; name?: string | null; displayName?: string | null; hasPaidSubscription?: boolean };
type Props = { user: GateUser; accessToken?: string; onLogout?: () => void };

export default function CustomerAccessGate({ user, accessToken, onLogout = () => undefined }: Props) {
  if (user.hasPaidSubscription) return <CustomerDashboard user={user} accessToken={accessToken} onLogout={onLogout} />;
  return <div className="customer-gate customer-gate-pending-only"><div className="customer-pending-overlay"><section className="customer-pending-notice" role="dialog" aria-modal="true" aria-labelledby="customer-pending-title"><div className="customer-pending-icon"><span>!</span></div><span className="customer-pending-eyebrow">CINEGEN DIGITAL</span><h2 id="customer-pending-title">Waiting for Approval</h2><p>Your account has been created successfully. Your CineGen access is currently waiting for administrator approval.</p><div className="customer-pending-status"><span className="customer-pending-dot" /><span>Pending Admin Approval</span></div><p className="customer-pending-note">You cannot access the streaming dashboard until your account has been approved.</p><button type="button" className="customer-pending-button" onClick={onLogout}>Return to Login</button></section></div></div>;
}
