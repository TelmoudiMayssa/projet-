document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
  
    // Redirect if not a librarian
    if (!token || !user || user.role !== 'librarian') {
      window.location.href = 'login.html';
    }
  
    loadOverdueLoans();
  
    // Handle return form
    document.getElementById('returnForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const ref = document.getElementById('referenceCode').value.trim();
      const msg = document.getElementById('returnMessage');
  
      if (!bookId) {
        msg.style.color = 'red';
        msg.textContent = 'Please enter a book ID.';
        return;
      }
  
      try {
        const res = await fetch(`/api/loans/return/${ref}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          msg.style.color = 'green';
          msg.textContent = data.message;
          loadOverdueLoans();
          document.getElementById('returnForm').reset();
        } else {
          msg.style.color = 'red';
          msg.textContent = data.message || 'Failed to return book.';
        }
      } catch (err) {
        console.error('Return book error:', err);
        msg.style.color = 'red';
        msg.textContent = 'Server error.';
      }
    });
  });
  
  async function loadOverdueLoans() {
    const token = localStorage.getItem('token');
  
    try {
      const res = await fetch('/api/loans/overdue', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await res.json();
      const table = document.getElementById('overdueTable');
      table.innerHTML = '';
  
      data.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${loan.Book.title}</td>
          <td>${loan.User.name} (${loan.User.email})</td>
          <td>${new Date(loan.return_date).toLocaleDateString()}</td>
          <td>${loan.returned ? 'Returned' : 'Overdue'}</td>
        `;
        table.appendChild(row);
      });
    } catch (err) {
      console.error('Load overdue error:', err);
      document.getElementById('overdueTable').innerHTML =
        '<tr><td colspan="4">Error loading overdue books.</td></tr>';
    }
  }
  
  function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
  }
  