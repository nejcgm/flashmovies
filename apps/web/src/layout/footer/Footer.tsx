import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {!loading && (
        <>
          <div className="text-center text-xs sm:text-sm text-gray-500">
            Disclaimer: This site does not store any files on its server. All
            contents are provided by non-affiliated third parties.
          </div>
          <footer className="bg-black text-white py-6">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <div className="flex gap-4">
                  <button
                    className="text-xs sm:text-sm  hover:text-[#f5c518]"
                    onClick={() => navigate("/terms-and-conditions")}
                  >
                    Terms and Conditions
                  </button>
                  <button
                    className="text-xs sm:text-sm hover:text-[#f5c518]"
                    onClick={() => navigate("/frequently-asked-questions")}
                  >
                    FAQ
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}
