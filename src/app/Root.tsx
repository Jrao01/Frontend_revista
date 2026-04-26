import { Outlet, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export function Root() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: 0.22,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ minHeight: "100vh" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
