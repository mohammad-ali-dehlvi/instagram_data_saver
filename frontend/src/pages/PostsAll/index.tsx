import AllPostsPageInner from "./components/AllPostsPageInner";
import { postsAllPostsAllJobGet } from "../../api";

export default function PostsAllPage() {
  return (
    <AllPostsPageInner
      onStartJob={(id) => postsAllPostsAllJobGet({ query: { id } })}
    />
  );
}
