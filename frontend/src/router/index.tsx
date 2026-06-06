import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "../pages/Home";
import StoriesPage from "../pages/Stories";
import PostsPage from "../pages/Posts";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/posts" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
