import ImageNotSupported from "@mui/icons-material/ImageNotSupported";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutlined";
import { Box } from "@mui/material";
import { useState } from "react";
import type { StoryMediaItem } from "../../../api";

export default function MediaGrid({ media }: { media: StoryMediaItem[] }) {
  const [errored, setErrored] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState<{
    src: string;
    isVideo: boolean;
  } | null>(null);

  if (!media.length) return null;

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          gap: "3px",
          mt: 1.5,
        }}
      >
        {media.map((m, i) => {
          const src = m.video_url || m.image_url;
          const imgSrc = m.image_url || m.video_url;
          const isVideo = !!m.video_url;

          return (
            <Box
              key={i}
              onClick={() => src && setLightbox({ src, isVideo })}
              sx={{
                position: "relative",
                paddingTop: "100%",
                bgcolor: "background.default",
                borderRadius: 1,
                overflow: "hidden",
                cursor: "pointer",
                "&:hover .overlay": { opacity: 1 },
              }}
            >
              {imgSrc && !errored[i] ? (
                <Box
                  component="img"
                  src={imgSrc}
                  alt=""
                  onError={(e) => {
                    setErrored((p) => ({ ...p, [i]: true }));
                  }}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.disabled",
                  }}
                >
                  <ImageNotSupported sx={{ fontSize: 20 }} />
                </Box>
              )}
              {isVideo && (
                <PlayCircleOutline
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    fontSize: 28,
                    color: "white",
                    pointerEvents: "none",
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
                  }}
                />
              )}
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.25)",
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          onClick={() => setLightbox(null)}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            bgcolor: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <Box
            component={lightbox.isVideo ? "video" : "img"}
            src={lightbox.src}
            alt=""
            {...(lightbox.isVideo ? { controls: true } : {})}
            sx={{
              maxWidth: "92vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </Box>
      )}
    </>
  );
}
