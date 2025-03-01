// Initialize Supabase client
const supabaseUrl = 'https://zkirlipgjgbzjcmztfmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraXJsaXBnamdiempjbXp0Zm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDk2MzIsImV4cCI6MjA1NjM4NTYzMn0.wDWggmQxr-OiOw--tXzCgStB9s4CsVd3rAOPPcBX-Os';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Store current user and time information
const currentDateTime = '2025-03-01 08:05:29'; // UTC formatted time
const currentUserLogin = 'shreyasroy123';

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
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Redirect to home page after successful login
                window.location.href = 'index.html';
                
            } catch (error) {
                if (loginError) {
                    loginError.textContent = `Login failed: ${error.message}`;
                } else {
                    alert('Login failed: ' + error.message);
                }
            }
        });
    }
    
    // Preview profile image before upload on signup form
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
            
            // Validate password
            if (!validatePassword(password)) {
                if (signupError) {
                    signupError.textContent = 'Password must contain at least one special character and one alphanumeric character';
                } else {
                    alert('Password must contain at least one special character and one alphanumeric character');
                }
                return;
            }
            
            // Check if passwords match
            if (password !== confirmPassword) {
                if (signupError) {
                    signupError.textContent = 'Passwords do not match';
                } else {
                    alert('Passwords do not match');
                }
                return;
            }
            
            try {
                // Step 1: Create user account
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone
                        }
                    }
                });
                
                if (authError) throw authError;
                
                if (authData.user) {
                    let profilePicUrl = null;
                    
                    // Step 2: Upload profile picture if provided
                    if (profilePicFile) {
                        const fileExt = profilePicFile.name.split('.').pop();
                        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
                        const filePath = `avatars/${fileName}`;
                        
                        // Upload image to Supabase Storage
                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(filePath, profilePicFile);
                        
                        if (uploadError) throw uploadError;
                        
                        // Get public URL for the image
                        profilePicUrl = fileName;
                    }
                    
                    // Step 3: Create user profile in the profiles table
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                full_name: fullName,
                                avatar_url: profilePicUrl,
                                phone: phone,
                                created_at: currentDateTime
                            }
                        ]);
                    
                    if (profileError) throw profileError;
                }
                
                alert('Sign up successful! Please check your email to verify your account.');
                // Redirect to login page
                window.location.href = 'login.html';
                
            } catch (error) {
                if (signupError) {
                    signupError.textContent = `Sign up failed: ${error.message}`;
                } else {
                    alert('Sign up failed: ' + error.message);
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