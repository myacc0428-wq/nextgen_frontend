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
  where,
  updateDoc,
} from "firebase/firestore";
import {
  Film,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  UserCircle,
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
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
              <ShieldCheck size={21} />
            </div>
            <div>
              <span>Access</span>
              <strong>Admin</strong>
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
      </main>
    </div>
  );
}

export default App;






