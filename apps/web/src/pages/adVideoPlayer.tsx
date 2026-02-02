import React, { useEffect, useRef, useState } from "react";
import { redirectForAdVideo } from "../utils/contextAdRedirect";
import { useAdTracker } from "../context/AdTrackerContext";
import { useUser } from "../context/UserContext";

declare global {
  interface Window {
    fluidPlayer: any;
  }
}

const ExoClickPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isFluidPlayerReady, setIsFluidPlayerReady] = useState(false);
  const { setVideoAd } = useAdTracker();
  const [adIsUnavailable, setAdIsUnavailable] = useState(false);
  const { isPro } = useUser();

  // Redirect pro users - they don't need to watch ads
  useEffect(() => {
    if (isPro) {
      window.history.back();
    }
  }, [isPro]);
  useEffect(() => {
    const loadFluidPlayer = () => {
      if (window.fluidPlayer) {
        setIsFluidPlayerReady(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js";
      script.async = true;
      script.onload = () => {
        console.log("FluidPlayer loaded");
        setIsFluidPlayerReady(true);
      };
      script.onerror = () => {
        console.error("Failed to load FluidPlayer");
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    loadFluidPlayer();
  }, []);

  useEffect(() => {
    let isUnavailable = false;
    if (!isFluidPlayerReady || !videoRef.current) return;

    const timer = setTimeout(() => {
      try {
        console.log("Initializing FluidPlayer...");
        
        playerRef.current = window.fluidPlayer(videoRef.current!.id, {
          layoutControls: {
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true,
            },
            htmlOnPauseBlock: {
              html: null,
              height: null,
              width: null,
            },
            allowDownload: false,
            allowTheatre: true,
            playPauseAnimation: true,
            playbackRateEnabled: false,
            allowFullscreen: true,
            fillToContainer: true,
            autoPlay: false,
          },
          vastOptions: {
            adList: [
              {
                roll: "preRoll",
                vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5710190",
              },
            ],
            adText: "",
            adTextPosition: "top left",
            adCTAText: "Visit Now",
            adCTATextPosition: "bottom right",
            skipButtonCaption: "",
            skipButtonClickCaption: "",
            adClickable: true,
            vastTimeout: 7000,
            showProgressbarMarkers: false,
            allowVPAID: true,
            maxAllowedVastTagRedirects: 3,
            vastAdvanced: {
              vastLoadedCallback: () => {
                console.log("VAST ad loaded");
              },
              noVastVideoCallback: () => {
                console.log("noVastVideoCallback");
                isUnavailable = true;
                setAdIsUnavailable(true);
              },
              vastVideoSkippedCallback: () => {
                console.log("VAST ad skipped");
              },
              vastVideoEndedCallback: () => {
                if(!isUnavailable) {
                redirectForAdVideo({
                  setVideoAd,
                  reloadPage: () => {
                    window.location.reload();
                  },
                  navigateBack: () => window.history.back(),
                });
                }
              },
            },
          },
          modules: {
            configureHls: (hls: any) => {
            },
          },
        });

        console.log("FluidPlayer initialized successfully");
      } catch (error) {
        console.error("Error initializing FluidPlayer:", error);
        isUnavailable = true;
        setAdIsUnavailable(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (playerRef.current && typeof playerRef.current.dispose === 'function') {
        try {
          playerRef.current.dispose();
          console.log("FluidPlayer disposed");
        } catch (error) {
          console.error("Error disposing FluidPlayer:", error);
        }
      }
    };
  }, [isFluidPlayerReady]);

  // Don't render anything for pro users while redirecting
  if (isPro) {
    return null;
  }

  return (
    <>
    <div className="video-wrapper relative w-[95%]  min-h-[200px] sm:min-h-[350px] md:min-h-[500px] lg:min-h-[700px] mx-auto my-auto bg-black border-yellow-500 border-2 flex items-center justify-center" >
      <video
        ref={videoRef}
        id="fluid-player"
        className="fluid-player w-full min-h-[200px] sm:min-h-[350px] md:min-h-[500px] lg:min-h-[700px]"
        controls
        preload="metadata"
        playsInline
      >
        {/* <source 
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
          type="video/mp4" 
        /> */}
        Your browser does not support the video tag.
      </video>
      {adIsUnavailable && (
     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
     <h2 className="text-2xl font-bold mb-4">No Ads Available</h2>
     <p className="text-lg mb-6">There are currently no ads available to display.</p>
     <button
       onClick={() => window.history.back()}
       className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
     >
       Go Back
     </button>
   </div>
 )}
    </div>
    </>
  );
};

export default ExoClickPlayer;






