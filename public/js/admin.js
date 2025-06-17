// ✅ Récupération du token
const token = localStorage.getItem("token");
if (!token) {
  alert("No token found. Please log in.");
  window.location.href = "login.html";
}

// 🔁 Récupérer tous les utilisateurs
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

// 🗑️ Supprimer un utilisateur
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
    fetchUsers(); // Rafraîchir la liste
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete user");
  }
}

// ➕ Créer un nouvel utilisateur
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const student_card_number = document.getElementById(
    "student_card_number"
  )?.value;

  const body = {
    name,
    surname,
    email,
    password,
    role,
  };

  if (role === "student") {
    body.student_card_number = student_card_number;
  }

  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const statusMsg = document.getElementById("statusMessage");

    if (res.ok) {
      statusMsg.style.color = "green";
      statusMsg.textContent = `${role} created successfully`;
      document.getElementById("createForm").reset();
      fetchUsers();

      setTimeout(() => (statusMsg.textContent = ""), 4000);
    } else {
      statusMsg.style.color = "red";
      statusMsg.textContent = data.message || "Error creating user";
      setTimeout(() => (statusMsg.textContent = ""), 4000);
    }
  } catch (err) {
    console.error("Create error:", err);
    const statusMsg = document.getElementById("statusMessage");
    statusMsg.style.color = "red";
    statusMsg.textContent = "Server error";
  }
});

// 🚪 Déconnexion
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

// 🟢 Chargement automatique à l'ouverture de la page
window.onload = fetchUsers;
