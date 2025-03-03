// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
// Initialize Supabase - used for all pages
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Supabase client
    const supabaseUrl = 'https://jncfbkvxbskyhduvcpit.supabase.co';  // Replace with your actual Supabase URL
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Replace with your actual anon key
    
    try {
        const { createClient } = supabase;
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        // Store supabase client globally
        window.supabaseClient = supabaseClient;
        
        // Check if user is authenticated
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Auth session error:', error);
            showAuthView();
            return;
        }
        
        if (!session) {
            // No session, show login/signup buttons
            showAuthView();
            return;
        }
        
        // User is authenticated
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            console.error('User fetch error:', userError);
            showAuthView();
            return;
        }
        
        // Get user profile data (used for name, avatar, etc)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
        }
        
        // User is authenticated, update UI
        showUserView(user, profile);
        
        // Initialize page-specific features
        initCurrentPage(user, profile);
        
    } catch (error) {
        console.error('Supabase initialization error:', error);
        showAuthView();
    }
});

// Show login/signup buttons
function showAuthView() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (authButtons) {
        authButtons.style.display = 'flex';
    }
    
    if (userProfile) {
        userProfile.style.display = 'none';
    }
    
    // Redirect if on protected page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/my-profile') || 
        currentPath.includes('/account-settings') || 
        currentPath.includes('/study-statistics')) {
        window.location.href = '/login';
    }
}

// Show user profile
function showUserView(user, profile) {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const profilePic = document.getElementById('profilePic');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Hide auth buttons, show profile
    if (authButtons) {
        authButtons.style.display = 'none';
    }
    
    if (userProfile) {
        userProfile.style.display = 'flex';
    }
    
    // Update username (from profile if exists, fallback to email)
    if (userName) {
        userName.textContent = profile?.username || user.email.split('@')[0];
    }
    
    // Update profile picture
    if (profilePic) {
        if (profile?.avatar_url) {
            updateProfileImage(profilePic, profile.avatar_url, user.email);
        } else {
            updateProfileInitial(profilePic, user.email);
        }
    }
    
    // Set up logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirect to home
        window.location.href = '/';
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error signing out. Please try again.');
    }
}

// Update profile with image
function updateProfileImage(element, imageUrl, email) {
    // If element is not an image, replace it
    if (element.tagName !== 'IMG') {
        const img = document.createElement('img');
        img.id = element.id;
        img.src = imageUrl;
        img.alt = 'Profile';
        img.style.width = element.style.width || '35px';
        img.style.height = element.style.height || '35px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        
        if (element.id !== 'largeProfilePic') {
            img.style.marginRight = '10px';
        }
        
        // Replace element
        const parent = element.parentElement;
        if (parent) {
            parent.replaceChild(img, element);
        }
        
        // Error handler - fallback to initial
        img.onerror = function() {
            updateProfileInitial(this, email);
        };
    } else {
        // Update existing image
        element.src = imageUrl;
        element.onerror = function() {
            updateProfileInitial(this, email);
        };
    }
}

// Update profile with initial
function updateProfileInitial(element, email) {
    const initial = email[0].toUpperCase();
    const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
    const colorIndex = initial.charCodeAt(0) % colors.length;
    
    // If element is an image, replace with div
    if (element.tagName === 'IMG') {
        const div = document.createElement('div');
        div.id = element.id;
        div.textContent = initial;
        
        // Style the div
        div.style.width = element.style.width || '35px';
        div.style.height = element.style.height || '35px';
        div.style.borderRadius = '50%';
        div.style.backgroundColor = colors[colorIndex];
        div.style.color = 'white';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.fontWeight = 'bold';
        
        if (element.id === 'largeProfilePic') {
            div.style.fontSize = '4rem';
        } else {
            div.style.marginRight = '10px';
        }
        
        // Replace element
        const parent = element.parentElement;
        if (parent) {
            parent.replaceChild(div, element);
        }
    } else {
        // Update existing div
        element.textContent = initial;
        element.style.backgroundColor = colors[colorIndex];
    }
}

// Initialize page-specific features
function initCurrentPage(user, profile) {
    const path = window.location.pathname;
    
    if (path.includes('/my-profile')) {
        initProfilePage(user, profile);
    } else if (path.includes('/account-settings')) {
        initAccountPage(user, profile);
    } else if (path.includes('/study-statistics')) {
        initStatsPage(user, profile);
    }
}

// Initialize profile page
function initProfilePage(user, profile) {
    // Update profile elements
    const profileName = document.getElementById('profileName');
    const memberSince = document.getElementById('memberSince');
    const largeProfilePic = document.getElementById('largeProfilePic');
    
    if (profileName) {
        profileName.textContent = profile?.username || user.email.split('@')[0];
    }
    
    if (memberSince && user.created_at) {
        const createdAt = new Date(user.created_at);
        const formattedDate = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        memberSince.textContent = `Member since: ${formattedDate}`;
    }
    
    if (largeProfilePic) {
        if (profile?.avatar_url) {
            updateProfileImage(largeProfilePic, profile.avatar_url, user.email);
        } else {
            updateProfileInitial(largeProfilePic, user.email);
        }
    }
    
    // Setup profile form
    setupProfileForm(user, profile);
    
    // Setup avatar modal
    setupAvatarModal(user, profile);
}

// Setup profile form
function setupProfileForm(user, profile) {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;
    
    // Populate form fields
    const fullNameInput = document.getElementById('editFullName');
    const emailInput = document.getElementById('editEmail');
    const phoneInput = document.getElementById('editPhone');
    const schoolInput = document.getElementById('editSchool');
    const gradeInput = document.getElementById('editGrade');
    const bioInput = document.getElementById('editBio');
    
    if (fullNameInput) fullNameInput.value = profile?.full_name || '';
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = profile?.phone || '';
    if (schoolInput) schoolInput.value = profile?.school || '';
    if (gradeInput) gradeInput.value = profile?.grade || '';
    if (bioInput) bioInput.value = profile?.bio || '';
    
    // Form submission handler
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }
        
        try {
            // Collect form data
            const updates = {
                user_id: user.id,
                full_name: fullNameInput ? fullNameInput.value : profile?.full_name,
                username: profile?.username || user.email.split('@')[0],
                phone: phoneInput ? phoneInput.value : profile?.phone,
                school: schoolInput ? schoolInput.value : profile?.school,
                grade: gradeInput ? gradeInput.value : profile?.grade,
                bio: bioInput ? bioInput.value : profile?.bio,
                updated_at: new Date().toISOString()
            };
            
            // Update profile in database
            const { error } = await window.supabaseClient
                .from('profiles')
                .upsert(updates);
                
            if (error) throw error;
            
            // Update UI
            if (profileName) {
                profileName.textContent = updates.username;
            }
            
            if (userName) {
                userName.textContent = updates.username;
            }
            
            alert('Profile updated successfully!');
            
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        }
    });
}

// Setup avatar modal
function setupAvatarModal(user, profile) {
    const avatarOverlay = document.querySelector('.avatar-overlay');
    const avatarModal = document.getElementById('avatarModal');
    if (!avatarOverlay || !avatarModal) return;
    
    const modalClose = avatarModal.querySelector('.close');
    const avatarForm = document.getElementById('avatarForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    
    // Show modal on click
    avatarOverlay.addEventListener('click', function() {
        avatarModal.style.display = 'block';
        
        // Set preview
        if (profile?.avatar_url) {
            avatarPreview.src = profile.avatar_url;
        } else {
            createInitialAvatar(user.email, avatarPreview);
        }
    });
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            avatarModal.style.display = 'none';
        });
    }
    
    // Close when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === avatarModal) {
            avatarModal.style.display = 'none';
        }
    });
    
    // Preview selected image
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Handle form submission
    if (avatarForm) {
        avatarForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!avatarInput.files || !avatarInput.files[0]) {
                alert('Please select an image to upload.');
                return;
            }
            
            const file = avatarInput.files[0];
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Uploading...';
            }
            
            try {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;
                
                const { error: uploadError } = await window.supabaseClient.storage
                    .from('avatars')
                    .upload(filePath, file);
                
                if (uploadError) throw uploadError;
                
                // Get public URL
                const { data: { publicUrl } } = window.supabaseClient.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                // Update profile
                const { error: updateError } = await window.supabaseClient
                    .from('profiles')
                    .update({ 
                        avatar_url: publicUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);
                
                if (updateError) throw updateError;
                
                // Update UI
                const profilePic = document.getElementById('profilePic');
                const largeProfilePic = document.getElementById('largeProfilePic');
                
                if (profilePic) updateProfileImage(profilePic, publicUrl, user.email);
                if (largeProfilePic) updateProfileImage(largeProfilePic, publicUrl, user.email);
                
                // Close modal
                avatarModal.style.display = 'none';
                avatarForm.reset();
                
                alert('Profile picture updated successfully!');
                
            } catch (error) {
                console.error('Avatar upload error:', error);
                alert('Error uploading image. Please try again.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Upload';
                }
            }
        });
    }
}

// Create initial avatar for preview
function createInitialAvatar(email, previewElement) {
    const initial = email[0].toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Calculate color based on initial
    const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
    const colorIndex = initial.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
    
    // Set to image
    previewElement.src = canvas.toDataURL('image/png');
}

// Initialize account page
function initAccountPage(user, profile) {
    // Initialize password form
    initPasswordForm();
    
    // Initialize notification settings
    initNotificationSettings(user, profile);
    
    // Initialize privacy settings
    initPrivacySettings(user, profile);
    
    // Initialize account deletion
    initAccountDeletion();
}

// Initialize password form
function initPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) return;
    
    // Set up password visibility toggles
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });
    
    // Set up password strength meter
    const newPassword = document.getElementById('newPassword');
    const strengthLevel = document.getElementById('strengthLevel');
    const strengthText = document.getElementById('strengthText');
    
    if (newPassword && strengthLevel && strengthText) {
        newPassword.addEventListener('input', function() {
            const score = calculatePasswordStrength(this.value);
            
            // Update meter width
            strengthLevel.style.width = `${score}%`;
            
            // Update color and text
            if (score < 25) {
                strengthLevel.style.backgroundColor = '#db4437';
                strengthText.textContent = 'Weak password';
            } else if (score < 50) {
                strengthLevel.style.backgroundColor = '#f4b400';
                strengthText.textContent = 'Fair password';
            } else if (score < 75) {
                strengthLevel.style.backgroundColor = '#0f9d58';
                strengthText.textContent = 'Good password';
            } else {
                strengthLevel.style.backgroundColor = '#4285f4';
                strengthText.textContent = 'Strong password';
            }
        });
    }
    
    // Handle form submission
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        // Update UI during submission
        const submitBtn = passwordForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
        }
        
        try {
            // Update password through Supabase
            const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });
            
            if (error) throw error;
            
            // Success - reset form
            passwordForm.reset();
            
            // Reset strength meter
            if (strengthLevel) {
                strengthLevel.style.width = '0%';
            }
            if (strengthText) {
                strengthText.textContent = 'Password strength';
            }
            
            alert('Password updated successfully');
            
        } catch (error) {
            console.error('Password update error:', error);
            alert('Error updating password. Please check your current password and try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
            }
        }
    });
}

// Initialize notification settings
function initNotificationSettings(user, profile) {
    const saveBtn = document.getElementById('saveNotificationSettings');
    if (!saveBtn) return;
    
    // Get all notification checkboxes
    const studyReminders = document.getElementById('notifyStudyReminders');
    const newFeatures = document.getElementById('notifyNewFeatures');
    const comments = document.getElementById('notifyComments');
    const updates = document.getElementById('notifyUpdates');
    
    // Set initial states from profile data
    if (profile?.notifications) {
        if (studyReminders) studyReminders.checked = profile.notifications.studyReminders ?? true;
        if (newFeatures) newFeatures.checked = profile.notifications.newFeatures ?? true;
        if (comments) comments.checked = profile.notifications.comments ?? false;
        if (updates) updates.checked = profile.notifications.updates ?? true;
    }
    
    // Handle save button
    saveBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Saving...';
        
        try {
            // Collect notification preferences
            const notifications = {
                studyReminders: studyReminders?.checked ?? true,
                newFeatures: newFeatures?.checked ?? true,
                comments: comments?.checked ?? false,
                updates: updates?.checked ?? true
            };
            
            // Update in database
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ 
                    notifications,
                    updated_at: new Date('2025-03-03T07:17:41Z').toISOString() // Using your provided timestamp
                })
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            alert('Notification settings saved successfully');
            
        } catch (error) {
            console.error('Notification settings error:', error);
            alert('Error saving notification settings. Please try again.');
        } finally {
            this.disabled = false;
            this.textContent = 'Save Notification Settings';
        }
    });
}

// Initialize privacy settings
function initPrivacySettings(user, profile) {
    const saveBtn = document.getElementById('savePrivacySettings');
    if (!saveBtn) return;
    
    // Get privacy settings elements
    const profileVisibility = document.getElementById('profileVisibility');
    const notesVisibility = document.getElementById('notesVisibility');
    
    // Set initial values
    if (profile?.privacy) {
        if (profileVisibility) profileVisibility.value = profile.privacy.profileVisibility || 'public';
        if (notesVisibility) notesVisibility.value = profile.privacy.notesVisibility || 'public';
    }
    
    // Handle save button
    saveBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Saving...';
        
        try {
            // Collect privacy settings
            const privacy = {
                profileVisibility: profileVisibility?.value || 'public',
                notesVisibility: notesVisibility?.value || 'public'
            };
            
            // Update in database
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ 
                    privacy,
                    updated_at: new Date('2025-03-03T07:17:41Z').toISOString() // Using your provided timestamp
                })
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            alert('Privacy settings saved successfully');
            
        } catch (error) {
            console.error('Privacy settings error:', error);
            alert('Error saving privacy settings. Please try again.');
        } finally {
            this.disabled = false;
            this.textContent = 'Save Privacy Settings';
        }
    });
}

// Initialize account deletion
function initAccountDeletion() {
    const deleteBtn = document.getElementById('deleteAccount');
    if (!deleteBtn) return;
    
    deleteBtn.addEventListener('click', async function() {
        // Confirm deletion
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmed) return;
        
        try {
            // Get user email for verification
            const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
            
            if (userError) throw userError;
            
            // Double check with email
            const emailConfirmation = prompt(`To confirm deletion, please enter your email address (${user.email}):`);
            
            if (emailConfirmation !== user.email) {
                alert('Email address did not match. Account deletion cancelled.');
                return;
            }
            
            // Delete user
            const { error } = await window.supabaseClient.auth.admin.deleteUser(user.id);
            
            if (error) {
                // If admin delete fails, just sign out
                await window.supabaseClient.auth.signOut();
                alert('You have been logged out. Please contact support to delete your account completely.');
            } else {
                alert('Your account has been deleted. You will now be redirected to the homepage.');
            }
            
            // Redirect to home
            window.location.href = '/';
            
        } catch (error) {
            console.error('Account deletion error:', error);
            alert('Error deleting account. Please try again or contact support.');
        }
    });
}

// Initialize stats page
function initStatsPage(user, profile) {
    // This is a placeholder for future statistics functionality
    console.log('Statistics page initialized for user:', user.id);
}

// Helper: Calculate password strength
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Length
    score += Math.min(password.length * 4, 25);
    
    // Character variety
    if (/[A-Z]/.test(password)) score += 10; // Uppercase
    if (/[a-z]/.test(password)) score += 10; // Lowercase
    if (/[0-9]/.test(password)) score += 10; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special chars
    
    // Pattern variety
    if (/[A-Z].*[A-Z]/.test(password)) score += 5; // Multiple uppercase
    if (/[a-z].*[a-z]/.test(password)) score += 5; // Multiple lowercase
    if (/[0-9].*[0-9]/.test(password)) score += 5; // Multiple numbers
    if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 10; // Multiple special chars
    
    // Common patterns reduce score
    if (/123/.test(password) || /abc/i.test(password)) score -= 10;
    
    return Math.min(Math.max(score, 0), 100); // Ensure between 0-100
}

// Mobile menu functions
window.showMenu = function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.style.right = '0';
};

window.hideMenu = function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.style.right = '-200px';
};

// Initialize copyright year
const copyrightElement = document.querySelector('.copyright p');
if (copyrightElement) {
    const year = new Date().getFullYear();
    copyrightElement.textContent = `© ${year} NotesBuddy. All Rights Reserved.`;
}