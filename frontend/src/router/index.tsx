import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "../pages/Home";
import StoriesPage from "../pages/Stories";
import PostsPage from "../pages/Posts";
import PostsAllPage from "../pages/PostsAll";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/all" element={<PostsAllPage />} />
      </Routes>
    </BrowserRouter>
  );
}
