import { Film } from "lucide-react";

type Episode = {
  id: string;
  title?: string;
  seriesTitle?: string;
  genre?: string;
  episodeNumber?: number;
  contentType?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
};

type ContentSectionProps = {
  episodes: Episode[];
  genres: string[];
  onGenreChange: (episodeId: string, genre: string) => void;
};

export default function ContentSection({
  episodes,
  genres,
  onGenreChange,
}: ContentSectionProps) {
  return (
    <section id="content-section" className="content-card">
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
                        onGenreChange(episode.id, event.target.value)
                      }
                    >
                      <option value="">Select genre</option>

                      {genres.map((genre) => (
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
  );
}
