document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        document.getElementById('error').textContent = data.message || 'Login failed';
        return;
      }
  
      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      // Redirect based on role
      switch (data.user.role) {
        case 'student':
          window.location.href = 'student-dashboard.html';
          break;
        case 'librarian':
          window.location.href = 'librarian-dashboard.html';
          break;
        case 'admin':
          window.location.href = 'admin-dashboard.html';
          break;
        default:
          alert('Unknown role');
      }
    } catch (err) {
      console.error(err);
      document.getElementById('error').textContent = 'Server error';
    }
  });
  