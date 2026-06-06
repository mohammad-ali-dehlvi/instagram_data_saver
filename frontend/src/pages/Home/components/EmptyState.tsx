import Inbox from "@mui/icons-material/Inbox";
import { Box, Typography } from "@mui/material";

export default function EmptyState() {
  return (
    <Box
      sx={{
        py: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        color: "text.disabled",
      }}
    >
      <Inbox sx={{ fontSize: 48, opacity: 0.35 }} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        No links yet
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Pass a <code>links</code> prop to populate this page.
      </Typography>
    </Box>
  );
}
