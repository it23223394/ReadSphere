import { Navbar } from '../components/Navbar';

function NotesQuotes() {
  return (
    <div>
      <Navbar />
      <div className="page">
        <h2 className="text-2xl font-bold heading-primary mb-2">Notes & Quotes</h2>
        <p className="text-muted">Capture and search your thoughts from books.</p>
      </div>
    </div>
  );
}
export default NotesQuotes;
