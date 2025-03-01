// Store current user and time information
const currentDateTime = '2025-03-01 11:13:40'; // UTC formatted time
const currentUserLogin = 'shreyasroy123';

// Initialize Supabase client with specific site URL
const supabase = supabaseJs.createClient(
    'https://zkirlipgjgbzjcmztfmi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraXJsaXBnamdiempjbXp0Zm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDk2MzIsImV4cCI6MjA1NjM4NTYzMn0.wDWggmQxr-OiOw--tXzCgStB9s4CsVd3rAOPPcBX-Os',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);
// Add this navbar template
const navbarTemplate = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="index.html">Study Buddy</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="schools.html">Schools</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li id="auth-section" class="nav-item">
                        <!-- Auth content will be inserted here -->
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;

// Insert navbar when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.navbar')) {
        document.body.insertAdjacentHTML('afterbegin', navbarTemplate);
    }
});
// Get DOM elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');
const signupProfilePicInput = document.getElementById('signup-profile-pic');
const signupPreviewImage = document.getElementById('signup-preview-image');

// Check for authentication status changes
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
        window.location.href = 'index.html';
    } else if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }
});

// Add CryptoJS password hashing functions
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// Verify password function using CryptoJS
function verifyPassword(password, hash, salt) {
    const hashedAttempt = CryptoJS.SHA256(password + salt).toString();
    return hashedAttempt === hash;
}


document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const schoolList = document.getElementById('school-list');
    const logoutLink = document.getElementById('logout-link');
    const profilePic = document.getElementById('profile-pic');
    const userName = document.getElementById('user-name');
    const uploadForm = document.getElementById('upload-form');
    const overlay = document.getElementById('overlay');
    const uploadProfilePicLink = document.getElementById('upload-profile-pic');
    const cancelUploadBtn = document.getElementById('cancel-upload');
    const profilePicForm = document.getElementById('profile-pic-form');
    const profilePicInput = document.getElementById('profile-pic-input');
    const previewImage = document.getElementById('preview-image');
    
    // Login form elements
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    // Signup form elements
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');
    const signupProfilePicInput = document.getElementById('signup-profile-pic');
    const signupPreviewImage = document.getElementById('signup-preview-image');
    
    const loggedInElements = document.querySelectorAll('.logged-in');
    const loggedOutElements = document.querySelectorAll('.logged-out');
    
    // Check authentication status on page load
    checkAuthStatus();
    
    
    // Fetch schools from Supabase (if on a page with school list)
    if (schoolList) {
        fetchSchools();
    }
   
// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (loginError) loginError.textContent = '';
        
        try {
            const hashedPassword = hashPassword(password);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: hashedPassword
            });
            
            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    throw new Error('Please check your email to confirm your account before logging in.');
                }
                throw error;
            }
            
            // Redirect to home page after successful login
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Login error:', error);
            if (loginError) {
                loginError.textContent = `Login failed: ${error.message}`;
            } else {
                alert('Login failed: ' + error.message);
            }
        }
    });
}
   
// Add profile picture preview functionality
if (signupProfilePicInput && signupPreviewImage) {
    signupProfilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                signupProfilePicInput.value = '';
                signupPreviewImage.style.display = 'none';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                signupProfilePicInput.value = '';
                signupPreviewImage.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                signupPreviewImage.src = e.target.result;
                signupPreviewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            signupPreviewImage.style.display = 'none';
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (signupError) signupError.textContent = '';
        
        const fullName = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const phone = document.getElementById('signup-phone').value;
        
        // Password validation
        if (password !== confirmPassword) {
            if (signupError) signupError.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            // Show loading state
            const submitButton = signupForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Signing up...';
            }

            // Step 1: Sign up with Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    },
                    emailRedirectTo: 'https://shreyasroy123.github.io/study-buddy.github.io/confirmation-success.html'
                }
            });

            if (signUpError) throw signUpError;

            if (data?.user) {
                console.log('Signup successful, user ID:', data.user.id);
                
                // Show success message with detailed instructions
                const message = 'Sign up successful!\n\n' +
                    'Important Instructions:\n' +
                    '1. Check your email inbox for the confirmation link\n' +
                    '2. If you don\'t see the email, please:\n' +
                    '   - Check your Spam/Junk folder\n' +
                    '   - Wait a few minutes and refresh your inbox\n' +
                    '   - Add no-reply@supabase.co to your contacts\n' +
                    '3. Click the confirmation link in the email\n' +
                    '4. After confirming, return to login\n\n' +
                    'Having trouble? Try these steps:\n' +
                    '- Use a different email provider (Gmail/Outlook)\n' +
                    '- Clear your browser cache and try again\n' +
                    '- Contact support if issues persist';
                
                alert(message);
                window.location.href = 'login.html';
            } else {
                throw new Error('Signup failed - no user data returned');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            
            // Reset button state
            const submitButton = signupForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }
            
            if (signupError) {
                if (error.message.includes('valid email')) {
                    signupError.textContent = 'Please enter a valid email address';
                } else if (error.message.includes('already exists')) {
                    signupError.textContent = 'An account with this email already exists';
                } else {
                    signupError.textContent = 'Sign up failed: ' + error.message;
                }
            }
        }
    });
}

// Check authentication status on page load
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Auth error:', error);
        return;
    }

    if (session) {
        // User is logged in
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return;
        }

        updateNavbar(true, profile);
    } else {
        // User is not logged in
        updateNavbar(false);
    }
}

// Update this function
function updateNavbar(isAuthenticated, profile = null) {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    if (isAuthenticated && profile) {
        authSection.innerHTML = `
            <div class="dropdown">
                <button class="btn nav-link dropdown-toggle d-flex align-items-center" type="button" 
                        id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="${profile.avatar_url || 'images/default-avatar.png'}" 
                         alt="Profile" class="rounded-circle me-2" width="30" height="30">
                    <span>${profile.full_name || profile.email}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item" id="logout-btn">Logout</button></li>
                </ul>
            </div>`;

        // Add logout handler
        document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    } else {
        authSection.innerHTML = `
            <div class="d-flex">
                <a class="nav-link" href="login.html">Login</a>
                <a class="nav-link ms-3" href="signup.html">Sign Up</a>
            </div>`;
    }
}
// Initialize navbar
async function initializeNavbar() {
    console.log('Initializing navbar...'); // Debug log

    // First, ensure the navbar exists
    const navbarNav = document.querySelector('.navbar-nav');
    if (!navbarNav) {
        console.error('Navbar not found');
        return;
    }

    // Clear existing nav items
    navbarNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="index.html">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="schools.html">Schools</a>
        </li>
    `;

    try {
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            throw sessionError;
        }

        console.log('Session status:', session ? 'Logged in' : 'Not logged in'); // Debug log

        if (session && session.user) {
            // User is logged in
            console.log('User ID:', session.user.id); // Debug log

            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
            }

            // Add authenticated user elements
            navbarNav.innerHTML += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                       data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="${profile?.avatar_url || 'images/default-avatar.png'}" 
                             alt="Profile" class="rounded-circle" width="30" height="30">
                        ${profile?.full_name || 'User'}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logout-btn">Logout</a></li>
                    </ul>
                </li>
            `;

            // Add logout handler
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    console.log('Logout clicked'); // Debug log
                    try {
                        const { error } = await supabase.auth.signOut();
                        if (error) throw error;
                        window.location.href = 'login.html';
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                });
            }
        } else {
            // User is not logged in
            navbarNav.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="login.html">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="signup.html">Sign Up</a>
                </li>
            `;
        }
    } catch (error) {
        console.error('Navbar initialization error:', error);
        // Add default unauthenticated nav items
        navbarNav.innerHTML += `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="signup.html">Sign Up</a>
            </li>
        `;
    }
}
// Initialize navbar on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug log
    initializeNavbar();
});
// Keep only this ONE auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    await checkAuth(); // Update navbar
    
    if (event === 'SIGNED_IN') {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    } else if (event === 'SIGNED_OUT') {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});
    // Handle logout
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                // Redirect to home page after logout
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('Error logging out:', error.message);
            }
        });
    }
    
    // Show/hide profile picture upload form
    if (uploadProfilePicLink) {
        uploadProfilePicLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (uploadForm && overlay) {
                uploadForm.style.display = 'block';
                overlay.style.display = 'block';
                
                // Reset preview image to current profile picture
                if (previewImage && profilePic) {
                    previewImage.src = profilePic.src;
                }
            }
        });
    }
    
    // Close profile picture upload form
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
            if (uploadForm && overlay) {
                uploadForm.style.display = 'none';
                overlay.style.display = 'none';
            }
        });
    }
    
    // Preview profile image before upload
    if (profilePicInput && previewImage) {
        profilePicInput.addEventListener('change', () => {
            const file = profilePicInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle profile picture upload
    if (profilePicForm) {
        profilePicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const file = profilePicInput.files[0];
            if (!file) {
                alert('Please select an image to upload');
                return;
            }
            
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    alert('You must be logged in to upload a profile picture');
                    return;
                }
                
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;
                
                // Upload image to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);
                
                if (uploadError) throw uploadError;
                
                // Update user profile with new avatar
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: fileName })
                    .eq('id', user.id);
                
                if (updateError) throw updateError;
                
                // Update UI
                if (profilePic) {
                    const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
                    profilePic.src = avatarUrl;
                }
                
                // Close modal
                if (uploadForm && overlay) {
                    uploadForm.style.display = 'none';
                    overlay.style.display = 'none';
                }
                
                alert('Profile picture updated successfully!');
                
            } catch (error) {
                alert('Error uploading profile picture: ' + error.message);
            }
        });
    }
    
    // Check if user is authenticated
    async function checkAuthStatus() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // User is signed in
                showAuthUI(true);
                fetchUserProfile(user.id);
            } else {
                // User is signed out
                showAuthUI(false);
            }
        } catch (error) {
            console.error('Error checking authentication status:', error.message);
            showAuthUI(false);
        }
    }
    
    // Show/hide UI elements based on auth status
    function showAuthUI(isAuthenticated) {
        if (isAuthenticated) {
            // Show elements that should be visible when logged in
            loggedInElements.forEach(el => el.style.display = 'block');
            loggedOutElements.forEach(el => el.style.display = 'none');
        } else {
            // Show elements that should be visible when logged out
            loggedInElements.forEach(el => el.style.display = 'none');
            loggedOutElements.forEach(el => el.style.display = 'block');
        }
    }
    
    // Fetch user profile data
    async function fetchUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            // Update profile picture and name if available
            if (data) {
                // Update name in the navbar
                if (data.full_name && userName) {
                    userName.textContent = data.full_name;
                }
                
                // Update profile picture in the navbar
                if (data.avatar_url && profilePic) {
                    const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${data.avatar_url}`;
                    profilePic.src = avatarUrl;
                }
            }
            
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        }
    }
    
    // Fetch schools from Supabase
    async function fetchSchools() {
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('*');
                
            if (error) throw error;
            
            displaySchools(data || []);
        } catch (error) {
            console.error('Error fetching schools:', error.message);
            fallbackFetchSchools();
        }
    }
    
    // Fallback fetch method
    async function fallbackFetchSchools() {
        try {
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
        } catch (error) {
            console.error('Failed to fetch schools:', error);
        }
    }

    // Display schools in the list
    function displaySchools(schools) {
        if (!schoolList) return;
        
        schoolList.innerHTML = '';
        schools.forEach(school => {
            const li = document.createElement('li');
            li.textContent = school.name || 'School name not available';
            schoolList.appendChild(li);
        });
        
        // If no schools were found or the array is empty
        if (schools.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No schools found';
            schoolList.appendChild(li);
        }
    }
    
    // Password validation: at least one special character and one alphanumeric
    function validatePassword(password) {
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasAlphanumeric = /[a-zA-Z0-9]/.test(password);
        return hasSpecialChar && hasAlphanumeric;
    }
    
    // Display current user and time information in console
    console.log(`Current user: ${currentUserLogin}`);
    console.log(`Current date and time: ${currentDateTime}`);
});