// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
const SUPABASE_KEY = 'YOUR_SUPABASE_PUBLIC_KEY'; // Replace with your actual Supabase public key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkUserAuth();
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Handle logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Handle mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.getElementById('nav-links').classList.toggle('active');
        });
    }
});

// Check if user is logged in and update UI accordingly
async function checkUserAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Toggle visibility of auth links and user profile
    const authLinks = document.querySelectorAll('.auth-links');
    const userProfile = document.querySelector('.user-profile');
    
    if (user) {
        // User is logged in
        authLinks.forEach(link => link.classList.add('hidden'));
        if (userProfile) {
            userProfile.classList.remove('hidden');
            
            // Fetch user profile data from the profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();
            
            if (data) {
                // Update navbar with user info
                document.getElementById('navbar-user-name').textContent = data.full_name;
                if (data.avatar_url) {
                    document.getElementById('navbar-profile-pic').src = data.avatar_url;
                }
            }
        }
    } else {
        // User is not logged in
        authLinks.forEach(link => link.classList.remove('hidden'));
        if (userProfile) {
            userProfile.classList.add('hidden');
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember')?.checked || false;
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    try {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        // If remember me is not checked, set session expiry
        if (!rememberMe) {
            // Set session to expire in 24 hours
            await supabase.auth.setSession({
                expires_in: 86400 // 24 hours in seconds
            });
        }
        
        // Redirect to home page on successful login
        window.location.href = 'index.html';
    } catch (error) {
        // Display error message
        alert(`Login failed: ${error.message}`);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const profilePictureInput = document.getElementById('profile-picture');
    const profilePicture = profilePictureInput.files[0];
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validate form inputs
    if (!validatePassword(password)) {
        alert('Please make sure your password meets all requirements.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms of Service and Privacy Policy.');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    try {
        // Create new user in Supabase Auth
        const { data: { user }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    phone: phone
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Upload profile picture to storage if provided
        let avatarUrl = null;
        if (profilePicture) {
            const fileExt = profilePicture.name.split('.').pop();
            const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `avatars/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, profilePicture);
            
            if (uploadError) {
                console.error('Error uploading profile picture:', uploadError);
            } else {
                // Get public URL for the uploaded image
                const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath);
                
                avatarUrl = publicUrl;
            }
        }
        
        // Insert additional user info into profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    full_name: name,
                    phone: phone,
                    avatar_url: avatarUrl,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (profileError) {
            console.error('Error creating profile:', profileError);
        }
        
        // Show success message and redirect
        alert('Account created successfully! Please check your email to confirm your registration.');
        window.location.href = 'index.html';
    } catch (error) {
        // Display error message
        alert(`Signup failed: ${error.message}`);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Handle logout
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        
        // Redirect to home page after logout
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
}

// Validate password meets requirements
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

// Helper function to update the UI based on authentication state
function updateAuthUI(isLoggedIn) {
    const authLinks = document.querySelectorAll('.auth-links');
    const userProfile = document.querySelector('.user-profile');
    
    if (isLoggedIn) {
        authLinks.forEach(link => link.classList.add('hidden'));
        if (userProfile) userProfile.classList.remove('hidden');
    } else {
        authLinks.forEach(link => link.classList.remove('hidden'));
        if (userProfile) userProfile.classList.add('hidden');
    }
}

// Initialize Supabase auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        updateAuthUI(true);
    } else if (event === 'SIGNED_OUT') {
        updateAuthUI(false);
    }
});