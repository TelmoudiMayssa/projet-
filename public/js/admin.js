// Get token from storage
const token = localStorage.getItem("token");
if (!token) {
  alert("No token found. Please log in.");
  window.location.href = "login.html";
}

// 🔁 Fetch all users
async function fetchUsers() {
  try {
    const res = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    data.forEach((user) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${user.name} ${user.surname}</strong> - ${user.email} (${user.role})
        <button onclick="deleteUser(${user.id})">Delete</button>
      `;
      userList.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    alert("Failed to load users");
  }
}

// 🗑️ Delete a user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    fetchUsers(); // refresh list
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete user");
  }
}

// ➕ Create new librarian
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/admin/librarians", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, surname, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Librarian created successfully");
      document.getElementById("createForm").reset();
      fetchUsers();
    } else {
      alert(data.message || "Error creating librarian");
    }
  } catch (err) {
    console.error("Create error:", err);
    alert("Server error");
  }
});

// 🚪 Logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

// 🟢 Load users on page load
window.onload = fetchUsers;
