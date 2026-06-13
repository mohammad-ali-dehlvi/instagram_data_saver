import LinksPageInner from "./components/LinksPageInner";
import { useMemo } from "react";
import type { LinkItem } from "./types";

export default function HomePage() {
  // const title = "Dashboard";
  const links = useMemo<LinkItem[]>(() => {
    return [
      {
        id: "1",
        label: "Stories",
        url: "/stories",
        description: "Stories saver",
        tag: "Insta",
      },
      {
        id: "2",
        label: "Posts",
        url: "/posts",
        description: "Posts saver",
        tag: "Insta",
      },
      {
        id: "3",
        label: "All Posts",
        url: "/posts/all",
        description: "All posts by profile ID",
        tag: "Insta",
      },
    ];
  }, []);

  return <LinksPageInner links={links} />;
}
