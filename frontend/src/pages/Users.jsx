import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";

const users = [
  { name: "Safety Admin", role: "Admin", access: "Full access" },
  { name: "Shift Supervisor", role: "Supervisor", access: "Monitor and resolve" },
  { name: "Safety Viewer", role: "Viewer", access: "Read only" },
];

export default function Users() {
  return (
    <>
      <PageHeader title="Users & Roles" subtitle="Role-based access control for safety operations" />
      <Panel title="Platform Users">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Access</th><th>Status</th></tr></thead>
            <tbody>{users.map((u) => <tr key={u.name}><td>{u.name}</td><td>{u.role}</td><td>{u.access}</td><td><span className="severity low">Active</span></td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
