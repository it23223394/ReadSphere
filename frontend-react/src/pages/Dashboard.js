import { Navbar } from '../components/Navbar';

function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-indigo-600">
          Welcome to ReadSphere 📚
        </h1>
        <p className="mt-2 text-gray-600">
          Track your reading journey beautifully.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
