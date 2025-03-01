// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Add this debugging helper at the top of your auth.js
async function checkAuthStatus() {
    const { data, error } = await supabaseClient.auth.getSession();
    console.log('Auth status check:', { session: data?.session, error });
    return { data, error };
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// DOM Elements - Shared
const togglePasswordElements = document.querySelectorAll('.toggle-password');

// Toggle password visibility
togglePasswordElements.forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Sign in with Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Redirect to homepage on success
            window.location.href = 'index.html';
            
        } catch (error) {
            alert('Error logging in: ' + error.message);
            console.error('Login error:', error);
            
            // Reset button state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Log In';
            submitBtn.disabled = false;
        }
    });
}

// Signup Form
const signupForm = document.getElementById('signupForm');
const avatarInput = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatarPreview');

// Preview profile picture
if (avatarInput) {
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    });
}
// Leave your Supabase init and other parts unchanged

// Update the signup form event listener
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const avatar = avatarInput.files[0];
        
        // Password validation
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must contain at least 8 characters including alphanumeric and special characters.');
            return;
        }
        
        // Confirm password
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            // 1. Sign up the user with Supabase Auth
            const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    },
                    emailRedirectTo: 'https://notesbuddy-gnr.netlify.app/login'
                }
            });
            
            if (signUpError) throw signUpError;
            
            if (!authData?.user) {
                throw new Error('User creation failed');
            }
            
            // Store user data temporarily
            const userId = authData.user.id;
            console.log('User created with ID:', userId);
            
            // Upload avatar if provided
            let avatarUrl = null;
            if (avatar) {
                try {
                    const fileExt = avatar.name.split('.').pop();
                    const fileName = `${userId}.${fileExt}`;
                    
                    const { data: uploadData, error: uploadError } = await supabaseClient.storage
                        .from('avatars')
                        .upload(fileName, avatar);
                    
                    if (uploadError) {
                        console.warn('Avatar upload error:', uploadError);
                    } else {
                        // Get public URL
                        const { data: { publicUrl } } = supabaseClient.storage
                            .from('avatars')
                            .getPublicUrl(fileName);
                        
                        avatarUrl = publicUrl;
                        console.log('Avatar uploaded successfully:', avatarUrl);
                    }
                } catch (avatarError) {
                    console.warn('Error uploading avatar:', avatarError);
                    // Continue with signup even if avatar upload fails
                }
            }
            
            // KEY CHANGE: Add a delay before creating profile to avoid foreign key error
            console.log('Waiting for user record to be fully created...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Now try to create the profile
            try {
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert([
                        { 
                            id: userId,
                            full_name: fullName,
                            phone: phone,
                            avatar_url: avatarUrl
                        }
                    ]);
                
                if (profileError) {
                    console.error('First profile creation attempt failed:', profileError);
                    
                    // Wait a bit longer and try again
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    const { error: retryError } = await supabaseClient
                        .from('profiles')
                        .insert([
                            { 
                                id: userId,
                                full_name: fullName,
                                phone: phone,
                                avatar_url: avatarUrl
                            }
                        ]);
                    
                    if (retryError) {
                        console.error('Retry profile creation failed:', retryError);
                        throw retryError;
                    } else {
                        console.log('Profile created successfully on second attempt');
                    }
                } else {
                    console.log('Profile created successfully');
                }
            } catch (profileError) {
                console.error('Error creating user profile:', profileError);
                throw profileError;
            }
            
            // Show success message
            alert('Account created successfully! Please check your email to verify your account.');
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            alert('Error creating account: ' + (error.message || 'Unknown error'));
            
            // Reset button state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Sign Up';
            submitBtn.disabled = false;
        }
    });
}
// Add this function to auth.js
async function checkProfileCreation(userId) {
    try {
        console.log('Checking profile creation for user:', userId);
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error checking profile:', error);
            return false;
        }
        
        console.log('Profile data found:', data);
        return !!data;
    } catch (err) {
        console.error('Exception checking profile:', err);
        return false;
    }
}

// Call this after successful signup
// In the signup handler:
await check
// Mobile menu toggle
function showMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.add('active');
}

function hideMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
}