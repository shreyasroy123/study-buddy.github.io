// Store current user and time information
const currentDateTime = '2025-03-01 10:18:07'; // UTC formatted time
const currentUserLogin = 'shreyasroy123';

// Initialize Supabase client
const supabaseUrl = 'https://zkirlipgjgbzjcmztfmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraXJsaXBnamdiempjbXp0Zm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDk2MzIsImV4cCI6MjA1NjM4NTYzMn0.wDWggmQxr-OiOw--tXzCgStB9s4CsVd3rAOPPcBX-Os';
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);

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
    if (signupProfilePicInput && signupPreviewImage) {
        signupProfilePicInput.addEventListener('change', () => {
            const file = signupProfilePicInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    signupPreviewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const phone = document.getElementById('signup-phone').value;
        const profilePicFile = signupProfilePicInput ? signupProfilePicInput.files[0] : null;
        
        if (signupError) signupError.textContent = '';
        
        // Password validation
        if (!validatePassword(password)) {
            if (signupError) {
                signupError.textContent = 'Password must contain at least one special character and one alphanumeric character';
            }
            return;
        }
        
        if (password !== confirmPassword) {
            if (signupError) {
                signupError.textContent = 'Passwords do not match';
            }
            return;
        }
        
        try {
            // Step 1: Sign up the user
            const hashedPassword = hashPassword(password);
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password: hashedPassword,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            });
            
            if (signUpError) throw signUpError;
            if (!user) throw new Error('Signup failed - no user returned');

            let avatarUrl = null;
            
            // Step 2: Upload profile picture if provided
            if (profilePicFile) {
                try {
                    const fileExt = profilePicFile.name.split('.').pop();
                    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, profilePicFile, {
                            cacheControl: '3600',
                            upsert: true
                        });
                    
                    if (uploadError) throw uploadError;
                    
                    const { data: { publicUrl } } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    
                    avatarUrl = publicUrl;
                } catch (uploadError) {
                    console.error('Profile picture upload failed:', uploadError);
                }
            }
            
            // Step 3: Create profile
            const profileData = {
                id: user.id,
                email,
                full_name: fullName,
                phone,
                created_at: currentDateTime,
                password_hash: hashedPassword
            };
            
            if (avatarUrl) {
                profileData.avatar_url = avatarUrl;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([profileData], {
                    onConflict: 'id',
                    returning: 'minimal'
                });
            
            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw profileError;
            }
            
            // Show success message with email confirmation instructions
            alert('Sign up successful! Please check your email to confirm your account before logging in.');
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            if (signupError) {
                // Handle specific error cases
                if (error.message.includes('Email not confirmed')) {
                    signupError.textContent = 'Please check your email to confirm your account before logging in.';
                } else {
                    signupError.textContent = `Sign up failed: ${error.message}`;
                }
            }
        }
    });
}
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