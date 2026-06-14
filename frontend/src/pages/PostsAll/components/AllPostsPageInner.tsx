import { useEffect, useRef, useState } from "react";
import type {
  HttpValidationError,
  JobDataMultiplePostResponse,
  MultiplePostResponse,
  PostAllJobResponse,
} from "../../../api";
import { client } from "../../../api/client.gen";
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import AlternateEmail from "@mui/icons-material/AlternateEmail";
import ArrowForward from "@mui/icons-material/ArrowForward";
import EmptyResult from "../../Posts/components/EmptyResult";
import IdleState from "../../Posts/components/IdleState";
import AllPostsProfileCard from "./AllPostsProfileCard";
import StorageStateSelect from "../../../components/StorageStateSelect";

interface AllPostsPageInnerProps {
  onStartJob: (id: string) => Promise<{
    data?: PostAllJobResponse;
    error?: HttpValidationError;
  }>;
}

type Status = "idle" | "starting" | "streaming" | "success" | "error";

export default function AllPostsPageInner({
  onStartJob,
}: AllPostsPageInnerProps) {
  const [profileId, setProfileId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [jobId, setJobId] = useState("");
  const [completed, setCompleted] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [data, setData] = useState<MultiplePostResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  const closeStream = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };

  const openStream = (nextJobId: string) => {
    closeStream();
    const baseUrl = client.getConfig().baseUrl ?? window.location.origin;
    const source = new EventSource(
      `${baseUrl}/posts/all/${encodeURIComponent(nextJobId)}`,
    );

    const handleEvent = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as JobDataMultiplePostResponse;
        setCompleted(
          typeof payload.completed === "number" ? payload.completed : null,
        );
        setTotal(typeof payload.total === "number" ? payload.total : null);

        if (payload.event === "completed") {
          setData(payload.data ?? null);
          setStatus("success");
          closeStream();
          return;
        }

        if (payload.event === "error") {
          setErrorMsg("The job failed while fetching posts.");
          setStatus("error");
          closeStream();
          return;
        }

        setStatus("streaming");
      } catch {
        setErrorMsg("Could not read the job update.");
        setStatus("error");
        closeStream();
      }
    };

    source.addEventListener("message", handleEvent as EventListener);
    source.addEventListener("progress", handleEvent as EventListener);
    source.addEventListener("completed", handleEvent as EventListener);
    source.onerror = (event) => {
      if ("data" in event) {
        handleEvent(event as MessageEvent<string>);
        return;
      }
      setErrorMsg("The live connection was interrupted.");
      setStatus("error");
      closeStream();
    };
    eventSourceRef.current = source;
  };

  const handleSubmit = async () => {
    const q = profileId.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }

    closeStream();
    setStatus("starting");
    setJobId("");
    setCompleted(null);
    setTotal(null);
    setData(null);
    setErrorMsg("");

    try {
      const res = await onStartJob(q);
      if (res.error || !res.data) {
        throw res.error || new Error("Something went wrong");
      }
      setJobId(res.data.job_id);
      setStatus("streaming");
      openStream(res.data.job_id);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  };

  const isWorking = status === "starting" || status === "streaming";
  const profiles = data?.result ?? [];
  const hasProgress =
    typeof completed === "number" && typeof total === "number" && total > 0;
  const progressValue = hasProgress
    ? Math.min((completed! / total!) * 100, 100)
    : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5 }}>
      <Container maxWidth="sm">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.3px",
              color: "text.primary",
            }}
          >
            All Posts
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
            Fetch all posts by profile ID
          </Typography>
          <Divider sx={{ mt: 2, opacity: 0.35 }} />
        </Box>

        <StorageStateSelect />

        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="profile ID"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={isWorking}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmail
                      sx={{ fontSize: 15, color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
                sx: { fontFamily: "inherit", fontSize: "0.8rem" },
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
          />
          <Tooltip title="Fetch all posts">
            <span>
              <IconButton
                onClick={handleSubmit}
                disabled={isWorking || !profileId.trim()}
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
                {isWorking ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : (
                  <ArrowForward sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

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

        {isWorking && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant={hasProgress ? "determinate" : "indeterminate"}
              value={progressValue}
              sx={{ height: 4, borderRadius: 1, bgcolor: "background.paper" }}
            />
            <Box
              sx={{
                mt: 0.85,
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "inherit" }}
              >
                {status === "starting" ? "Starting job" : "Fetching posts"}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontFamily: "inherit" }}
              >
                {hasProgress ? `${completed}/${total}` : jobId || "Waiting"}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          {status === "idle" && <IdleState />}
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
                {profiles.map((profile, i) => (
                  <AllPostsProfileCard
                    key={`${profile.username ?? "profile"}-${i}`}
                    profile={profile}
                  />
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
