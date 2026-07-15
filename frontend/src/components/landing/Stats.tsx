import { motion } from 'framer-motion';
import { Users, Activity, Shield, Award } from 'lucide-react';

const stats = [
  { label: 'Healthcare Workers', value: '2,000+', icon: Users, color: 'from-blue-400 to-blue-600' },
  { label: 'Patients Registered', value: '15,000+', icon: Activity, color: 'from-emerald-400 to-emerald-600' },
  { label: 'Risk Assessments', value: '50,000+', icon: Shield, color: 'from-purple-400 to-purple-600' },
  { label: 'Reports Generated', value: '10,000+', icon: Award, color: 'from-amber-400 to-amber-600' },
];

export function Stats() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 lg:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-surface-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
