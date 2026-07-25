import { motion } from "framer-motion";

export default function StatCard({ label, value, helper, icon, tone = "blue" }) {
  return (
    <motion.article className={`stat-card tone-${tone}`} whileHover={{ y: -3 }}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
      <div className="stat-icon">{icon}</div>
    </motion.article>
  );
}
