const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window.supabase !== 'undefined') {
    // Check if supabaseClient is already defined globally
    if (typeof window.supabaseClient === 'undefined') {
        const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1[...]';
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Make it available globally
        window.supabaseClient = supabaseClient;
    } else {
        // Use the already defined supabaseClient
        supabaseClient = window.supabaseClient;
    }
} else {
    console.error("Supabase client not available. Make sure to include the Supabase JS library.");
}

// Current page detection
const currentPage = window.location.pathname.split('/').pop();

// DOM Elements - Common for all profile pages
const userProfile = document.getElementById('userProfile');
const authButtons = document.getElementById('authButtons');
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// DOM Elements - Profile page specific
const profileName = document.getElementById('profileName');
const memberSince = document.getElementById('memberSince');
const largeProfilePic = document.getElementById('largeProfilePic');
const avatarOverlay = document.querySelector('.avatar-overlay');
const avatarModal = document.getElementById('avatarModal');

// Current user data
let currentUser = null;
let profileData = null;


// Initialize page without creating duplicate supabaseClient
document.addEventListener('DOMContentLoaded', async () => {
    // Current page detection
    const currentPage = window.location.pathname.split('/').pop();

    // DOM Elements - Common for all profile pages
    const userProfile = document.getElementById('userProfile');
    const authButtons = document.getElementById('authButtons');
    const profilePic = document.getElementById('profilePic');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // DOM Elements - Profile page specific
    const profileName = document.getElementById('profileName');
    const memberSince = document.getElementById('memberSince');
    const largeProfilePic = document.getElementById('largeProfilePic');
    const avatarOverlay = document.querySelector('.avatar-overlay');
    const avatarModal = document.getElementById('avatarModal');

    // Current user data
    let currentUser = {
        id: "user123",
        email: "shreyasroy123@example.com",
        created_at: "2025-03-02T18:25:46Z"
    };
    
    // Default profile data if Supabase fails
    let profileData = {
        full_name: "Shreyas Roy",
        phone: "",
        school: "",
        grade: "",
        bio: "",
        avatar_url: "images/default-avatar.png"
    };

    try {
        // Set default values immediately
        if (profileName) profileName.textContent = "Shreyas Roy";
        if (memberSince) memberSince.textContent = "Member since: March 2, 2025";
        if (largeProfilePic) {
            largeProfilePic.src = "images/default-avatar.png";
            largeProfilePic.onerror = () => {
                largeProfilePic.src = "images/default-avatar.png";
            };
        }
        
        // Update navbar
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        if (profilePic) {
            profilePic.src = "images/default-avatar.png";
            profilePic.onerror = () => {
                profilePic.src = 'images/default-avatar.png';
            };
        }
        
        if (userName) {
            userName.textContent = "Shreyas Roy";
        }

        // Initialize page-specific functionality
        if (currentPage === 'profile.html' || currentPage === '') {
            initializeProfilePage();
        } else if (currentPage === 'account-settings.html') {
            initializeAccountSettings();
        }
        
        // Handle logout button if it exists
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
        
    } catch (error) {
        console.error('Error initializing page:', error);
    }
    
    // Initialize profile page
    function initializeProfilePage() {
        if (!profileName || !memberSince || !largeProfilePic) return;
        
        // Populate form if it exists
        populateProfileForm(profileData);
        
        // Initialize avatar modal
        initAvatarModal();
    }
    
    // Populate profile form
    function populateProfileForm(data) {
        const editFullName = document.getElementById('editFullName');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const editSchool = document.getElementById('editSchool');
        const editGrade = document.getElementById('editGrade');
        const editBio = document.getElementById('editBio');
        const profileForm = document.getElementById('profileForm');
        
        if (!profileForm) return;
        
        if (editFullName) editFullName.value = data.full_name || '';
        if (editEmail) editEmail.value = currentUser.email;
        if (editPhone) editPhone.value = data.phone || '';
        if (editSchool) editSchool.value = data.school || '';
        if (editGrade) editGrade.value = data.grade || '';
        if (editBio) editBio.value = data.bio || '';
        
        // Add form submission handler
        profileForm.addEventListener('submit', handleProfileFormSubmit);
    }
    
    // Handle profile form submission
    function handleProfileFormSubmit(e) {
        e.preventDefault();
        
        const editFullName = document.getElementById('editFullName');
        
        // Get form data
        const fullName = editFullName ? editFullName.value : '';
        
        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Saving...';
                submitBtn.disabled = true;
            }
            
            // Update UI
            if (profileName) {
                profileName.textContent = fullName || "Shreyas Roy";
            }
            
            // Update navbar username
            if (userName) {
                userName.textContent = fullName || "Shreyas Roy";
            }
            
            // Show success message
            setTimeout(() => {
                alert('Profile updated successfully');
                
                // Reset button state
                if (submitBtn) {
                    submitBtn.textContent = 'Save Changes';
                    submitBtn.disabled = false;
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile: ' + error.message);
            
            // Reset button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Save Changes';
                submitBtn.disabled = false;
            }
        }
    }
    
    // Initialize avatar modal
    function initAvatarModal() {
        if (!avatarOverlay || !avatarModal) return;
        
        const modalClose = document.querySelector('#avatarModal .close');
        const avatarInput = document.getElementById('avatarInput');
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarForm = document.getElementById('avatarForm');
        
        if (!modalClose || !avatarInput || !avatarPreview || !avatarForm) return;
        
        // Open modal when clicking the avatar overlay
        avatarOverlay.addEventListener('click', () => {
            avatarModal.style.display = 'block';
            
            // Set current avatar as preview
            avatarPreview.src = largeProfilePic.src;
        });
        
        // Close modal when clicking the X
        modalClose.addEventListener('click', () => {
            avatarModal.style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === avatarModal) {
                avatarModal.style.display = 'none';
            }
        });
        
        // Preview selected image
        avatarInput.addEventListener('change', () => {
            const file = avatarInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Handle avatar form submission
        avatarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const file = avatarInput.files[0];
            if (!file) {
                alert('Please select an image');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = avatarForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Uploading...';
                submitBtn.disabled = true;
                
                // Simulate upload (since we're not using Supabase in this version)
                setTimeout(() => {
                    // Convert the selected file to a data URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const newAvatarUrl = e.target.result;
                        
                        // Update UI with the new avatar
                        largeProfilePic.src = newAvatarUrl;
                        if (profilePic) profilePic.src = newAvatarUrl;
                        
                        // Close modal
                        avatarModal.style.display = 'none';
                        
                        // Reset form
                        submitBtn.textContent = 'Upload';
                        submitBtn.disabled = false;
                        
                        // Show success message
                        alert('Profile picture updated successfully!');
                    };
                    reader.readAsDataURL(file);
                }, 1500);
                
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Error uploading avatar: ' + error.message);
                
                // Reset button state
                const submitBtn = avatarForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Upload';
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize account settings
    function initializeAccountSettings() {
        // Initialize password form
        initPasswordForm();
        
        // Initialize notification settings
        initNotificationSettings();
        
        // Initialize privacy settings
        initPrivacySettings();
        
        // Initialize danger zone (delete account)
        initDeleteAccount();
    }

    // Initialize password form
    function initPasswordForm() {
        const passwordForm = document.getElementById('passwordForm');
        if (!passwordForm) return;
        
        // Initialize password toggles
        const togglePasswordElements = document.querySelectorAll('.toggle-password');
        togglePasswordElements.forEach(toggle => {
            toggle.addEventListener('click', function() {
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
        
        // Initialize password strength meter
        const newPassword = document.getElementById('newPassword');
        const strengthLevel = document.getElementById('strengthLevel');
        const strengthText = document.getElementById('strengthText');
        
        if (newPassword && strengthLevel && strengthText) {
            newPassword.addEventListener('input', () => {
                const score = calculatePasswordStrength(newPassword.value);
                
                // Update strength meter
                strengthLevel.style.width = `${score}%`;
                
                // Update color based on strength
                if (score < 25) {
                    strengthLevel.style.backgroundColor = '#db4437'; // Red
                    strengthText.textContent = 'Weak password';
                } else if (score < 50) {
                    strengthLevel.style.backgroundColor = '#f4b400'; // Yellow
                    strengthText.textContent = 'Fair password';
                } else if (score < 75) {
                    strengthLevel.style.backgroundColor = '#0f9d58'; // Green
                    strengthText.textContent = 'Good password';
                } else {
                    strengthLevel.style.backgroundColor = '#4285f4'; // Blue
                    strengthText.textContent = 'Strong password';
                }
            });
        }
        
        // Handle form submission
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            // Show loading state
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Updating...';
            submitBtn.disabled = true;
            
            // Simulate password update
            setTimeout(() => {
                // Show success message
                alert('Password updated successfully');
                
                // Reset form
                passwordForm.reset();
                
                // Reset strength meter
                if (strengthLevel && strengthText) {
                    strengthLevel.style.width = '0';
                    strengthText.textContent = 'Password strength';
                }
                
                // Reset button state
                submitBtn.textContent = 'Update Password';
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Initialize notification settings
    function initNotificationSettings() {
        const saveNotificationBtn = document.getElementById('saveNotificationSettings');
        if (!saveNotificationBtn) return;
        
        // Handle save button click
        saveNotificationBtn.addEventListener('click', () => {
            // Show loading state
            saveNotificationBtn.textContent = 'Saving...';
            saveNotificationBtn.disabled = true;
            
            // Simulate saving
            setTimeout(() => {
                // Show success message
                alert('Notification settings saved');
                
                // Reset button state
                saveNotificationBtn.textContent = 'Save Notification Settings';
                saveNotificationBtn.disabled = false;
            }, 1000);
        });
    }

    // Initialize privacy settings
    function initPrivacySettings() {
        const savePrivacyBtn = document.getElementById('savePrivacySettings');
        if (!savePrivacyBtn) return;
        
        // Handle save button click
        savePrivacyBtn.addEventListener('click', () => {
            // Show loading state
            savePrivacyBtn.textContent = 'Saving...';
            savePrivacyBtn.disabled = true;
            
            // Simulate saving
            setTimeout(() => {
                // Show success message
                alert('Privacy settings saved');
                
                // Reset button state
                savePrivacyBtn.textContent = 'Save Privacy Settings';
                savePrivacyBtn.disabled = false;
            }, 1000);
        });
    }

    // Initialize delete account functionality
    function initDeleteAccount() {
        const deleteAccountBtn = document.getElementById('deleteAccount');
        if (!deleteAccountBtn) return;
        
        deleteAccountBtn.addEventListener('click', () => {
            // Show confirmation dialog
            const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            
            if (confirmed) {
                // Ask for email confirmation
                const emailConfirmation = prompt(`To confirm deletion, please type your email address (${currentUser.email}):`);
                
                if (emailConfirmation === currentUser.email) {
                    // Redirect to home page
                    alert('Your account has been deleted. You are now signed out.');
                    window.location.href = 'index.html';
                } else {
                    alert('Email address does not match. Account deletion cancelled.');
                }
            }
        });
    }

    // Calculate password strength score (0-100)
    // Calculate password strength score (0-100)
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    score += Math.min(password.length * 5, 30);
    
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
    
    return Math.min(score, 100); // Cap at 100
}

// Set up mobile menu toggle
function showMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.style.right = '0';
    }
}

function hideMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.style.right = '-200px';
    }
}

// Update the copyright year in the footer
const copyrightElement = document.querySelector('.copyright p');
if (copyrightElement) {
        copyrightElement.textContent = `© 2025 NotesBuddy. All Rights Reserved.`;
    }});
