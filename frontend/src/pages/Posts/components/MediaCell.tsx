import { useEffect, useRef, useState } from "react";
import type { PostMediaItem } from "../../../api";
import { Box, Typography } from "@mui/material";
import BrokenImage from "@mui/icons-material/BrokenImage";
import ImageNotSupported from "@mui/icons-material/ImageNotSupported";
import PlayCircleOutlined from "@mui/icons-material/PlayCircleOutlined";

export default function MediaCell({
  item,
  onClick,
  aspectRatio = "1/1",
  borderRadius = 1,
}: {
  item: PostMediaItem;
  onClick?: () => void;
  aspectRatio?: string;
  borderRadius?: number;
}) {
  const [errored, setErrored] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // video_url takes priority
  const isVideo = !!item.video_url;
  const src = item.video_url || item.image_url;
  const isUnavailable = !src || errored;

  useEffect(() => {
    setErrored(false);
    setShouldLoad(false);
  }, [src]);

  useEffect(() => {
    const node = cellRef.current;
    if (!node || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <Box
      ref={cellRef}
      onClick={onClick}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio,
        bgcolor: "background.default",
        borderRadius,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        "&:hover .cell-overlay": onClick ? { opacity: 1 } : {},
      }}
    >
      {src && shouldLoad && !errored ? (
        isVideo ? (
          <Box
            component="video"
            src={src}
            muted
            loop
            playsInline
            autoPlay={shouldLoad}
            preload="none"
            onError={() => setErrored(true)}
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
            component="img"
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setErrored(true)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )
      ) : isUnavailable ? (
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
          {errored ? (
            <BrokenImage sx={{ fontSize: 20, opacity: 0.4 }} />
          ) : (
            <ImageNotSupported sx={{ fontSize: 20, opacity: 0.4 }} />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: (theme) => theme.palette.action.hover,
          }}
        />
      )}

      {/* Video badge — small pill in corner so user knows it's a video */}
      {isVideo && !errored && src && (
        <Box
          sx={{
            position: "absolute",
            bottom: 5,
            right: 5,
            bgcolor: "rgba(0,0,0,.55)",
            borderRadius: "4px",
            px: 0.6,
            py: 0.2,
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            pointerEvents: "none",
          }}
        >
          <PlayCircleOutlined sx={{ fontSize: 11, color: "#fff" }} />
          <Typography
            sx={{
              fontSize: "0.6rem",
              color: "#fff",
              fontFamily: "inherit",
              lineHeight: 1,
            }}
          >
            VID
          </Typography>
        </Box>
      )}

      <Box
        className="cell-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,.22)",
          opacity: 0,
          transition: "opacity .15s",
        }}
      />
    </Box>
  );
}
