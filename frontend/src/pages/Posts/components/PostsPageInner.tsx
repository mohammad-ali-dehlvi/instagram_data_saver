import { useRef, useState } from "react";
import type { HttpValidationError, PostResponse } from "../../../api";
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
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import IdleState from "./IdleState";
import EmptyResult from "./EmptyResult";
import PostProfileCard from "./PostProfileCard";
import StorageStateSelect from "../../../components/StorageStateSelect";

interface PostLookupPageProps {
  onFetch: (url: string) => Promise<{
    data?: PostResponse;
    error?: HttpValidationError;
  }>;
}

type Status = "idle" | "loading" | "success" | "error";

export default function PostLookupPageInner({ onFetch }: PostLookupPageProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<PostResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const q = url.trim();
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
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  };

  const profiles = data?.result ?? [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5 }}>
      <Container maxWidth="sm">
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.3px",
              color: "text.primary",
            }}
          >
            Post Lookup
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mt: 0.5,
              display: "block",
              fontFamily: "inherit",
            }}
          >
            Fetch posts by URL
          </Typography>
          <Divider sx={{ mt: 2, opacity: 0.35 }} />
        </Box>

        <StorageStateSelect />

        {/* Input */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={status === "loading"}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: "inherit", fontSize: "0.8rem" },
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
          />
          <Tooltip title="Fetch posts">
            <span>
              <IconButton
                onClick={handleSubmit}
                disabled={status === "loading" || !url.trim()}
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
                  transition: "background .15s",
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
              bgcolor: (t) => alpha(t.palette.error.main, 0.08),
              border: "1px solid",
              borderColor: (t) => alpha(t.palette.error.main, 0.25),
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
              <CircularProgress size={26} sx={{ color: "primary.main" }} />
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
                  <PostProfileCard key={`${p.username ?? i}`} profile={p} />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
