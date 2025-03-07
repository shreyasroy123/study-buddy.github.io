// Supabase configuration and initialization
let supabase;

// Wait for the document to be fully loaded to ensure Supabase library is available
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize Supabase client with your actual credentials
        // Replace these with your actual Supabase URL and anon key
        const SUPABASE_URL = 'https://hrlyspzvewgxmtpcwjvw.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybHlzcHp2ZXdneG10cGN3anZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxNjcsImV4cCI6MjA1NjU3MjE2N30.TKDwRohOzECZ_gmucp6nAauJcDp0YXtiR4oC9weuLt4';
        
        // Validate Supabase URL format
        if (!SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('YOUR_SUPABASE')) {
            console.error("Invalid Supabase URL. Please set your actual Supabase URL.");
            document.getElementById('auth-section').style.display = 'flex';
            document.getElementById('user-section').style.display = 'none';
            return;
        }
        
        // Validate Supabase key format
        if (SUPABASE_ANON_KEY != 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybHlzcHp2ZXdneG10cGN3anZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxNjcsImV4cCI6MjA1NjU3MjE2N30.TKDwRohOzECZ_gmucp6nAauJcDp0YXtiR4oC9weuLt4') {
            console.error("Invalid Supabase anon key. Please set your actual Supabase anon key.");
            document.getElementById('auth-section').style.display = 'flex';
            document.getElementById('user-section').style.display = 'none';
            return;
        }
        
        // Create Supabase client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized successfully");
        
        const currentPage = window.location.pathname.split('/').pop();
        
        // Common check for all pages
        checkUserLoggedIn();
        
        // Update dynamic time display
        updateDateTime();
        
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
            
            // Setup real-time password validation
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                // Create password validation container if it doesn't exist
                let passwordValidationContainer = document.getElementById('password-validation-container');
                if (!passwordValidationContainer) {
                    passwordValidationContainer = document.createElement('div');
                    passwordValidationContainer.id = 'password-validation-container';
                    passwordValidationContainer.className = 'password-validation-container';
                    passwordValidationContainer.innerHTML = `
                        <div class="validation-item" id="length-validation">
                            <i class="fas fa-times-circle"></i> At least 8 characters
                        </div>
                        <div class="validation-item" id="uppercase-validation">
                            <i class="fas fa-times-circle"></i> At least one uppercase letter
                        </div>
                        <div class="validation-item" id="lowercase-validation">
                            <i class="fas fa-times-circle"></i> At least one lowercase letter
                        </div>
                        <div class="validation-item" id="number-validation">
                            <i class="fas fa-times-circle"></i> At least one number
                        </div>
                        <div class="validation-item" id="special-validation">
                            <i class="fas fa-times-circle"></i> At least one special character (@$!%*?&)
                        </div>
                    `;
                    passwordInput.parentNode.insertBefore(passwordValidationContainer, passwordInput.nextSibling);
                    
                    // Add some basic styles for the validation container
                    const style = document.createElement('style');
                    style.textContent = `
                        .password-validation-container {
                            font-size: 0.85rem;
                            color: #666;
                            margin-top: 5px;
                            margin-bottom: 10px;
                            padding: 10px;
                            border-radius: 4px;
                            background-color: #f8f9fa;
                        }
                        .validation-item {
                            margin-bottom: 5px;
                        }
                        .validation-item i {
                            margin-right: 5px;
                        }
                        .validation-success {
                            color: #28a745;
                        }
                        .validation-failure {
                            color: #dc3545;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Add real-time validation event
                passwordInput.addEventListener('input', function() {
                    validatePasswordRealTime(this.value);
                });
                
                // Initial validation state setup (if password field has a value on page load)
                if (passwordInput.value) {
                    validatePasswordRealTime(passwordInput.value);
                }
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
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('user-section').style.display = 'none';
    }
});

// Enhanced user authentication check
async function checkUserLoggedIn() {
    if (!supabase) {
        console.error("Supabase client not initialized");
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('user-section').style.display = 'none';
        return;
    }
    
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
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('user-section').style.display = 'none';
    }
}

// Login function
async function login(email, password) {
    if (!supabase) {
        console.error("Supabase client not initialized");
        return;
    }
    
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
    if (!supabase) {
        console.error("Supabase client not initialized");
        return;
    }
    
    try {
        // Validate password
        const validationResult = checkPasswordValidation(password);
        if (!validationResult.valid) {
            alert('Please fix the following password requirements:\n' + validationResult.errors.join('\n'));
            return;
        }
        
        // Sign up with email and password
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phoneNumber
                }
            }
        });
        
        if (authError) throw authError;
        
        if (!authData.user) {
            throw new Error("User creation failed. Please try again later.");
        }
        
        // Upload profile picture if provided
        let avatarUrl = null;
        if (profilePicFile) {
            const fileExt = profilePicFile.name.split('.').pop();
            const fileName = `${authData.user.id}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, profilePicFile);
                
            if (uploadError) {
                console.error('Error uploading profile picture:', uploadError);
                // Continue with signup even if image upload fails
            } else {
                avatarUrl = `${supabase.supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
            }
        }
        
        // Check if profiles table exists and has necessary permissions
        try {
            // Create profile record in a separate try-catch block
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: authData.user.id,
                        full_name: fullName,
                        phone_number: phoneNumber,
                        avatar_url: avatarUrl,
                        updated_at: new Date()
                    }
                ], { onConflict: 'id' });
                
            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Continue with signup even if profile creation fails
            }
        } catch (profileCreationError) {
            console.error('Profile creation exception:', profileCreationError);
            // Continue with signup even if profile creation fails
        }
        
        alert('Signup successful! Please check your email for verification.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Signup error details:', error);
        alert('Error signing up: ' + (error.message || 'Database error saving new user'));
    }
}
// Logout function
async function logout() {
    if (!supabase) {
        console.error("Supabase client not initialized");
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
}

// Password validation - checks all criteria at once
function validatePassword(password) {
    // At least 8 characters, including uppercase and lowercase letters, numbers, and special characters
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Enhanced password validation that returns specific errors
function checkPasswordValidation(password) {
    const result = {
        valid: true,
        errors: []
    };
    
    // Check length
    if (password.length < 8) {
        result.valid = false;
        result.errors.push('Password must be at least 8 characters long');
    }
    
    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        result.valid = false;
        result.errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        result.valid = false;
        result.errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check for numbers
    if (!/\d/.test(password)) {
        result.valid = false;
        result.errors.push('Password must contain at least one number');
    }
    
    // Check for special characters
    if (!/[@$!%*?&]/.test(password)) {
        result.valid = false;
        result.errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return result;
}

// Real-time password validation feedback
function validatePasswordRealTime(password) {
    // Check each validation criteria separately
    const lengthValid = password.length >= 8;
    const uppercaseValid = /[A-Z]/.test(password);
    const lowercaseValid = /[a-z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialValid = /[@$!%*?&]/.test(password);
    
    // Update UI for each validation criteria
    updateValidationUI('length-validation', lengthValid, 'At least 8 characters');
    updateValidationUI('uppercase-validation', uppercaseValid, 'At least one uppercase letter');
    updateValidationUI('lowercase-validation', lowercaseValid, 'At least one lowercase letter');
    updateValidationUI('number-validation', numberValid, 'At least one number');
    updateValidationUI('special-validation', specialValid, 'At least one special character (@$!%*?&)');
}

// Update validation UI element
function updateValidationUI(elementId, isValid, text) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isValid) {
            element.innerHTML = `<i class="fas fa-check-circle"></i> ${text}`;
            element.classList.add('validation-success');
            element.classList.remove('validation-failure');
        } else {
            element.innerHTML = `<i class="fas fa-times-circle"></i> ${text}`;
            element.classList.add('validation-failure');
            element.classList.remove('validation-success');
        }
    }
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
    if (!supabase) {
        console.error("Supabase client not initialized");
        return;
    }
    
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

// Dynamic time update function
function updateDateTime() {
    const currentDateElements = document.querySelectorAll('.current-date');
    if (currentDateElements.length === 0) return;
    
    const now = new Date();
    
    // Format date as YYYY-MM-DD HH:MM:SS
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    currentDateElements.forEach(element => {
        element.innerHTML = `<i class="far fa-calendar-alt"></i> Current Date: ${formattedDateTime} UTC`;
    });
    
    // Update every second
    setTimeout(updateDateTime, 1000);
}

// Function to check if user is admin
async function checkAdminStatus() {
    if (!supabase) {
        console.error("Supabase client not initialized");
        return false;
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        return data.is_admin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}