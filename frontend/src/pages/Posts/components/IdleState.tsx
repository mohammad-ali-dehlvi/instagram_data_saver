import Link from "@mui/icons-material/Link";
import { Box, Typography } from "@mui/material";

export default function IdleState() {
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
      <Link sx={{ fontSize: 42, color: "text.disabled", opacity: 0.25 }} />
      <Typography
        variant="caption"
        sx={{ fontFamily: "inherit", color: "text.disabled" }}
      >
        Paste a post URL to fetch results
      </Typography>
    </Box>
  );
}
