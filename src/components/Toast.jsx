import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          className="toast"
          role="status"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
