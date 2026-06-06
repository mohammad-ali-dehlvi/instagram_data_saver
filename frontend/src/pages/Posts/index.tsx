import PostLookupPageInner from "./components/PostsPageInner";
import { postsSavePostsSaveGet } from "../../api";

export default function PostsPage() {
  return (
    <PostLookupPageInner
      onFetch={async (url) => {
        return postsSavePostsSaveGet({ query: { url } });
      }}
    />
  );
}
