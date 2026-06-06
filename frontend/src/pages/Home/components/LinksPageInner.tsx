import { useMemo } from "react";
import type { LinkItem } from "../types";
import {
  Box,
  Container,
  Divider,
  Fade,
  Stack,
  Typography,
} from "@mui/material";
import EmptyState from "./EmptyState";
import LinkCard from "./LinkCard";

interface LinksPageInnerProps {
  links: LinkItem[];
}

export default function LinksPageInner(props: LinksPageInnerProps) {
  const { links } = props;
  const title = "Links";
  const subtitle = "A curated collection of useful resources.";

  // Group by tag
  const grouped = useMemo(() => {
    const map = new Map<string, LinkItem[]>();
    const noTag: LinkItem[] = [];
    links.forEach((l) => {
      if (l.tag) {
        if (!map.has(l.tag)) map.set(l.tag, []);
        map.get(l.tag)!.push(l);
      } else {
        noTag.push(l);
      }
    });
    // Return groups in insertion order; untagged last
    const result: Array<{ tag: string | null; items: LinkItem[] }> = [];
    map.forEach((items, tag) => result.push({ tag, items }));
    if (noTag.length) result.push({ tag: null, items: noTag });
    return result;
  }, [links]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="text.primary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
          <Divider sx={{ mt: 2.5, opacity: 0.4 }} />
        </Box>

        {/* Links */}
        {links.length === 0 ? (
          <EmptyState />
        ) : grouped.length === 1 && grouped[0].tag === null ? (
          // No tags — flat list
          <Stack spacing={1.5}>
            {links.map((link) => (
              <Fade in key={link.id} timeout={300}>
                <Box>
                  <LinkCard item={link} />
                </Box>
              </Fade>
            ))}
          </Stack>
        ) : (
          // Grouped by tag
          <Stack spacing={4}>
            {grouped.map(({ tag, items }) => (
              <Box key={tag ?? "__untagged__"}>
                {tag && (
                  <Typography
                    variant="overline"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "primary.main",
                      display: "block",
                      mb: 1.5,
                    }}
                  >
                    {tag}
                  </Typography>
                )}
                <Stack spacing={1.5}>
                  {items.map((link) => (
                    <Fade in key={link.id} timeout={300}>
                      <Box>
                        <LinkCard item={link} />
                      </Box>
                    </Fade>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Footer */}
        {links.length > 0 && (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ mt: 5, textAlign: "center", fontSize: "0.72rem" }}
          >
            {links.length} link{links.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
