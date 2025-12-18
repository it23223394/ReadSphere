import { Navbar } from '../components/Navbar';

function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 className="text-3xl font-bold heading-primary">
          Welcome to ReadSphere 📚
        </h1>
        <p className="mt-2 text-muted">
          Track your reading journey beautifully.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
