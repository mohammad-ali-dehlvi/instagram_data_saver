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
      <Inbox sx={{ fontSize: 44, color: "text.disabled", opacity: 0.3 }} />
      <Typography
        variant="body2"
        sx={{ fontFamily: "inherit", color: "text.disabled" }}
      >
        No stories found
      </Typography>
    </Box>
  );
}
