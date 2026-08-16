import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import ArticleDetail from "./pages/ArticleDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="section/:sectionName" element={<SectionPage />} />
            <Route path="article/:id" element={<ArticleDetail />} />
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
