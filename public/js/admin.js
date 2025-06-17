// Récupération du token dans le localStorage
const token = localStorage.getItem("token");
if (!token) {
  alert("Aucun token trouvé. Veuillez vous connecter.");
  window.location.href = "login.html";
}

// Afficher/cacher le champ numéro carte étudiante selon le rôle sélectionné
document.getElementById("role").addEventListener("change", (e) => {
  const studentCardInput = document.getElementById("student_card_number");
  if (e.target.value === "student") {
    studentCardInput.style.display = "block";
    studentCardInput.required = true;
  } else {
    studentCardInput.style.display = "none";
    studentCardInput.required = false;
  }
});

// Fonction pour récupérer tous les utilisateurs (admin uniquement)
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
        <button onclick="deleteUser(${user.id})">Supprimer</button>
      `;
      userList.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    alert("Échec du chargement des utilisateurs");
  }
}

// Supprimer un utilisateur
async function deleteUser(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    fetchUsers(); // rafraîchir la liste
  } catch (err) {
    console.error("Erreur de suppression :", err);
    alert("Échec de la suppression de l'utilisateur");
  }
}

// Créer un nouvel utilisateur (étudiant, bibliothécaire, admin)
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const student_card_number = document
    .getElementById("student_card_number")
    .value.trim();

  // Préparer le corps de la requête
  const bodyData = { name, surname, email, password, role };
  if (role === "student") {
    bodyData.student_card_number = student_card_number;
  }

  try {
    // Le controller attend POST sur /api/admin/users pour créer user
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} créé avec succès`);
      document.getElementById("createForm").reset();
      document.getElementById("student_card_number").style.display = "none";
      fetchUsers();
    } else {
      alert(data.message || "Erreur lors de la création de l'utilisateur");
    }
  } catch (err) {
    console.error("Erreur serveur :", err);
    alert("Erreur serveur");
  }
});

// Bouton déconnexion
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

// Charger la liste des utilisateurs au chargement de la page
window.onload = fetchUsers;
