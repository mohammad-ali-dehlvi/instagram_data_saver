import Search from "@mui/icons-material/Search";
import { Box, Typography } from "@mui/material";

export function IdleState() {
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
      <Search sx={{ fontSize: 44, color: "text.disabled", opacity: 0.3 }} />
      <Typography
        variant="body2"
        sx={{ fontFamily: "inherit", color: "text.disabled" }}
      >
        Enter a profile ID or URL to fetch stories
      </Typography>
    </Box>
  );
}
