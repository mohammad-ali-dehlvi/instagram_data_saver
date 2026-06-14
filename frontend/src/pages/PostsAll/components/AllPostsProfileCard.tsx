/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import type {
  MultiplePostItem,
  MultiplePostProfileItem,
  PostMediaItem,
} from "../../../api";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Typography,
  alpha,
} from "@mui/material";
import Person from "@mui/icons-material/Person";
import GridView from "@mui/icons-material/GridView";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MediaCell from "../../Posts/components/MediaCell";
import Lightbox from "../../Posts/components/LightBox";

const MEDIA_BATCH_SIZE = 10;

type GalleryItem = {
  key: string;
  media: PostMediaItem;
  postId?: string | number | null;
  isCover: boolean;
};

function toGalleryItems(posts: MultiplePostItem[] = []) {
  const items: GalleryItem[] = [];

  posts.forEach((post, postIndex) => {
    if (post.cover_media) {
      items.push({
        key: `${post.id ?? postIndex}-cover`,
        media: post.cover_media,
        postId: post.id,
        isCover: true,
      });
    }

    post.media?.forEach((media, mediaIndex) => {
      items.push({
        key: `${post.id ?? postIndex}-media-${mediaIndex}`,
        media,
        postId: post.id,
        isCover: false,
      });
    });
  });

  return items;
}

export default function AllPostsProfileCard({
  profile,
}: {
  profile: MultiplePostProfileItem;
}) {
  const [lightbox, setLightbox] = useState<PostMediaItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(MEDIA_BATCH_SIZE);
  const posts = profile.posts ?? [];
  const galleryItems = useMemo(() => toGalleryItems(posts), [posts]);
  const visibleItems = galleryItems.slice(0, visibleCount);
  const remainingCount = Math.max(galleryItems.length - visibleCount, 0);

  useEffect(() => {
    setVisibleCount(MEDIA_BATCH_SIZE);
  }, [profile.username, galleryItems.length]);

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
          }}
        >
          <Avatar
            src={profile.profile_pic_url ?? undefined}
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              color: "primary.main",
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
              label={`${posts.length}`}
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
        </Box>

        {galleryItems.length > 0 && (
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
              {visibleItems.map((item) => {
                const hasSrc = !!(item.media.video_url || item.media.image_url);
                return (
                  <Box
                    key={item.key}
                    sx={{ position: "relative", minWidth: 0 }}
                  >
                    <MediaCell
                      item={item.media}
                      onClick={
                        hasSrc ? () => setLightbox(item.media) : undefined
                      }
                    />
                    {(item.isCover || item.postId) && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 5,
                          bottom: 5,
                          maxWidth: "calc(100% - 10px)",
                          px: 0.6,
                          py: 0.25,
                          borderRadius: "4px",
                          bgcolor: "rgba(0,0,0,.55)",
                          color: "#fff",
                          fontSize: "0.58rem",
                          lineHeight: 1,
                          fontFamily: "inherit",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                        }}
                      >
                        {item.isCover ? "cover" : item.postId}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
            {remainingCount > 0 && (
              <Box sx={{ px: 2, pb: 1.75, display: "flex" }}>
                <Button
                  size="small"
                  variant="text"
                  endIcon={<ExpandMore sx={{ fontSize: 16 }} />}
                  onClick={() =>
                    setVisibleCount((count) => count + MEDIA_BATCH_SIZE)
                  }
                  sx={{
                    ml: "auto",
                    minHeight: 28,
                    px: 1,
                    borderRadius: 1,
                    fontFamily: "inherit",
                    fontSize: "0.72rem",
                    textTransform: "none",
                  }}
                >
                  Load {Math.min(remainingCount, MEDIA_BATCH_SIZE)} more
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {lightbox && (
        <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
