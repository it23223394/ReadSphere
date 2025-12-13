import { useEffect, useState } from "react";
import { getBooks } from "../services/api";

function Bookshelf() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookshelf</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="p-4 border rounded-lg shadow">
            <h3 className="font-bold">{book.title}</h3>
            <p className="text-sm text-gray-500">{book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bookshelf;
