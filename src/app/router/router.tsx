import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "@app/pages/home/HomePage.tsx";
import {AppRouter} from "@app/router/AppRouter.tsx";
import DocumentDetailPage from "@app/pages/document/DocumentDetailPage.tsx";
import DocumentsPage from "@app/pages/document/DocumentsPage.tsx";
import SharedPage from "@app/pages/shared/SharedPage.tsx";
import NotFound from "@app/pages/notfound/NotFound.tsx";
import DeletePage from "@app/pages/delete/DeletePage.tsx";
import AuthCallbackPage from "@app/pages/auth/AuthCallbackPage.tsx";
import SignInRedirectPage from "@app/pages/auth/SignInRedirectPage.tsx";
import { AuthGate } from "@features/auth/index.ts";

/**
 * 브라우저 전체 경로 구성
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGate><AppRouter /></AuthGate>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage mode="documents" />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/doc/:id" element={<DocumentDetailPage />} />
          <Route path="/delete" element={<DeletePage />} />
          <Route path="/delete/:id" element={<DeletePage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/signin" element={<SignInRedirectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
