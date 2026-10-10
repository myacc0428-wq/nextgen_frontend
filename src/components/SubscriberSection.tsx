import { Check, UserCircle, Users, X } from "lucide-react";

type Subscriber = {
  id: string;
  email?: string;
  accountStatus?: string;
  subscriptionStatus?: string;
  approvedBy?: string;
  approvedAt?: any;
  createdAt?: any;
  subscriptionRequestedAt?: any;
  subscriptionStartedAt?: any;
  subscriptionExpiresAt?: any;
};

type SubscriberSectionProps = {
  subscribers: Subscriber[];
  pendingCount: number;
  actionId: string | null;
  onDecision: (subscriberId: string, decision: "approve" | "reject") => void;
  formatTimestamp: (value: any) => string;
};

export default function SubscriberSection({
  subscribers,
  pendingCount,
  actionId,
  onDecision,
  formatTimestamp,
}: SubscriberSectionProps) {
  return (
    <section id="subscribers-section" className="content-card">
      <div className="content-header">
        <div>
          <h2>Subscriber Approval</h2>
          <p>
            Review accounts requesting access to CineGen Digital.
          </p>
        </div>

        <div className="status-pill">
          <span className="status-dot" />
          {pendingCount} Pending
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
                <th>Expires</th>
                <th>Requested</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {subscribers.map((subscriber) => {
                const isPending =
                  subscriber.accountStatus === "pending" ||
                  subscriber.subscriptionStatus === "pending";

                const isProcessing = actionId === subscriber.id;

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
                      {subscriber.subscriptionExpiresAt ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <span
                            className="status-badge"
                          >
                            {(() => {
                              const expiresAt =
                                typeof subscriber.subscriptionExpiresAt?.toMillis ===
                                "function"
                                  ? subscriber.subscriptionExpiresAt.toMillis()
                                  : typeof subscriber.subscriptionExpiresAt?.toDate ===
                                      "function"
                                    ? subscriber.subscriptionExpiresAt.toDate().getTime()
                                    : new Date(
                                        subscriber.subscriptionExpiresAt
                                      ).getTime();

                              return expiresAt <= Date.now()
                                ? "Expired"
                                : "Active";
                            })()}
                          </span>

                          <span style={{ fontSize: 12 }}>
                            {formatTimestamp(
                              subscriber.subscriptionExpiresAt
                            )}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
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
                              onDecision(subscriber.id, "approve")
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
                              onDecision(subscriber.id, "reject")
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
  );
}
