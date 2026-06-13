import { storiesOrHighlightsStoriesSaveGet } from "../../api";
import StoryLookupPageInner from "./components/StoryLookupPageInner";

export default function StoriesPage() {
  return (
    <StoryLookupPageInner
      onFetch={async (query) => {
        const res = await storiesOrHighlightsStoriesSaveGet({
          query: { url_or_id: query },
        });
        return res;
        // return {};
      }}
    />
  );
}
