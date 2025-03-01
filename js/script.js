document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get references to elements
    const schoolList = document.getElementById('school-list');
    
    // Fetch schools from Supabase
    async function fetchSchools() {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) {
            console.error('Error fetching schools:', error.message);
            return;
        }
        
        if (data && data.length > 0) {
            displaySchools(data);
        } else {
            if (schoolList) {
                schoolList.innerHTML = '<p class="no-data">No schools found. Please check back later.</p>';
            }
        }
    }

    // Display schools in the list
    function displaySchools(schools) {
        if (!schoolList) return;
        
        schoolList.innerHTML = '';
        
        schools.forEach(school => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${school.name}</h3>
                <p>${school.description || 'No description available'}</p>
                <a href="school.html?id=${school.id}" class="view-school-btn">View Resources</a>
            `;
            schoolList.appendChild(li);
        });
    }

    // Toggle mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.getElementById('nav-links').classList.toggle('active');
        });
    }

    // Check if user profile dropdown exists and initialize it
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(event) {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            dropdownMenu.classList.toggle('active');
            event.stopPropagation();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            const dropdownMenu = profileDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Initial fetch of schools if on the home page
    if (schoolList) {
        fetchSchools();
    }
});