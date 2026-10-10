import { useEffect, useRef, useState } from "react";
import "./OpeningIntro.css";

type Props = {
  onComplete: () => void;
};

export default function OpeningIntro({
  onComplete,
}: Props) {
  const [isExiting, setIsExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const exitStartedRef = useRef(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setReady(true);
    }, 350);

    const finishTimer = window.setTimeout(() => {
      if (exitStartedRef.current) return;
      exitStartedRef.current = true;
      setIsExiting(true);
      window.setTimeout(onComplete, 420);
    }, 4300);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const enterNow = () => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    setIsExiting(true);
    window.setTimeout(onComplete, 420);
  };

  return (
    <main
      className={`cg-intro ${
        ready ? "is-ready" : ""
      } ${isExiting ? "is-exiting" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          enterNow();
        }
      }}
    >
      <div className="cg-intro-noise" />

      <div className="cg-intro-orb cg-intro-orb-one" />
      <div className="cg-intro-orb cg-intro-orb-two" />

      <div className="cg-intro-rings">
        <span />
        <span />
        <span />
      </div>

      <div className="cg-intro-particles" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, index) => (
          <i
            key={index}
            style={{
              "--i": index,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="cg-intro-center">
        <div className="cg-intro-logo-wrap">
          <div className="cg-intro-logo-glow" />

          <img
            src="/images/cinegen-logo.png"
            alt="CineGen"
            className="cg-intro-logo"
          />
        </div>

        <div className="cg-intro-line">
          <span />
        </div>

        <p className="cg-intro-tagline">
          DIGITAL STREAMING
        </p>

        <button
          type="button"
          className="cg-intro-enter"
          onClick={enterNow}
        >
          ENTER CINEGEN
        </button>
      </section>

      <div className="cg-intro-corner top-left" />
      <div className="cg-intro-corner top-right" />
      <div className="cg-intro-corner bottom-left" />
      <div className="cg-intro-corner bottom-right" />
    </main>
  );
}






