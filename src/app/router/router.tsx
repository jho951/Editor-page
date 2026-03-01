import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "@app/pages/home/HomePage.tsx";

import {AppRouter} from "@app/router/AppRouter.tsx";

import {DocRouter} from "@app/router/DocRouter.tsx";

import DocumentsPage from "@app/pages/document/DocumentsPage.tsx";
import DocCanvasPage from "@features/canvas/ui/pages/DocCanvasPage.tsx";

import SharedPage from "@app/pages/SharedPage.tsx";
import DocTextPage from "@app/pages/editor/DocTextPage.tsx";
import NotFound from "@app/pages/notfound/NotFound.tsx";
import DeletePage from "@app/pages/delete/DeletePage.tsx";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppRouter />}>

          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage mode="documents" />} />
          <Route path="/templates" element={<DocumentsPage mode="templates" />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/delete" element={<DeletePage />} />
          <Route path="/delete/:id" element={<DeletePage />} />

          <Route path="/doc/:id" element={<DocRouter />}>
              <Route path="text" element={<DocTextPage />} />
              <Route path="canvas" element={<DocCanvasPage />}/>
          </Route>

        </Route>

          <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default Router;
