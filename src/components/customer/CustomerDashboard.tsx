import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  History,
  Home,
  LogOut,
  Play,
  Plus,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import type { Drama, Genre } from "../../lib/api";
import { apiRequest } from "../../lib/api";
import "./customer-premium.css";

type Episode = {
  id: string;
  title?: string;
  seriesTitle?: string;
  genre?: string;
  episodeNumber?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  collectionId?: string;
  videoId?: string;
  isPublished?: boolean;
};

type Props = {
  user: { email?: string | null; name?: string | null; displayName?: string | null };
  accessToken?: string;
  onLogout?: () => void;
};

type NavKey =
  | "home"
  | "discover"
  | "list"
  | "continue"
  | "profile";

type SeriesItem = {
  key: string;
  title: string;
  genre: string;
  thumbnailUrl: string;
  episodes: Episode[];
};

type ProgressMap = Record<string, number>;

const SAVED_KEY = "cinegen_customer_saved_series";
const HISTORY_KEY = "cinegen_customer_watch_history";
const PROGRESS_KEY = "cinegen_customer_watch_progress";

const defaultGenres = [
  "All",
  "K-Drama",
  "Action",
  "Thriller",
  "Romance",
  "Comedy",
  "Fantasy",
  "Horror",
  "Anime",
];

function readArray(key: string): string[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(key) || "[]",
    );

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function readProgress(): ProgressMap {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PROGRESS_KEY) || "{}",
    );

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as ProgressMap;
    }

    return {};
  } catch {
    return {};
  }
}

function buildSeries(
  episodes: Episode[],
): SeriesItem[] {
  const map = new Map<string, SeriesItem>();

  for (const episode of episodes) {
    const title =
      (
        episode.seriesTitle ||
        episode.title ||
        "Untitled CineGen"
      ).trim() || "Untitled CineGen";

    const genre =
      (episode.genre || "Drama").trim() ||
      "Drama";

    const key =
      `${title.toLowerCase()}::${genre.toLowerCase()}`;

    const existing = map.get(key);

    if (existing) {
      existing.episodes.push(episode);

      if (
        !existing.thumbnailUrl &&
        episode.thumbnailUrl
      ) {
        existing.thumbnailUrl =
          episode.thumbnailUrl;
      }

      continue;
    }

    map.set(key, {
      key,
      title,
      genre,
      thumbnailUrl:
        episode.thumbnailUrl || "",
      episodes: [episode],
    });
  }

  return Array.from(map.values())
    .map((series) => ({
      ...series,
      episodes: [...series.episodes].sort(
        (a, b) =>
          (a.episodeNumber || 0) -
          (b.episodeNumber || 0),
      ),
    }))
    .sort((a, b) =>
      a.title.localeCompare(b.title),
    );
}

function CustomerDashboard({
  user,
  accessToken,
  onLogout,
}: Props) {
  const [episodes, setEpisodes] =
    useState<Episode[]>([]);

  const [activeNav, setActiveNav] =
    useState<NavKey>("home");

  const [selectedGenre, setSelectedGenre] =
    useState("All");
  const [availableGenres, setAvailableGenres] =
    useState<string[]>(defaultGenres);

  const [search, setSearch] = useState("");

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [apkModalOpen, setApkModalOpen] =
    useState(false);

  const [savedSeries, setSavedSeries] =
    useState<string[]>(() =>
      readArray(SAVED_KEY),
    );

  const [watchHistory, setWatchHistory] =
    useState<string[]>(() =>
      readArray(HISTORY_KEY),
    );

  const [watchProgress, setWatchProgress] =
    useState<ProgressMap>(() =>
      readProgress(),
    );

  const [heroIndex, setHeroIndex] =
    useState(0);

  // Playback is handled exclusively by DramaPage at /drama/:id.
  const [selectedSeries, setSelectedSeries] =
    useState<SeriesItem | null>(null);
  const [selectedEpisode, setSelectedEpisode] =
    useState<Episode | null>(null);
  const playerOpen = false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closePlayer = () => undefined;

  useEffect(() => {
    let active = true;
    const genreQuery = selectedGenre === "All" ? "" : `?genre=${encodeURIComponent(selectedGenre)}`;
    void apiRequest<Drama[]>(`/api/dramas${genreQuery}`, {}, accessToken)
      .then((dramas) => {
        if (!active) return;
        setEpisodes(dramas.map((drama) => ({
          id: drama.id,
          title: drama.name,
          seriesTitle: drama.name,
          genre: drama.genre,
          thumbnailUrl: drama.thumbnailUrl,
          videoUrl: drama.url,
          isPublished: true,
        })));
      })
      .catch((error) => console.error("CUSTOMER CONTENT ERROR:", error));
    return () => { active = false; };
  }, [accessToken, selectedGenre]);

  useEffect(() => {
    void apiRequest<Genre[]>("/api/genres", {}, accessToken)
      .then((items) => setAvailableGenres(["All", ...items.map((item) => item.name)]))
      .catch((error) => console.error("CUSTOMER GENRES ERROR:", error));
  }, [accessToken]);

  const allSeries = useMemo(
    () => buildSeries(episodes),
    [episodes],
  );

  const filteredSeries = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return allSeries.filter((series) => {
      const genreMatch =
        selectedGenre === "All" ||
        series.genre.toLowerCase() ===
          selectedGenre.toLowerCase();

      const searchMatch =
        value.length === 0 ||
        series.title
          .toLowerCase()
          .includes(value) ||
        series.genre
          .toLowerCase()
          .includes(value) ||
        series.episodes.some((episode) =>
          (episode.title || "")
            .toLowerCase()
            .includes(value),
        );

      return genreMatch && searchMatch;
    });
  }, [
    allSeries,
    selectedGenre,
    search,
  ]);

  const heroItems = useMemo(
    () => filteredSeries.slice(0, 6),
    [filteredSeries],
  );

  const popularSeries = useMemo(
    () => filteredSeries.slice(0, 8),
    [filteredSeries],
  );

  const trendingSeries = useMemo(() => {
    const later = filteredSeries.slice(
      8,
      16,
    );

    return later.length > 0
      ? later
      : filteredSeries.slice(0, 8);
  }, [filteredSeries]);

  const episodeMap = useMemo(
    () =>
      new Map(
        episodes.map((episode) => [
          episode.id,
          episode,
        ]),
      ),
    [episodes],
  );

  const continueWatching = useMemo(
    () =>
      watchHistory
        .map((id) => episodeMap.get(id))
        .filter(
          (episode): episode is Episode =>
            Boolean(episode),
        )
        .slice(0, 8),
    [watchHistory, episodeMap],
  );

  const featured =
    heroItems[heroIndex] || null;

  useEffect(() => {
    if (heroItems.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroIndex(
        (current) =>
          (current + 1) %
          heroItems.length,
      );
    }, 5000);

    return () =>
      window.clearInterval(timer);
  }, [heroItems.length]);

  useEffect(() => {
    if (
      heroItems.length > 0 &&
      heroIndex >= heroItems.length
    ) {
      setHeroIndex(0);
    }
  }, [
    heroIndex,
    heroItems.length,
  ]);

  const persistSaved = (
    values: string[],
  ) => {
    setSavedSeries(values);
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify(values),
    );
  };

  const toggleSaved = (
    seriesKey: string,
  ) => {
    const next = savedSeries.includes(
      seriesKey,
    )
      ? savedSeries.filter(
          (item) => item !== seriesKey,
        )
      : [...savedSeries, seriesKey];

    persistSaved(next);
  };

  const persistHistory = (
    values: string[],
  ) => {
    setWatchHistory(values);
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(values),
    );
  };

  const recordWatch = (
    episodeId: string,
  ) => {
    const next = [
      episodeId,
      ...watchHistory.filter(
        (id) => id !== episodeId,
      ),
    ].slice(0, 20);

    persistHistory(next);
  };

  const saveProgress = (
    episodeId: string,
    percent: number,
  ) => {
    const safe = Math.max(
      0,
      Math.min(
        100,
        Math.round(percent),
      ),
    );

    const next = {
      ...watchProgress,
      [episodeId]: safe,
    };

    setWatchProgress(next);

    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(next),
    );

    if (safe >= 3) {
      recordWatch(episodeId);
    }
  };

  const openSeries = (
    series: SeriesItem,
    episode?: Episode,
  ) => {
    const playable =
      episode ||
      series.episodes.find(
        (item) =>
          Boolean(
            item.videoUrl &&
              item.videoUrl.trim(),
          ),
      ) ||
      series.episodes[0] ||
      null;

    if (!playable) return;
    setSelectedSeries(series);
    setSelectedEpisode(playable);
    window.history.pushState({}, "", `/drama/${encodeURIComponent(playable.id)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const logout = onLogout || (() => undefined);

  const goTo = (key: NavKey) => {
    setActiveNav(key);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navItems: Array<{
    key: NavKey;
    label: string;
    icon: ReactNode;
  }> = [
    {
      key: "home",
      label: "Home",
      icon: <Home size={18} />,
    },
    {
      key: "discover",
      label: "Discover",
      icon: <Compass size={18} />,
    },
    {
      key: "list",
      label: "My List",
      icon: <Bookmark size={18} />,
    },
    {
      key: "continue",
      label: "Continue",
      icon: <History size={18} />,
    },
    {
      key: "profile",
      label: "Profile",
      icon: <User size={18} />,
    },
  ];

  return (
    <div className="cg-shell">
      <aside className="cg-sidebar">
        <div className="cg-brand">
          <img
            src="/images/cinegen-logo.png"
            alt="CineGen"
          />
        </div>

        <nav className="cg-side-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                activeNav === item.key
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo(item.key)
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="cg-sidebar-heading">
          BROWSE GENRES
        </div>

        <div className="cg-genres">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={
                selectedGenre === genre
                  ? "active"
                  : ""
              }
              onClick={() => {
                setSelectedGenre(genre);
                goTo("discover");
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="cg-sidebar-bottom">
          <button
            type="button"
            onClick={() =>
              goTo("profile")
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="cg-main">
        <header className="cg-header">
          <div className="cg-desktop-links">
            <button
              type="button"
              className={
                activeNav === "home"
                  ? "active"
                  : ""
              }
              onClick={() => goTo("home")}
            >
              Home
            </button>

            <button
              type="button"
              className={
                activeNav === "discover"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("discover")
              }
            >
              Discover
            </button>

            <button
              type="button"
              className={
                activeNav === "list"
                  ? "active"
                  : ""
              }
              onClick={() => goTo("list")}
            >
              My List
            </button>
          </div>

          <div className="cg-header-right">
            <button
              type="button"
              className="cg-install-app-button"
              onClick={() => setApkModalOpen(true)}
              title="Install CineGen Mobile App"
            >
              <Download size={17} />
              <span>Install Mobile App</span>
            </button>

            <button
              type="button"
              className="cg-header-icon"
              aria-label="Search"
              onClick={() =>
                setSearchOpen(
                  (value) => !value,
                )
              }
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              className="cg-header-icon"
              aria-label="Notifications"
              onClick={() =>
                setNotificationOpen(
                  (value) => !value,
                )
              }
            >
              <Bell size={19} />
              <i />
            </button>

            <button
              type="button"
              className="cg-user"
              onClick={() =>
                goTo("profile")
              }
            >
              <div className="cg-avatar">
                {(
                  user.name ||
                  user.email ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user.name ||
                    "CineGen User"}
                </strong>
                <small>
                  {user.email || ""}
                </small>
              </div>
            </button>
          </div>
        </header>

        {searchOpen && (
          <div className="cg-search-box">
            <Search size={18} />

            <input
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search dramas, series, or genres..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        )}

        {notificationOpen && (
          <div className="cg-notifications">
            <div>
              <strong>
                Notifications
              </strong>

              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(
                    false,
                  )
                }
              >
                <X size={15} />
              </button>
            </div>

            <p>
              You&apos;re all caught up.
            </p>
          </div>
        )}

        {activeNav === "home" && (
          <>
            {featured ? (
              <section className="cg-hero">
                <img
                  className="cg-hero-image"
                  src={
                    featured.thumbnailUrl
                  }
                  alt={featured.title}
                />

                <div className="cg-hero-overlay" />

                <button
                  type="button"
                  className="cg-hero-arrow left"
                  aria-label="Previous"
                  disabled={
                    heroItems.length < 2
                  }
                  onClick={() =>
                    setHeroIndex(
                      (heroIndex -
                        1 +
                        heroItems.length) %
                        heroItems.length,
                    )
                  }
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  className="cg-hero-arrow right"
                  aria-label="Next"
                  disabled={
                    heroItems.length < 2
                  }
                  onClick={() =>
                    setHeroIndex(
                      (heroIndex + 1) %
                        heroItems.length,
                    )
                  }
                >
                  <ChevronRight size={22} />
                </button>

                <div className="cg-hero-copy">
                  <span>
                    FEATURED
                  </span>

                  <h1>
                    {featured.title}
                  </h1>

                  <div className="cg-meta">
                    <strong>
                      {featured.genre}
                    </strong>

                    <b>•</b>

                    <strong>
                      {featured.episodes.length}{" "}
                      EP
                      {featured.episodes.length ===
                      1
                        ? ""
                        : "S"}
                    </strong>

                    <b>•</b>

                    <strong>HD</strong>
                  </div>

                  <p>
                    Discover premium CineGen
                    stories and continue
                    watching your favorite
                    series.
                  </p>

                  <div className="cg-actions">
                    <button
                      type="button"
                      className="cg-primary"
                      onClick={() =>
                        openSeries(featured)
                      }
                    >
                      <Play
                        size={17}
                        fill="currentColor"
                      />
                      Watch Now
                    </button>

                    <button
                      type="button"
                      className="cg-secondary"
                      onClick={() =>
                        toggleSaved(
                          featured.key,
                        )
                      }
                    >
                      {savedSeries.includes(
                        featured.key,
                      ) ? (
                        <Bookmark
                          size={17}
                          fill="currentColor"
                        />
                      ) : (
                        <Plus size={18} />
                      )}
                      My List
                    </button>
                  </div>
                </div>

                <div className="cg-dots">
                  {heroItems.map(
                    (item, index) => (
                      <button
                        key={item.key}
                        type="button"
                        className={
                          index === heroIndex
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setHeroIndex(index)
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            ) : (
              <section className="cg-empty-hero">
                <div className="cg-empty-icon">
                  <Play size={29} />
                </div>

                <span>
                  CINEGEN DIGITAL
                </span>

                <h1>
                  No published content yet
                </h1>

                <p>
                  Published CineGen content
                  will appear here after it is
                  synced and published.
                </p>

                <button
                  type="button"
                  className="cg-primary"
                  onClick={() =>
                    goTo("discover")
                  }
                >
                  <Compass size={17} />
                  Browse Discover
                </button>
              </section>
            )}

            <ContentSection
              title="Continue Watching"
              onSeeAll={() =>
                goTo("continue")
              }
            >
              {continueWatching.length ? (
                <div className="cg-continue-grid">
                  {continueWatching.map(
                    (episode) => (
                      <ContinueCard
                        key={episode.id}
                        episode={episode}
                        progress={
                          watchProgress[
                            episode.id
                          ] || 0
                        }
                        onOpen={() => {
                          const series =
                            allSeries.find(
                              (item) =>
                                item.episodes.some(
                                  (entry) =>
                                    entry.id ===
                                    episode.id,
                                ),
                            );

                          if (series) {
                            openSeries(
                              series,
                              episode,
                            );
                          }
                        }}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="cg-empty-strip">
                  <History size={22} />
                  <span>
                    Start watching a series and
                    it will appear here.
                  </span>
                </div>
              )}
            </ContentSection>

            <ContentSection
              title="Popular Dramas"
              onSeeAll={() =>
                goTo("discover")
              }
            >
              {popularSeries.length ? (
                <div className="cg-poster-grid">
                  {popularSeries.map(
                    (series) => (
                      <PosterCard
                        key={series.key}
                        series={series}
                        saved={savedSeries.includes(
                          series.key,
                        )}
                        onSave={() =>
                          toggleSaved(
                            series.key,
                          )
                        }
                        onOpen={() =>
                          openSeries(series)
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="cg-empty-strip">
                  No published series
                  available.
                </div>
              )}
            </ContentSection>

            <ContentSection
              title="Trending Now"
              onSeeAll={() =>
                goTo("discover")
              }
            >
              {trendingSeries.length ? (
                <div className="cg-poster-grid">
                  {trendingSeries.map(
                    (series) => (
                      <PosterCard
                        key={series.key}
                        series={series}
                        saved={savedSeries.includes(
                          series.key,
                        )}
                        onSave={() =>
                          toggleSaved(
                            series.key,
                          )
                        }
                        onOpen={() =>
                          openSeries(series)
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="cg-empty-strip">
                  No trending content
                  available.
                </div>
              )}
            </ContentSection>
          </>
        )}

        {activeNav === "discover" && (
          <section className="cg-page">
            <PageHeading
              eyebrow="BROWSE"
              title="Discover"
              description="Explore published CineGen series and episodes."
              count={`${filteredSeries.length} series`}
            />

            <div className="cg-filter-row">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={
                    selectedGenre === genre
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedGenre(genre)
                  }
                >
                  {genre}
                </button>
              ))}
            </div>

            {filteredSeries.length ? (
              <div className="cg-poster-grid cg-discover-grid">
                {filteredSeries.map(
                  (series) => (
                    <PosterCard
                      key={series.key}
                      series={series}
                      saved={savedSeries.includes(
                        series.key,
                      )}
                      onSave={() =>
                        toggleSaved(series.key)
                      }
                      onOpen={() =>
                        openSeries(series)
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyPage
                icon={<Search size={35} />}
                title="No matching content"
                description="Try another title or choose a different genre."
                action={
                  <button
                    type="button"
                    className="cg-primary"
                    onClick={() => {
                      setSearch("");
                      setSelectedGenre(
                        "All",
                      );
                    }}
                  >
                    Clear Filters
                  </button>
                }
              />
            )}
          </section>
        )}

        {activeNav === "list" && (
          <section className="cg-page">
            <PageHeading
              eyebrow="YOUR LIBRARY"
              title="My List"
              description="Series you saved for later."
              count={`${savedSeries.length} saved`}
            />

            {filteredSeries.filter(
              (series) =>
                savedSeries.includes(
                  series.key,
                ),
            ).length ? (
              <div className="cg-poster-grid cg-discover-grid">
                {filteredSeries
                  .filter((series) =>
                    savedSeries.includes(
                      series.key,
                    ),
                  )
                  .map((series) => (
                    <PosterCard
                      key={series.key}
                      series={series}
                      saved
                      onSave={() =>
                        toggleSaved(
                          series.key,
                        )
                      }
                      onOpen={() =>
                        openSeries(series)
                      }
                    />
                  ))}
              </div>
            ) : (
              <EmptyPage
                icon={<Bookmark size={35} />}
                title="Your list is empty"
                description="Use the + button on any series to save it here."
                action={
                  <button
                    type="button"
                    className="cg-primary"
                    onClick={() =>
                      goTo("discover")
                    }
                  >
                    <Compass size={17} />
                    Discover Series
                  </button>
                }
              />
            )}
          </section>
        )}

        {activeNav === "continue" && (
          <section className="cg-page">
            <PageHeading
              eyebrow="WATCH HISTORY"
              title="Continue Watching"
              description="Pick up where you left off."
              count={`${continueWatching.length} active`}
            />

            {continueWatching.length ? (
              <div className="cg-continue-grid cg-large-grid">
                {continueWatching.map(
                  (episode) => (
                    <ContinueCard
                      key={episode.id}
                      episode={episode}
                      progress={
                        watchProgress[
                          episode.id
                        ] || 0
                      }
                      onOpen={() => {
                        const series =
                          allSeries.find(
                            (item) =>
                              item.episodes.some(
                                (entry) =>
                                  entry.id ===
                                  episode.id,
                              ),
                          );

                        if (series) {
                          openSeries(
                            series,
                            episode,
                          );
                        }
                      }}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyPage
                icon={<History size={35} />}
                title="Nothing to continue yet"
                description="Start a video and your progress will be saved here."
                action={
                  <button
                    type="button"
                    className="cg-primary"
                    onClick={() =>
                      goTo("discover")
                    }
                  >
                    <Play
                      size={17}
                      fill="currentColor"
                    />
                    Start Watching
                  </button>
                }
              />
            )}
          </section>
        )}

        {activeNav === "profile" && (
          <section className="cg-page cg-profile-page">
            <PageHeading
              eyebrow="ACCOUNT"
              title="My Profile"
              description="Manage your CineGen account."
              count="Active"
            />

            <div className="cg-profile-card">
              <div className="cg-profile-avatar">
                {(
                  user.name ||
                  user.email ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="cg-profile-copy">
                <h3>
                  {user.name ||
                    "CineGen User"}
                </h3>

                <p>
                  {user.email ||
                    "No email available"}
                </p>
              </div>

              <div className="cg-active">
                <i />
                ACTIVE SUBSCRIBER
              </div>
            </div>

            <div className="cg-profile-grid">
              <div>
                <span>ACCOUNT EMAIL</span>
                <strong>
                  {user.email || "Not available"}
                </strong>
              </div>

              <div>
                <span>ACCOUNT NAME</span>
                <strong>
                  {user.name ||
                    "CineGen User"}
                </strong>
              </div>

              <div>
                <span>PLATFORM</span>
                <strong>CineGen Web</strong>
              </div>

              <div>
                <span>PUBLISHED CONTENT</span>
                <strong>
                  {episodes.length}{" "}
                  {episodes.length === 1
                    ? "episode"
                    : "episodes"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="cg-logout"
              onClick={logout}
            >
              <LogOut size={17} />
              Log Out
            </button>
          </section>
        )}
      </main>

      <nav className="cg-mobile-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={
              activeNav === item.key
                ? "active"
                : ""
            }
            onClick={() =>
              goTo(item.key)
            }
          >
            {item.icon}
            <span>
              {item.key ===
              "continue"
                ? "Continue"
                : item.label}
            </span>
          </button>
        ))}
      </nav>

      {apkModalOpen && (
        <div
          className="cg-apk-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setApkModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Install CineGen Mobile App"
        >
          <div className="cg-apk-modal">
            <button
              type="button"
              className="cg-apk-close"
              onClick={() => setApkModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="cg-apk-icon">
              <Download size={28} />
            </div>

            <div className="cg-apk-content">
              <span className="cg-apk-eyebrow">
                CINEGEN DIGITAL MOBILE
              </span>

              <h2>Get the CineGen Mobile App</h2>

              <p>
                Download the Android app and enjoy CineGen
                wherever you go.
              </p>

              <div className="cg-apk-features">
                <div>
                  <span>✓</span>
                  <p>Same CineGen account</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Android mobile experience</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Watch your favorite content anywhere</p>
                </div>
              </div>

              <a
                href="/downloads/CineGen-Digital.apk"
                className="cg-apk-download"
                download="CineGen-Digital.apk"
              >
                <Download size={19} />
                Download APK
              </a>

              <small>
                Android APK • CineGen Digital
              </small>
            </div>
          </div>
        </div>
      )}

      {playerOpen && (
        <div
          className="cg-player-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePlayer();
            }
          }}
        >
          <div
            className="cg-player"
            role="dialog"
            aria-modal="true"
          >
            <div className="cg-player-header">
              <div>
                <span>
                  {selectedSeries?.genre ||
                    "CineGen"}
                </span>
                <h3>
                  {selectedSeries?.title ||
                    selectedEpisode?.title ||
                    "CineGen"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closePlayer}
                aria-label="Close player"
              >
                <X size={20} />
              </button>
            </div>

            <div className="cg-video">
              {selectedEpisode?.videoUrl ? (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  onTimeUpdate={(event) => {
                    const element =
                      event.currentTarget;

                    if (
                      element.duration &&
                      Number.isFinite(
                        element.duration,
                      )
                    ) {
                      saveProgress(
                        selectedEpisode.id,
                        (element.currentTime /
                          element.duration) *
                          100,
                      );
                    }
                  }}
                  onEnded={() =>
                    selectedEpisode &&
                    saveProgress(
                      selectedEpisode.id,
                      100,
                    )
                  }
                />
              ) : (
                <div className="cg-video-empty">
                  <Play size={34} />
                  <h3>
                    Video unavailable
                  </h3>
                  <p>
                    This episode does not have a
                    playable Bunny video URL.
                  </p>
                </div>
              )}
            </div>

            <div className="cg-player-bottom">
              <div>
                <strong>
                  EP{" "}
                  {selectedEpisode?.episodeNumber ||
                    1}
                </strong>

                <span>
                  {selectedEpisode
                    ? `${watchProgress[selectedEpisode.id] || 0}% watched`
                    : ""}
                </span>
              </div>

              {selectedSeries &&
                selectedSeries.episodes
                  .length > 1 && (
                  <div className="cg-episodes">
                    {selectedSeries.episodes.map(
                      (episode) => (
                        <button
                          key={episode.id}
                          type="button"
                          className={
                            selectedEpisode?.id ===
                            episode.id
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setSelectedEpisode(
                              episode,
                            )
                          }
                        >
                          EP{" "}
                          {episode.episodeNumber ||
                            1}
                        </button>
                      ),
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentSection({
  title,
  children,
  onSeeAll,
}: {
  title: string;
  children: ReactNode;
  onSeeAll: () => void;
}) {
  return (
    <section className="cg-section">
      <div className="cg-section-title">
        <h2>{title}</h2>

        <button
          type="button"
          onClick={onSeeAll}
        >
          See All
          <ChevronRight size={15} />
        </button>
      </div>

      {children}
    </section>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: string;
}) {
  return (
    <div className="cg-page-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <strong>{count}</strong>
    </div>
  );
}

function EmptyPage({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="cg-page-empty">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function PosterCard({
  series,
  saved,
  onSave,
  onOpen,
}: {
  series: SeriesItem;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="cg-poster-card">
      <button
        type="button"
        className="cg-poster"
        onClick={onOpen}
        aria-label={`Open ${series.title}`}
      >
        {series.thumbnailUrl ? (
          <img
            src={series.thumbnailUrl}
            alt={series.title}
          />
        ) : (
          <div className="cg-placeholder">
            <Play size={27} />
          </div>
        )}

        <div className="cg-poster-gradient" />

        <span className="cg-poster-play">
          <Play
            size={15}
            fill="currentColor"
          />
        </span>
      </button>

      <button
        type="button"
        className={`cg-save ${
          saved ? "saved" : ""
        }`}
        onClick={onSave}
        aria-label={
          saved
            ? "Remove from My List"
            : "Add to My List"
        }
      >
        {saved ? (
          <Bookmark
            size={16}
            fill="currentColor"
          />
        ) : (
          <Plus size={17} />
        )}
      </button>

      <button
        type="button"
        className="cg-title"
        onClick={onOpen}
      >
        {series.title}
      </button>

      <p>
        {series.genre}
        {" • "}
        {series.episodes.length} EP
        {series.episodes.length === 1
          ? ""
          : "s"}
      </p>
    </article>
  );
}

function ContinueCard({
  episode,
  progress,
  onOpen,
}: {
  episode: Episode;
  progress: number;
  onOpen: () => void;
}) {
  return (
    <article className="cg-continue-card">
      <button
        type="button"
        className="cg-continue-image"
        onClick={onOpen}
      >
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={
              episode.seriesTitle ||
              episode.title ||
              "CineGen"
            }
          />
        ) : (
          <div className="cg-placeholder">
            <Play size={26} />
          </div>
        )}

        <div className="cg-continue-gradient" />

        <div className="cg-continue-copy">
          <strong>
            {episode.seriesTitle ||
              episode.title ||
              "CineGen"}
          </strong>

          <small>
            EP {episode.episodeNumber || 1}
          </small>
        </div>

        <span className="cg-continue-play">
          <Play
            size={14}
            fill="currentColor"
          />
        </span>
      </button>

      <div className="cg-progress">
        <span
          style={{
            width: `${Math.max(
              0,
              Math.min(100, progress),
            )}%`,
          }}
        />
      </div>
    </article>
  );
}

export default CustomerDashboard;

