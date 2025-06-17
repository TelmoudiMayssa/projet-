document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 Redirect if not logged in or not librarian
  if (!token || !user || user.role !== "librarian") {
    window.location.href = "login.html";
    return;
  }

  // 📚 Load overdue loans and all books on page load
  loadOverdueLoans();
  loadAllBooks();

  // ➕ Handle Add Book form
  const addForm = document.getElementById("addBookForm");
  const statusMsg = document.getElementById("addMessage");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const author = document.getElementById("author").value.trim();
      const theme = document.getElementById("theme").value.trim();
      const reference_code = document
        .getElementById("reference_code")
        .value.trim();

      try {
        const res = await fetch("/api/books", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, author, theme, reference_code }),
        });

        const data = await res.json();

        if (res.ok) {
          statusMsg.style.color = "green";
          statusMsg.textContent = "✅ Book added successfully!";
          addForm.reset();
          loadAllBooks(); // reload book list
        } else {
          statusMsg.style.color = "red";
          statusMsg.textContent = data.message || "❌ Failed to add book.";
        }

        setTimeout(() => (statusMsg.textContent = ""), 4000);
      } catch (err) {
        console.error("Add book error:", err);
        statusMsg.style.color = "red";
        statusMsg.textContent = "🚫 Server error.";
        setTimeout(() => (statusMsg.textContent = ""), 4000);
      }
    });
  }

  // 🔁 Handle Return Book form
  const returnForm = document.getElementById("returnForm");
  if (returnForm) {
    returnForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ref = document.getElementById("referenceCode").value.trim();
      const msg = document.getElementById("returnMessage");

      if (!ref) {
        msg.style.color = "red";
        msg.textContent = "Please enter a reference code.";
        return;
      }

      try {
        const res = await fetch(`/api/loans/return/${ref}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          msg.style.color = "green";
          msg.textContent = data.message;
          loadOverdueLoans();
          returnForm.reset();
        } else {
          msg.style.color = "red";
          msg.textContent = data.message || "Failed to return book.";
        }

        setTimeout(() => (msg.textContent = ""), 4000);
      } catch (err) {
        console.error("Return book error:", err);
        msg.style.color = "red";
        msg.textContent = "Server error.";
        setTimeout(() => (msg.textContent = ""), 4000);
      }
    });
  }
});

// 📥 Load Overdue Loans Table
async function loadOverdueLoans() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/loans/overdue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    const table = document.getElementById("overdueTable");
    table.innerHTML = "";

    data.forEach((loan) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${loan.Book.title}</td>
        <td>${loan.User.name} (${loan.User.email})</td>
        <td>${new Date(loan.return_date).toLocaleDateString()}</td>
        <td>${loan.returned ? "Returned" : "Overdue"}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Load overdue error:", err);
    document.getElementById("overdueTable").innerHTML =
      '<tr><td colspan="4">Error loading overdue books.</td></tr>';
  }
}

// 📚 Load All Books
async function loadAllBooks() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/books", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const books = await res.json();
    const table = document.getElementById("bookTable");
    table.innerHTML = "";

    books.forEach((book) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.theme}</td>
        <td>${book.reference_code}</td>
        <td><button onclick="deleteBook('${book.reference_code}')">Delete</button></td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load books:", err);
    const table = document.getElementById("bookTable");
    table.innerHTML = '<tr><td colspan="5">Error loading books.</td></tr>';
  }
}

// ❌ Delete Book
async function deleteBook(reference_code) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to delete this book?")) return;

  try {
    const res = await fetch(`/api/books/${reference_code}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    loadAllBooks();
  } catch (err) {
    console.error("Delete book error:", err);
    alert("Failed to delete book");
  }
}

// 🚪 Logout
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
