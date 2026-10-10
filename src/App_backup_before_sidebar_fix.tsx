import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Check,
  Film,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { auth, db } from "./lib/firebase";

type Episode = {
  id: string;
  title?: string;
  seriesTitle?: string;
  genre?: string;
  episodeNumber?: number;
  contentType?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  isAdminEntry?: boolean;
};

type Subscriber = {
  id: string;
  email?: string;
  accountStatus?: string;
  subscriptionStatus?: string;
  approvedBy?: string;
  approvedAt?: any;
  createdAt?: any;
  subscriptionRequestedAt?: any;
};

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Documentary",
];

function formatTimestamp(value: any) {
  if (!value) return "—";

  try {
    if (typeof value.toDate === "function") {
      return value.toDate().toLocaleString();
    }

    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriberActionId, setSubscriberActionId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setAdminAllowed(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const isAdmin =
          currentUser.uid === "pxxnt9iRPkVCabOdgjkAGuuTN692";

        console.log("CINEGEN ADMIN CHECK:", {
          uid: currentUser.uid,
          email: currentUser.email,
          isAdmin,
        });

        if (isAdmin) {
          setAdminAllowed(true);
          setLoginError("");
        } else {
          setAdminAllowed(false);
          await signOut(auth);
          setLoginError("This account does not have Admin access.");
        }
      } catch (error) {
        console.error(error);
        setAdminAllowed(false);
        setLoginError("Unable to verify Admin access.");
      }

      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!adminAllowed) {
      setEpisodes([]);
      return;
    }

    const episodesQuery = query(
      collection(db, "episodes"),
      where("isAdminEntry", "==", true)
    );

    const unsubscribe = onSnapshot(
      episodesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Episode, "id">),
        }));

        setEpisodes(data);
      },
      (error) => {
        console.error(error);
        setMessage("Unable to load Admin content.");
      }
    );

    return unsubscribe;
  }, [adminAllowed]);

  useEffect(() => {
    if (!adminAllowed) {
      setSubscribers([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Subscriber, "id">),
        }));

        setSubscribers(data);
      },
      (error) => {
        console.error(error);
        setMessage("Unable to load subscribers.");
      }
    );

    return unsubscribe;
  }, [adminAllowed]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoginError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      console.error(error);
      setLoginError(
        error?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMessage("");
  };

  const handleGenreChange = async (episodeId: string, genre: string) => {
    try {
      await updateDoc(doc(db, "episodes", episodeId), {
        genre,
      });

      setMessage(`Genre updated to ${genre}.`);
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update genre.");
    }
  };

  const handleSubscriberDecision = async (
    subscriberId: string,
    decision: "approve" | "reject"
  ) => {
    setSubscriberActionId(subscriberId);
    setMessage("");

    try {
      if (decision === "approve") {
        await updateDoc(doc(db, "users", subscriberId), {
          accountStatus: "active",
          subscriptionStatus: "active",
          approvedAt: serverTimestamp(),
          approvedBy: user?.email || "Admin",
        });

        setMessage("Subscriber approved successfully.");
      } else {
        await updateDoc(doc(db, "users", subscriberId), {
          accountStatus: "rejected",
          subscriptionStatus: "rejected",
        });

        setMessage("Subscriber rejected.");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage(
        decision === "approve"
          ? "Failed to approve subscriber."
          : "Failed to reject subscriber."
      );
    } finally {
      setSubscriberActionId(null);
    }
  };

  const pendingSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.accountStatus === "pending" ||
      subscriber.subscriptionStatus === "pending"
  );

  const activeSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.accountStatus === "active" &&
      subscriber.subscriptionStatus === "active"
  );

  if (checkingAuth) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <RefreshCw size={28} className="spin" />
          <span>Checking Admin access...</span>
        </div>
      </div>
    );
  }

  if (!user || !adminAllowed) {
    return (
      <div className="login-page">
        <div className="login-panel">
          <div className="brand-icon">
            <Film size={32} />
          </div>

          <div className="brand-text">
            <h1>CineGen Digital</h1>
            <p>Web Admin</p>
          </div>

          <div className="login-divider" />

          <h2>Admin Login</h2>
          <p className="login-description">
            Sign in with your CineGen administrator account.
          </p>

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {loginError && <div className="error-box">{loginError}</div>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>

          <div className="security-note">
            <ShieldCheck size={17} />
            <span>Admin access is verified through Firebase.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon small">
            <Film size={22} />
          </div>
          <div>
            <strong>CineGen</strong>
            <span>Digital Admin</span>
          </div>
        </div>

        <nav>
          <div className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </div>

          <div className="nav-item">
            <PlayCircle size={19} />
            Content
          </div>

          <div className="nav-item">
            <Users size={19} />
            Subscribers
            {pendingSubscribers.length > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  minWidth: 22,
                  height: 22,
                  padding: "0 7px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: "#f59e0b",
                  color: "#111827",
                }}
              >
                {pendingSubscribers.length}
              </span>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <UserCircle size={20} />
            <span>{user.email}</span>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">ADMIN CONTROL CENTER</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Manage the CineGen content currently registered for Admin.
            </p>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            Firebase Connected
          </div>
        </header>

        {message && <div className="success-box">{message}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Film size={21} />
            </div>
            <div>
              <span>Admin Entries</span>
              <strong>{episodes.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <PlayCircle size={21} />
            </div>
            <div>
              <span>Published</span>
              <strong>
                {episodes.filter((episode) => episode.isPublished).length}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={21} />
            </div>
            <div>
              <span>Pending Subscribers</span>
              <strong>{pendingSubscribers.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ShieldCheck size={21} />
            </div>
            <div>
              <span>Active Subscribers</span>
              <strong>{activeSubscribers.length}</strong>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="content-header">
            <div>
              <h2>CineGen Content</h2>
              <p>
                Admin entries from Firestore. Series initially use their Admin
                entry before additional episodes are loaded.
              </p>
            </div>
          </div>

          {episodes.length === 0 ? (
            <div className="empty-state">
              <Film size={34} />
              <h3>No Admin entries yet</h3>
              <p>
                Content will appear here when Bunny content is synced into the
                CineGen Admin system.
              </p>
            </div>
          ) : (
            <div className="content-table-wrap">
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Type</th>
                    <th>Genre</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {episodes.map((episode) => (
                    <tr key={episode.id}>
                      <td>
                        <div className="content-cell">
                          {episode.thumbnailUrl ? (
                            <img
                              src={episode.thumbnailUrl}
                              alt=""
                              className="thumbnail"
                            />
                          ) : (
                            <div className="thumbnail placeholder">
                              <Film size={20} />
                            </div>
                          )}

                          <div>
                            <strong>
                              {episode.seriesTitle ||
                                episode.title ||
                                "Untitled"}
                            </strong>
                            <span>
                              {episode.episodeNumber
                                ? `EP${episode.episodeNumber}`
                                : episode.contentType || "Content"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{episode.contentType || "—"}</td>

                      <td>
                        <select
                          value={episode.genre || ""}
                          onChange={(event) =>
                            handleGenreChange(episode.id, event.target.value)
                          }
                        >
                          <option value="">Select genre</option>
                          {GENRES.map((genre) => (
                            <option key={genre} value={genre}>
                              {genre}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <span
                          className={
                            episode.isPublished
                              ? "status-badge published"
                              : "status-badge draft"
                          }
                        >
                          {episode.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="content-header">
            <div>
              <h2>Subscriber Approval</h2>
              <p>
                Review accounts requesting access to CineGen Digital.
              </p>
            </div>

            <div className="status-pill">
              <span className="status-dot" />
              {pendingSubscribers.length} Pending
            </div>
          </div>

          {subscribers.length === 0 ? (
            <div className="empty-state">
              <Users size={34} />
              <h3>No subscribers yet</h3>
              <p>
                Subscriber requests will appear here when users create their
                accounts.
              </p>
            </div>
          ) : (
            <div className="content-table-wrap">
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Account Status</th>
                    <th>Subscription</th>
                    <th>Requested</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {subscribers.map((subscriber) => {
                    const isPending =
                      subscriber.accountStatus === "pending" ||
                      subscriber.subscriptionStatus === "pending";

                    const isProcessing =
                      subscriberActionId === subscriber.id;

                    return (
                      <tr key={subscriber.id}>
                        <td>
                          <div className="content-cell">
                            <div className="thumbnail placeholder">
                              <UserCircle size={20} />
                            </div>

                            <div>
                              <strong>
                                {subscriber.email || "No email"}
                              </strong>
                              <span>
                                User ID: {subscriber.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              subscriber.accountStatus === "active"
                                ? "status-badge published"
                                : subscriber.accountStatus === "rejected"
                                  ? "status-badge draft"
                                  : "status-badge draft"
                            }
                          >
                            {subscriber.accountStatus || "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              subscriber.subscriptionStatus === "active"
                                ? "status-badge published"
                                : "status-badge draft"
                            }
                          >
                            {subscriber.subscriptionStatus || "—"}
                          </span>
                        </td>

                        <td>
                          {formatTimestamp(
                            subscriber.subscriptionRequestedAt ||
                              subscriber.createdAt
                          )}
                        </td>

                        <td>
                          {isPending ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleSubscriberDecision(
                                    subscriber.id,
                                    "approve"
                                  )
                                }
                                disabled={isProcessing}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  border: 0,
                                  borderRadius: 8,
                                  padding: "8px 12px",
                                  cursor: isProcessing
                                    ? "not-allowed"
                                    : "pointer",
                                  fontWeight: 600,
                                  background: "#16a34a",
                                  color: "#fff",
                                  opacity: isProcessing ? 0.6 : 1,
                                }}
                              >
                                <Check size={16} />
                                {isProcessing ? "Processing..." : "Approve"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSubscriberDecision(
                                    subscriber.id,
                                    "reject"
                                  )
                                }
                                disabled={isProcessing}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  border: 0,
                                  borderRadius: 8,
                                  padding: "8px 12px",
                                  cursor: isProcessing
                                    ? "not-allowed"
                                    : "pointer",
                                  fontWeight: 600,
                                  background: "#dc2626",
                                  color: "#fff",
                                  opacity: isProcessing ? 0.6 : 1,
                                }}
                              >
                                <X size={16} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="status-badge">
                              {subscriber.subscriptionStatus === "active"
                                ? "Approved"
                                : "Processed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
