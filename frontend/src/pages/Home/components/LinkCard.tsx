import { useState } from "react";
import type { LinkItem } from "../types";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import OpenInNew from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";

export default function LinkCard({ item }: { item: LinkItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <Box
      component="a"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderRadius: 1,
        textDecoration: "none",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          transform: "translateY(-1px)",
          boxShadow: (theme) =>
            `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
          "& .link-arrow": { opacity: 1, transform: "translate(1px,-1px)" },
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
        }}
      >
        {item.icon ?? <LinkIcon fontSize="small" />}
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          noWrap
          sx={{ fontSize: "0.9rem", fontWeight: 600, color: "text.primary" }}
        >
          {item.label}
        </Typography>
        {item.description && (
          <Typography
            variant="body2"
            noWrap
            sx={{ mt: 0.25, color: "text.secondary" }}
          >
            {item.description}
          </Typography>
        )}
      </Box>

      {/* Tag */}
      {item.tag && (
        <Chip
          label={item.tag}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            fontFamily: "inherit",
            fontWeight: 600,
            letterSpacing: "0.03em",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            border: "none",
            flexShrink: 0,
          }}
        />
      )}

      {/* Actions */}
      <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, ml: 0.5 }}>
        <Tooltip title={copied ? "Copied!" : "Copy URL"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              color: copied ? "success.main" : "text.disabled",
              "&:hover": { color: "text.secondary" },
            }}
          >
            {copied ? (
              <CheckCircleOutline sx={{ fontSize: 16 }} />
            ) : (
              <ContentCopy sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
        <OpenInNew
          className="link-arrow"
          sx={{
            fontSize: 16,
            color: "text.disabled",
            opacity: 0,
            transition: "all 0.15s ease",
            alignSelf: "center",
            mr: 0.5,
          }}
        />
      </Stack>
    </Box>
  );
}
