"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function CustomAlert({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 4000); // auto close after 4s
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-600/90 text-white";
      case "error":
        return "bg-red-600/90 text-white";
      case "warning":
        return "bg-yellow-500/90 text-white"; 
      default:
        return "bg-neutral-800/90 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg z-50 text-xs sm:text-base backdrop-blur-sm ${getStyles()}`}
        >
          {getIcon()}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomAlert;

//Documentation

//Step: 1 - Import CustomAlert

//Step: 2 - Declare
// const [alert, setAlert] = useState({ message: "", type: "" });

//Step: 3 - Set in section
//<CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

//Step: 4 - For Success
//setAlert({ message: "ActionSuccess", type: "success" });

//Step: 5 - For Error
//setAlert({message: err.response?.data?.error || "ActionFailed",type: "error",});

//Step: 6 - For Warning
//setAlert({message: "ActionWarning",type: "warning",});
