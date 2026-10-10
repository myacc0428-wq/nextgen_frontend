import { lazy, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import OpeningIntro from "./components/intro/OpeningIntro";
import PremiumLogin from "./components/PremiumLogin";
import { apiRequest, readSession, writeSession, type ApiUser, type AuthSession, type Drama, type Genre } from "./lib/api";
const CustomerAccessGate = lazy(() => import("./components/customer/CustomerAccessGate"));
const DramaPage = lazy(() => import("./components/customer/DramaPage"));
const Sidebar = lazy(() => import("./components/Sidebar"));
const DashboardHeader = lazy(() => import("./components/DashboardHeader"));
const StatsGrid = lazy(() => import("./components/StatsGrid"));
const ContentSection = lazy(() => import("./components/ContentSection"));
const SubscriberSection = lazy(() => import("./components/SubscriberSection"));

type Episode = { id: string; title?: string; seriesTitle?: string; genre?: string; contentType?: string; thumbnailUrl?: string; isPublished?: boolean; videoUrl?: string; description?: string };
type Subscriber = { id: string; email?: string; name?: string; accountStatus?: string; subscriptionStatus?: string; createdAt?: string; subscriptionRequestedAt?: string; subscriptionExpiresAt?: string };
const toEpisode = (drama: Drama): Episode => ({ id: drama.id, title: drama.name, seriesTitle: drama.name, genre: drama.genre, contentType: "Drama", isPublished: true, videoUrl: drama.url, description: drama.description });
const formatTimestamp = (value: unknown) => value ? new Date(String(value)).toLocaleString() : "—";

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [checkingAuth, setCheckingAuth] = useState(Boolean(session));
  const [showIntro, setShowIntro] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("cinegen_intro_seen") !== "1");
  const [episodes, setEpisodes] = useState<Episode[]>([]); const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loginError, setLoginError] = useState(""); const [loading, setLoading] = useState(false); const [subscriberActionId, setSubscriberActionId] = useState<string | null>(null); const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<"dashboard" | "content" | "subscribers">("dashboard");
  const [managedGenres, setManagedGenres] = useState<Genre[]>([]);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const user = session?.user || null; const adminAllowed = user?.role === "admin";
  const navigateTo = (section: typeof activeSection) => { setActiveSection(section); document.getElementById(section === "dashboard" ? "dashboard-section" : section === "content" ? "content-section" : "subscribers-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const loadContent = async () => { try { const dramas = await apiRequest<Drama[]>("/api/dramas", {}, session?.accessToken); setEpisodes(dramas.map(toEpisode)); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load content."); } };
  const loadGenres = async () => { try { setManagedGenres(await apiRequest<Genre[]>("/api/genres")); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load genres."); } };
  const loadSubscribers = async () => { if (!adminAllowed || !session) return; try { const users = await apiRequest<Array<ApiUser & { createdAt: string }>>("/api/auth/users?role=users", {}, session.accessToken); setSubscribers(users.map((item) => ({ ...item, accountStatus: item.hasPaidSubscription ? "active" : "pending", subscriptionStatus: item.hasPaidSubscription ? "active" : "pending", subscriptionRequestedAt: item.createdAt }))); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load subscribers."); } };
  useEffect(() => { if (!session) { setCheckingAuth(false); return; } void Promise.all([loadContent(), loadGenres(), loadSubscribers()]).finally(() => setCheckingAuth(false)); }, [session]);
  useEffect(() => { const onPopState = () => setPathname(window.location.pathname); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);

  const handleLogin = async (email: string, password: string) => { setLoading(true); setLoginError(""); try { const next = await apiRequest<AuthSession>("/api/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim(), password }) }); writeSession(next); setSession(next); } catch (error) { setLoginError(error instanceof Error ? error.message : "Login failed. Please try again."); } finally { setLoading(false); } };
  const handleCreateAccount = async (email: string, password: string) => { try { const name = email.trim().split("@")[0] || "CineGen User"; await apiRequest<AuthSession>("/api/auth/register", { method: "POST", body: JSON.stringify({ email: email.trim(), password, name }) }); return { success: true, message: "Account created successfully. You can now sign in." }; } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Unable to create the account." }; } };
  const handleForgotPassword = async () => ({ success: false, message: "Password reset is not available in the backend API yet." });
  const handleLogout = () => { writeSession(null); setSession(null); setEpisodes([]); setSubscribers([]); setMessage(""); };
  const handleAddDrama = async (name: string, description: string, genre: string, video: File) => { if (!session) throw new Error("Please sign in again."); const body = new FormData(); body.append("name", name); body.append("description", description); body.append("genre", genre); body.append("video", video); const drama = await apiRequest<Drama>("/api/dramas", { method: "POST", body }, session.accessToken); setEpisodes((current) => [toEpisode(drama), ...current]); setMessage("Drama added to Content."); };
  const handleCreateGenre = async (name: string) => { if (!session) throw new Error("Please sign in again."); const genre = await apiRequest<Genre>("/api/genres", { method: "POST", body: JSON.stringify({ name }) }, session.accessToken); setManagedGenres((current) => [...current, genre].sort((a, b) => a.name.localeCompare(b.name))); return genre; };
  const handleSubscriberDecision = async (id: string, decision: "approve" | "reject") => { if (decision === "reject" || !session) { setMessage("The backend currently supports approval only."); return; } setSubscriberActionId(id); try { await apiRequest(`/api/auth/users/${id}/subscription`, { method: "PATCH" }, session.accessToken); setMessage("Subscriber approved successfully."); await loadSubscribers(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update subscriber."); } finally { setSubscriberActionId(null); } };
  const pendingSubscribers = subscribers.filter((item) => item.subscriptionStatus === "pending"); const activeSubscribers = subscribers.filter((item) => item.subscriptionStatus === "active");

  if (showIntro) return <OpeningIntro onComplete={() => { sessionStorage.setItem("cinegen_intro_seen", "1"); setShowIntro(false); }} />;
  if (checkingAuth) return <div className="loading-screen"><div className="loading-card"><RefreshCw size={28} className="spin" /><span>Checking CineGen access...</span></div></div>;
  if (!user) return <PremiumLogin loginError={loginError} loading={loading} onSubmit={handleLogin} onForgotPassword={handleForgotPassword} onCreateAccount={handleCreateAccount} />;
  const dramaMatch = pathname.match(/^\/drama\/([^/]+)\/?$/);
  if (dramaMatch) return <DramaPage dramaId={decodeURIComponent(dramaMatch[1])} accessToken={session?.accessToken} onBack={() => { window.history.pushState({}, "", "/"); setPathname("/"); }} />;
  if (!adminAllowed) return <CustomerAccessGate user={user} accessToken={session!.accessToken} onLogout={handleLogout} />;
  return <div className="app-shell"><Sidebar activeSection={activeSection} onNavigate={navigateTo} pendingCount={pendingSubscribers.length} userEmail={user.email} onLogout={handleLogout} /><main className="dashboard"><DashboardHeader userEmail={user.email} />{message && <div className="success-box">{message}</div>}<StatsGrid totalContent={episodes.length} published={episodes.filter((episode) => episode.isPublished).length} pendingSubscribers={pendingSubscribers.length} activeSubscribers={activeSubscribers.length} /><ContentSection episodes={episodes} genres={managedGenres.map((genre) => genre.name)} onGenreChange={() => setMessage("Genre editing is not available in the drama API yet.")} onAddDrama={handleAddDrama} onCreateGenre={handleCreateGenre} /><SubscriberSection subscribers={subscribers} pendingCount={pendingSubscribers.length} actionId={subscriberActionId} onDecision={handleSubscriberDecision} formatTimestamp={formatTimestamp} /></main></div>;
}

export default App;
