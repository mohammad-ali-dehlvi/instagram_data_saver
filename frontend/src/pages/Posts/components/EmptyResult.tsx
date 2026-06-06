import Inbox from "@mui/icons-material/Inbox";
import { Box, Typography } from "@mui/material";

export default function EmptyResult() {
  return (
    <Box
      sx={{
        py: 7,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Inbox sx={{ fontSize: 42, color: "text.disabled", opacity: 0.25 }} />
      <Typography
        variant="caption"
        sx={{ fontFamily: "inherit", color: "text.disabled" }}
      >
        No posts found
      </Typography>
    </Box>
  );
}
