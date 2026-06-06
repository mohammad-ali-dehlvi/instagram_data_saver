import { useState } from "react";
import type { PostMediaItem, PostProfileItem } from "../../../api";
import { Avatar, Box, Chip, Divider, Typography, alpha } from "@mui/material";
import MediaCell from "./MediaCell";
import Person from "@mui/icons-material/Person";
import { GridView } from "@mui/icons-material";
import Lightbox from "./LightBox";

export default function PostProfileCard({
  profile,
}: {
  profile: PostProfileItem;
}) {
  const [lightbox, setLightbox] = useState<PostMediaItem | null>(null);
  const mediaCount = profile.media?.length ?? 0;
  const hasCover = !!profile.cover_media;

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {/* Cover media */}
        {hasCover && profile.cover_media && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/7",
              bgcolor: "background.default",
            }}
          >
            <MediaCell
              item={profile.cover_media}
              aspectRatio="16/7"
              borderRadius={0}
              onClick={() => {
                if (profile.cover_media) setLightbox(profile.cover_media);
              }}
            />
            {/* gradient fade for header */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)",
                pointerEvents: "none",
              }}
            />
          </Box>
        )}

        {/* Profile header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: hasCover ? 1.25 : 1.5,
            mt: hasCover ? -3 : 0,
            position: "relative",
          }}
        >
          <Avatar
            src={profile.profile_pic_url ?? undefined}
            sx={{
              width: hasCover ? 44 : 38,
              height: hasCover ? 44 : 38,
              flexShrink: 0,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              color: "primary.main",
              border: hasCover ? "2px solid" : "none",
              borderColor: "background.paper",
              boxShadow: hasCover ? "0 2px 8px rgba(0,0,0,.4)" : "none",
            }}
          >
            {!profile.profile_pic_url && <Person fontSize="small" />}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {profile.full_name && (
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                }}
              >
                {profile.full_name}
              </Typography>
            )}
            {profile.username && (
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: "text.secondary",
                  fontFamily: "inherit",
                  opacity: 0.7,
                }}
              >
                @{profile.username}
              </Typography>
            )}
            {!profile.full_name && !profile.username && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                }}
              >
                Unknown profile
              </Typography>
            )}
          </Box>

          {mediaCount > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              <GridView sx={{ fontSize: 13, color: "text.disabled" }} />
              <Chip
                label={`${mediaCount}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Media grid */}
        {mediaCount > 0 && (
          <>
            <Divider sx={{ opacity: 0.35, mx: 2 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(82px, 1fr))",
                gap: "3px",
                p: "10px 14px 14px",
              }}
            >
              {profile.media!.map((m, i) => {
                const hasSrc = !!(m.video_url || m.image_url);
                return (
                  <MediaCell
                    key={i}
                    item={m}
                    onClick={hasSrc ? () => setLightbox(m) : undefined}
                  />
                );
              })}
            </Box>
          </>
        )}
      </Box>

      {lightbox && (
        <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
