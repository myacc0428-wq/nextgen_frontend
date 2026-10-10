import { useEffect, useState } from "react";
import {
  LoaderCircle,
  LogOut,
  Smartphone,
} from "lucide-react";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  signOut,
  type User,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import CustomerDashboard from "./CustomerDashboard";

type Props = {
  user: User;
};

type Status =
  | "loading"
  | "active"
  | "pending"
  | "rejected"
  | "missing";

export default function CustomerAccessGate({
  user,
}: Props) {
  const [status, setStatus] =
    useState<Status>("loading");

  useEffect(() => {
    return onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          setStatus("missing");
          return;
        }

        const data = snapshot.data();

        const accountStatus =
          String(data.accountStatus || "").toLowerCase();

        const subscriptionStatus =
          String(
            data.subscriptionStatus || ""
          ).toLowerCase();

        if (
          accountStatus === "active" &&
          subscriptionStatus === "active"
        ) {
          setStatus("active");
        } else if (
          accountStatus === "rejected" ||
          subscriptionStatus === "rejected"
        ) {
          setStatus("rejected");
        } else {
          setStatus("pending");
        }
      },
      (error) => {
        console.error(
          "CUSTOMER STATUS ERROR:",
          error
        );
        setStatus("pending");
      }
    );
  }, [user.uid]);

  const logout = async () => {
    await signOut(auth);
  };

  if (status === "loading") {
    return (
      <div className="customer-gate">
        <div className="customer-gate-card compact">
          <LoaderCircle
            size={36}
            className="gate-spin"
          />
          <h2>Loading CineGen</h2>
          <p>
            Checking your subscription access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="customer-gate">
        <div className="customer-gate-card">
          <div className="gate-logo">
            CINE<span>GEN</span>
          </div>

          <div className="gate-icon">
            <Smartphone size={32} />
          </div>

          <h1>Waiting for Approval</h1>

          <p>
            Your CineGen subscription request is
            waiting for administrator approval.
          </p>

          <button
            className="gate-outline"
            onClick={logout}
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      </div>
    );
  }

  if (
    status === "rejected" ||
    status === "missing"
  ) {
    return (
      <div className="customer-gate">
        <div className="customer-gate-card">
          <div className="gate-logo">
            CINE<span>GEN</span>
          </div>

          <div className="gate-icon danger">
            <Smartphone size={32} />
          </div>

          <h1>
            {status === "rejected"
              ? "Access Rejected"
              : "Account Not Ready"}
          </h1>

          <p>
            {status === "rejected"
              ? "Your CineGen subscription request was rejected."
              : "Your CineGen account has not been activated yet."}
          </p>

          <button
            className="gate-outline"
            onClick={logout}
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return <CustomerDashboard user={user} />;
}
