// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// DOM Elements
const schoolsGrid = document.getElementById('schoolsGrid');
const schoolSearch = document.getElementById('schoolSearch');
const locationFilter = document.getElementById('locationFilter');
const typeFilter = document.getElementById('typeFilter');
const levelFilter = document.getElementById('levelFilter');

// State variables
let schools = [];
let filteredSchools = [];
let locations = new Set();

// Fetch all schools from Supabase
async function fetchSchools() {
    try {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        schools = data;
        filteredSchools = data;
        
        // Extract unique locations for the location filter
        data.forEach(school => {
            if (school.location) {
                locations.add(school.location);
            }
        });
        
        populateLocationFilter();
        renderSchools();
        
    } catch (error) {
        console.error('Error fetching schools:', error.message);
        schoolsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Schools</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Populate location filter dropdown with unique locations
function populateLocationFilter() {
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

// Render schools to the grid
function renderSchools() {
    if (filteredSchools.length === 0) {
        schoolsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Schools Found</h3>
                <p>Try adjusting your filters or search criteria.</p>
            </div>
        `;
        return;
    }
    
    schoolsGrid.innerHTML = '';
    
    filteredSchools.forEach(school => {
        const schoolCard = document.createElement('div');
        schoolCard.classList.add('school-card');
        
        schoolCard.innerHTML = `
            <img src="${school.image_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}" alt="${school.name}" class="school-image">
            <div class="school-info">
                <h3>${school.name}</h3>
                <div class="school-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${school.location}</p>
                    <p><i class="fas fa-school"></i> ${school.type} ${school.level}</p>
                    <p><i class="fas fa-users"></i> ${school.student_count || 'N/A'} Students</p>
                </div>
                <div class="school-actions">
                    <a href="#" class="join-btn" data-school-id="${school.id}">Join School</a>
                    <div class="school-stats">
                        <span class="stat"><i class="fas fa-book"></i> ${school.notes_count || 0}</span>
                        <span class="stat"><i class="fas fa-question-circle"></i> ${school.questions_count || 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        schoolsGrid.appendChild(schoolCard);
    });
    
    // Add event listeners to join buttons
    const joinButtons = document.querySelectorAll('.join-btn');
    joinButtons.forEach(button => {
        button.addEventListener('click', handleJoinSchool);
    });
}

// Handle joining a school
async function handleJoinSchool(e) {
    e.preventDefault();
    
    const schoolId = e.target.dataset.schoolId;
    
    // Check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
        alert('Please log in to join a school');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Check if already joined
        const { data: existing, error: checkError } = await supabase
            .from('school_members')
            .select()
            .eq('user_id', user.id)
            .eq('school_id', schoolId)
            .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existing) {
            alert('You are already a member of this school');
            return;
        }
        
        // Join the school
        const { error: joinError } = await supabase
            .from('school_members')
            .insert([
                { user_id: user.id, school_id: schoolId }
            ]);
        
        if (joinError) throw joinError;
        
        alert('Successfully joined the school!');
        
    } catch (error) {
        console.error('Error joining school:', error.message);
        alert('Error joining school. Please try again.');
    }
}

// Filter schools based on search and filter criteria
function filterSchools() {
    const searchTerm = schoolSearch.value.toLowerCase();
    const locFilter = locationFilter.value;
    const tFilter = typeFilter.value;
    const lFilter = levelFilter.value;
    
    filteredSchools = schools.filter(school => {
        // Apply search term filter
        const matchesSearch = school.name.toLowerCase().includes(searchTerm) || 
                             (school.description && school.description.toLowerCase().includes(searchTerm));
        
        // Apply dropdown filters
        const matchesLocation = !locFilter || school.location === locFilter;
        const matchesType = !tFilter || school.type === tFilter;
        const matchesLevel = !lFilter || school.level === lFilter;
        
        return matchesSearch && matchesLocation && matchesType && matchesLevel;
    });
    
    renderSchools();
}

// Event listeners
schoolSearch.addEventListener('input', filterSchools);
locationFilter.addEventListener('change', filterSchools);
typeFilter.addEventListener('change', filterSchools);
levelFilter.addEventListener('change', filterSchools);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSchools();
});