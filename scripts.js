// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Call this function on page load
document.addEventListener('DOMContentLoaded', checkUserLoggedIn);

// Check if user is logged in
async function checkUserLoggedIn() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // User is logged in - fetch profile from Supabase
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();
                
            if (error) throw error;
            
            if (data) {
                // Update UI elements
                document.getElementById('auth-section').style.display = 'none';
                document.getElementById('user-section').style.display = 'flex';
                
                // Set user name from Supabase
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = data.full_name || 'shreyasroy123';
                }
                
                // Set profile picture from Supabase
                const userAvatarElement = document.getElementById('user-avatar');
                if (userAvatarElement) {
                    if (data.avatar_url) {
                        userAvatarElement.src = data.avatar_url;
                    } else {
                        // Create initials-based avatar as fallback
                        const names = (data.full_name || 'shreyasroy123').split(' ');
                        const initials = names.map(name => name.charAt(0)).join('').toUpperCase();
                        userAvatarElement.src = `https://via.placeholder.com/40/4a86e8/ffffff?text=${initials}`;
                    }
                }
            }
        } else {
            // User is not logged in
            document.getElementById('auth-section').style.display = 'flex';
            document.getElementById('user-section').style.display = 'none';
        }
    } catch (error) {
        console.error("Error checking authentication status:", error);
    }
}

// Login function
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
}

// Signup function
async function signup(email, password, fullName, phoneNumber, profilePicFile) {
    try {
        // Validate password
        if (!validatePassword(password)) {
            alert('Password must contain alphanumeric and special characters');
            return;
        }
        
        // Sign up with email and password
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (authError) throw authError;
        
        // Upload profile picture if provided
        let avatarUrl = null;
        if (profilePicFile) {
            const fileExt = profilePicFile.name.split('.').pop();
            const fileName = `${authData.user.id}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, profilePicFile);
                
            if (uploadError) throw uploadError;
            
            avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
        }
        
        // Create profile record
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    avatar_url: avatarUrl
                }
            ]);
            
        if (profileError) throw profileError;
        
        alert('Signup successful! Please check your email for verification.');
        window.location.href = 'login.html';
    } catch (error) {
        alert('Error signing up: ' + error.message);
    }
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
}

// Password validation
function validatePassword(password) {
    // At least 8 characters, alphanumeric and special characters
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Preview profile image
function previewProfileImage(input) {
    const preview = document.getElementById('profile-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Load schools from Supabase
async function loadSchools() {
    try {
        const { data, error } = await supabase
            .from('schools')
            .select('*');
            
        if (error) throw error;
        
        const schoolsList = document.getElementById('schools-list');
        if (!schoolsList) return;
        
        schoolsList.innerHTML = '';
        
        if (data.length === 0) {
            schoolsList.innerHTML = '<p>No schools found</p>';
            return;
        }
        
        data.forEach(school => {
            const schoolCard = document.createElement('div');
            schoolCard.className = 'school-card';
            schoolCard.innerHTML = `
                <div class="school-image">
                    <img src="${school.image_url || 'https://via.placeholder.com/300x150?text=School'}" alt="${school.name}">
                </div>
                <div class="school-info">
                    <h3>${school.name}</h3>
                    <p>${school.location}</p>
                    <a href="#" class="btn btn-primary">View School</a>
                </div>
            `;
            schoolsList.appendChild(schoolCard);
        });
    } catch (error) {
        console.error('Error loading schools:', error);
    }
}

// Execute when DOM is loaded for specific pages
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Common check for all pages
    checkUserLoggedIn();
    
    // Page-specific initializations
    if (currentPage === 'schools.html') {
        loadSchools();
    }
    
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
    
    // Setup signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('full-name').value;
            const phoneNumber = document.getElementById('phone').value;
            const profilePic = document.getElementById('profile-pic').files[0];
            signup(email, password, fullName, phoneNumber, profilePic);
        });
        
        // Setup profile image preview
        const profilePicInput = document.getElementById('profile-pic');
        if (profilePicInput) {
            profilePicInput.addEventListener('change', function() {
                previewProfileImage(this);
            });
        }
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});