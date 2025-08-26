import React, { useEffect } from "react";
import { useAdTracker } from "../context/AdTrackerContext";

const AdScriptManager: React.FC = () => {
  const { isInCooldown } = useAdTracker();

  useEffect(() => {
    console.log("isInCooldown", isInCooldown());
    if (isInCooldown()) return;

    const script = document.createElement("script");
    script.src =
      "//raptripeessentially.com/30/d7/89/30d7893f4447a63868a364443e8b11a0.js";
    script.type = "text/javascript";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isInCooldown]);

  return null;
};

export default AdScriptManager;
