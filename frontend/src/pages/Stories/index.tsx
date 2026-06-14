import { storiesOrHighlightsStoriesSavePost } from "../../api";
import { useStorageStateContext } from "../../context/StorageState";
import StoryLookupPageInner from "./components/StoryLookupPageInner";

export default function StoriesPage() {
  const { selectedStorageState } = useStorageStateContext();
  return (
    <StoryLookupPageInner
      onFetch={async (query) => {
        const res = await storiesOrHighlightsStoriesSavePost({
          body: { url_or_id: query, storage_state: selectedStorageState },
        });
        return res;
        // return {};
      }}
    />
  );
}
