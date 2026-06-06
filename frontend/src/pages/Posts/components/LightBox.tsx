import { Box } from "@mui/material";
import type { PostMediaItem } from "../../../api";

export default function Lightbox({
  item,
  onClose,
}: {
  item: PostMediaItem;
  onClose: () => void;
}) {
  const isVideo = !!item.video_url;
  const src = item.video_url || item.image_url || "";

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        bgcolor: "rgba(0,0,0,.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      {isVideo ? (
        <Box
          component="video"
          src={src}
          controls
          autoPlay
          loop
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            maxWidth: "92vw",
            maxHeight: "90vh",
            borderRadius: 1,
            outline: "none",
            cursor: "default",
          }}
        />
      ) : (
        <Box
          component="img"
          src={src}
          alt=""
          sx={{
            maxWidth: "92vw",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
}
