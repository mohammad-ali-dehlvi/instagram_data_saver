import {
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  type PaletteMode,
} from "@mui/material";
import type { HttpValidationError, StoryResponse } from "../../../api";
import { useRef, useState } from "react";
import { isUrl } from "../../../utils/helpers";
import Link from "@mui/icons-material/Link";
import AlternateEmail from "@mui/icons-material/AlternateEmail";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { IdleState } from "./IdleState";
import EmptyResult from "./EmptyResult";
import ProfileCard from "./ProfileCard";

interface StoryLookupPageProps {
  /**
   * Called when the user submits a query.
   * Return a StoryResponse (or throw to show an error).
   */
  onFetch: (query: string) => Promise<{
    data?: StoryResponse;
    error?: HttpValidationError;
  }>;
  defaultMode?: PaletteMode;
}

type Status = "idle" | "loading" | "success" | "error";

export default function StoryLookupPageInner({
  onFetch,
}: StoryLookupPageProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<StoryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    setStatus("loading");
    setData(null);
    setErrorMsg("");
    try {
      const res = await onFetch(q);
      if (res.error || !res.data) {
        throw res.error || new Error("Something went wrong");
      }
      setData(res.data);
      setStatus("success");
    } catch (e: unknown) {
      console.log(e);
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputType = query ? (isUrl(query) ? "url" : "id") : null;

  const profiles = data?.result ?? [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5 }}>
      <Container maxWidth="sm">
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: "text.primary" }}>
            Story Lookup
          </Typography>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "block",
              fontFamily: "inherit",
              color: "text.secondary",
            }}
          >
            Fetch stories by profile ID or URL
          </Typography>
          <Divider sx={{ mt: 2, opacity: 0.35 }} />
        </Box>

        {/* Input */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="username / profile ID / URL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            disabled={status === "loading"}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {inputType === "url" ? (
                      <Link sx={{ fontSize: 16, color: "text.disabled" }} />
                    ) : (
                      <AlternateEmail
                        sx={{ fontSize: 16, color: "text.disabled" }}
                      />
                    )}
                  </InputAdornment>
                ),
                sx: { fontFamily: "inherit", fontSize: "0.82rem" },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
          />
          <Tooltip title="Fetch stories">
            <span>
              <IconButton
                onClick={handleSubmit}
                disabled={status === "loading" || !query.trim()}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  color: "#fff",
                  flexShrink: 0,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "action.disabled",
                  },
                  transition: "background 0.15s",
                }}
              >
                {status === "loading" ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : (
                  <ArrowForward sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Error */}
        {status === "error" && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.error.main, 0.25),
            }}
          >
            <Typography
              variant="caption"
              color="error.main"
              sx={{ fontFamily: "inherit" }}
            >
              {errorMsg}
            </Typography>
          </Box>
        )}

        {/* Results */}
        <Box sx={{ mt: 3 }}>
          {status === "idle" && <IdleState />}
          {status === "loading" && (
            <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={28} sx={{ color: "primary.main" }} />
            </Box>
          )}
          {status === "success" && profiles.length === 0 && <EmptyResult />}
          {status === "success" && profiles.length > 0 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "primary.main",
                    fontFamily: "inherit",
                  }}
                >
                  Results
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontFamily: "inherit" }}
                >
                  {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                {profiles.map((p, i) => (
                  <ProfileCard key={`${p.username}-${i}`} profile={p} />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
