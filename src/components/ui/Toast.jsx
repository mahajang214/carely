import { motion } from "framer-motion";
import { X } from "lucide-react";

export function Toast({ message, onClose, duration = 4000 }) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gray-800 shadow-lg rounded-xl pl-4 w-80 flex items-start justify-between gap-3 overflow-hidden"
    >
      {/* Message */}
      <div className="text-sm text-gray-100 flex-1 py-4">{message}</div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="bg-red-500 hover:scale-110 transition text-white py-4 w-10 items-center flex justify-center"
      >
        <X size={18} />
      </button>

      {/* Timeline Bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        onAnimationComplete={onClose}
        className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-r-full"
      />
    </motion.div>
  );
}
