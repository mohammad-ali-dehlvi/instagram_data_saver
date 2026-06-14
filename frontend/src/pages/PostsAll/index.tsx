import AllPostsPageInner from "./components/AllPostsPageInner";
import { postsAllPostsAllJobPost } from "../../api";
import { useStorageStateContext } from "../../context/StorageState";

export default function PostsAllPage() {
  const { selectedStorageState } = useStorageStateContext();
  return (
    <AllPostsPageInner
      onStartJob={(id) =>
        postsAllPostsAllJobPost({
          body: { id, storage_state: selectedStorageState },
        })
      }
    />
  );
}
