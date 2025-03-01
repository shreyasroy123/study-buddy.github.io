// filepath: /notes-buddy/notes-buddy/src/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    const schoolList = document.getElementById('school-list');
    
    // Fetch schools from Supabase
    async function fetchSchools() {
        const response = await fetch('https://your-supabase-url/rest/v1/schools', {
            method: 'GET',
            headers: {
                'apikey': 'your-supabase-api-key',
                'Authorization': 'Bearer your-supabase-jwt',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const schools = await response.json();
            displaySchools(schools);
        } else {
            console.error('Error fetching schools:', response.statusText);
        }
    }

    // Display schools in the list
    function displaySchools(schools) {
        schools.forEach(school => {
            const li = document.createElement('li');
            li.textContent = school.name; // Assuming the school object has a 'name' property
            schoolList.appendChild(li);
        });
    }

    // Handle navigation
    document.getElementById('login-link').addEventListener('click', function() {
        window.location.href = 'accounts.html';
    });

    document.getElementById('signup-link').addEventListener('click', function() {
        window.location.href = 'accounts.html';
    });

    // Initial fetch of schools
    fetchSchools();
});