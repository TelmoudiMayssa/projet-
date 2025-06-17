document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  fetchBorrowedBooks();
});

const token = localStorage.getItem("token");
let user;
try {
  user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
  user = null;
}

if (!token || !user || user.role !== "student") {
  window.location.href = "login.html";
}

// 🔁 Load all books
async function loadBooks() {
  const res = await fetch("/api/books", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const books = await res.json();
  const container = document.getElementById("bookList");
  container.innerHTML = "";

  books.forEach((book) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${book.title}</strong> by ${book.author} (${book.theme}) - 
      Status: ${book.status}</p>
      ${
        book.status === "available"
          ? `<button onclick="borrowBook(${book.id})">Borrow</button>`
          : ""
      }
      <hr/>
    `;
    container.appendChild(div);
  });
}

// ✅ Borrow a book
async function borrowBook(bookId) {
  const res = await fetch("/api/loans/borrow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ book_id: bookId }),
  });

  const data = await res.json();
  const msg = document.getElementById("message");
  if (res.ok) {
    msg.style.color = "green";
    msg.textContent = data.message;
    loadBooks();
    fetchBorrowedBooks();
  } else {
    msg.style.color = "red";
    msg.textContent = data.message;
  }
}

// 📚 Fetch borrowed books
async function fetchBorrowedBooks() {
  try {
    const res = await fetch(`/api/loans/user/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const loans = await res.json();
    const tbody = document.getElementById("borrowedTable");
    tbody.innerHTML = "";

    loans.forEach((loan) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${loan.Book?.title || "N/A"}</td>
        <td>${new Date(loan.borrow_date).toLocaleDateString()}</td>
        <td>${new Date(loan.return_date).toLocaleDateString()}</td>
        <td>${loan.returned ? "Returned" : "Borrowed"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching borrowed books:", err);
  }
}

// 🚪 Logout
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
