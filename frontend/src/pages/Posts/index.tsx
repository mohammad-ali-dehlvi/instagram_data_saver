import PostLookupPageInner from "./components/PostsPageInner";
import { postsSavePostsSavePost } from "../../api";
import { useStorageStateContext } from "../../context/StorageState";

export default function PostsPage() {
  const { selectedStorageState } = useStorageStateContext();
  return (
    <PostLookupPageInner
      onFetch={async (url) => {
        return postsSavePostsSavePost({
          body: { url, storage_state: selectedStorageState },
        });
      }}
    />
  );
}
