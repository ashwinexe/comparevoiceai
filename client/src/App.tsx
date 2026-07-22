import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";

const Home = lazy(() => import("@/pages/home"));
const BlogIndex = lazy(() => import("@/pages/blog-index"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const LLMPage = lazy(() => import("@/pages/llm"));
const NotFound = lazy(() => import("@/pages/not-found"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy"));
const ProvidersPage = lazy(() => import("@/pages/providers"));
const STTPage = lazy(() => import("@/pages/stt"));
const TermsOfService = lazy(() => import("@/pages/terms"));
const TTSPage = lazy(() => import("@/pages/tts"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center font-mono font-bold">Loading page…</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/stt" component={STTPage} />
        <Route path="/tts" component={TTSPage} />
        <Route path="/llm" component={LLMPage} />
        <Route path="/providers" component={ProvidersPage} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <Router />;
}
