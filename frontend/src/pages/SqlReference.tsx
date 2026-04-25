import { CodeBlock } from "@/components/ui/CodeBlock";

const queries = [
  {
    title: "1. All available drones with battery > 50%",
    explanation: "Simple SELECT with multiple WHERE conditions to find healthy, ready-to-fly drones.",
    sql: `SELECT id, model, battery_level 
FROM drones 
WHERE status = 'AVAILABLE' 
  AND battery_level > 50 
ORDER BY battery_level DESC;`
  },
  {
    title: "2. Delivery history for a specific drone",
    explanation: "Using JOINs across three tables to get a complete picture of a drone's activity.",
    sql: `SELECT f.id, o.customer_name, o.delivery_address, f.start_time, f.end_time
FROM flight_logs f
JOIN orders o ON f.order_id = o.id
WHERE f.drone_id = 3
ORDER BY f.start_time DESC;`
  },
  {
    title: "3. Operators ranked by total flights",
    explanation: "Retrieving data ordered by a specific numerical column to create a leaderboard.",
    sql: `SELECT name, license_number, experience_level, total_flights
FROM operators
ORDER BY total_flights DESC;`
  },
  {
    title: "4. Overdue maintenance report",
    explanation: "Using date math and filtering to find pending maintenance older than 7 days.",
    sql: `SELECT m.id, d.model, m.issue_reported, m.maintenance_date
FROM maintenance_records m
JOIN drones d ON m.drone_id = d.id
WHERE m.repair_status = 'PENDING'
  AND m.maintenance_date < CURRENT_DATE - INTERVAL '7 days';`
  },
  {
    title: "5. Orders delivered today",
    explanation: "Filtering by date using PostgreSQL's CURRENT_DATE variable.",
    sql: `SELECT id, customer_name, delivery_address
FROM orders
WHERE status = 'DELIVERED'
  AND DATE(created_at) = CURRENT_DATE;`
  },
  {
    title: "6. Average battery level by drone model",
    explanation: "Using GROUP BY and the AVG aggregate function.",
    sql: `SELECT model, ROUND(AVG(battery_level), 1) as avg_battery
FROM drones
GROUP BY model
ORDER BY avg_battery DESC;`
  },
  {
    title: "7. Flight duration calculation",
    explanation: "Computing the interval between two timestamps for completed flights.",
    sql: `SELECT id, drone_id, 
       start_time, end_time,
       EXTRACT(EPOCH FROM (end_time - start_time))/60 as duration_minutes
FROM flight_logs
WHERE status = 'COMPLETED' AND operator_id = 1;`
  },
  {
    title: "8. Order count grouped by status",
    explanation: "Grouping and counting to get an overview of the delivery pipeline.",
    sql: `SELECT status, COUNT(*) as order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC;`
  }
];

export function SqlReference() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="font-syne text-2xl font-bold text-white mb-2">SQL Query Reference</h1>
        <p className="text-slate-400 text-sm font-mono">
          Common analytical and operational queries used by the command center.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {queries.map((q, i) => (
          <div key={i} className="glass-card p-6 flex flex-col h-full">
            <h3 className="font-syne text-lg font-bold text-white mb-2">{q.title}</h3>
            <p className="text-sm text-slate-400 mb-4 flex-1">{q.explanation}</p>
            <div className="mt-auto">
              <CodeBlock code={q.sql} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
