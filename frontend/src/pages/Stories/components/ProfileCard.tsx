import { Avatar, Box, Chip, Divider, Typography, alpha } from "@mui/material";
import { Person } from "@mui/icons-material";
import MediaGrid from "./MediaGrid";
import type { StoryProfileItem } from "../../../api";

export default function ProfileCard({
  profile,
}: {
  profile: StoryProfileItem;
}) {
  const mediaCount = profile.media?.length ?? 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}
      >
        <Avatar
          src={profile.profile_pic_url ?? undefined}
          sx={{
            width: 40,
            height: 40,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
            color: "primary.main",
            fontSize: "1rem",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          {!profile.profile_pic_url && <Person fontSize="small" />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontFamily: "inherit",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            @{profile.username}
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontFamily: "inherit" }}
          >
            {mediaCount} {mediaCount === 1 ? "story item" : "story items"}
          </Typography>
        </Box>
        {mediaCount > 0 && (
          <Chip
            label={`${mediaCount}`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.68rem",
              fontFamily: "inherit",
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          />
        )}
      </Box>

      {/* Media */}
      {profile.media && profile.media.length > 0 && (
        <>
          <Divider sx={{ opacity: 0.4 }} />
          <Box sx={{ px: 2, pb: 2 }}>
            <MediaGrid media={profile.media} />
          </Box>
        </>
      )}
    </Box>
  );
}
