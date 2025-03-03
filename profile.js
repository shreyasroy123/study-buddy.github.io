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

(function() {
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

    // Initialize the page
    document.addEventListener('DOMContentLoaded', initializePage);

    function initializePage() {
        // Check if logged in via app.js global variable if available
        if (typeof window.isLoggedIn === 'undefined' || !window.isLoggedIn) {
            // If not logged in or status unknown, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Get user data from localStorage if available
        const userData = getUserFromLocalStorage();
        
        if (!userData) {
            // No stored user data, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Update navbar
        updateNavbar(userData);
        
        // Initialize page-specific functionality
        if (currentPage === 'profile.html' || currentPage === '') {
            initializeProfilePage();
        } else if (currentPage === 'account-settings.html') {
            initializeAccountSettings();
        }
        
        // Set up logout button
        setupLogoutButton();
    }

    // Get user data from localStorage
    function getUserFromLocalStorage() {
        try {
            const userDataString = localStorage.getItem('userData');
            if (!userDataString) return null;
            
            const userData = JSON.parse(userDataString);
            return userData;
        } catch (error) {
            console.error('Error getting user data from localStorage:', error);
            return null;
        }
    }

    // Update the navbar with user info
    function updateNavbar(userData) {
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        // Update username in navbar
        if (userName) {
            userName.textContent = userData.name || userData.email.split('@')[0];
        }
        
        // Update profile pic in navbar - use initial letter if no image
        if (profilePic) {
            if (userData.avatarUrl) {
                profilePic.src = userData.avatarUrl;
                profilePic.onerror = () => {
                    // If image fails to load, use text avatar
                    setTextAvatar(profilePic, userData.name || userData.email[0]);
                };
            } else {
                // Use text avatar if no image URL
                setTextAvatar(profilePic, userData.name || userData.email[0]);
            }
        }
    }

    // Create a text-based avatar with user's initial
    function setTextAvatar(imgElement, name) {
        // Get first letter for avatar
        const firstLetter = name.charAt(0).toUpperCase();
        
        // Create canvas for text avatar
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        
        const context = canvas.getContext('2d');
        
        // Background color based on name (simple hash)
        const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
        const colorIndex = Math.abs(name.charCodeAt(0)) % colors.length;
        const bgColor = colors[colorIndex];
        
        // Fill background
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = 'bold 100px Arial';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(firstLetter, canvas.width / 2, canvas.height / 2);
        
        // Set the image source to the canvas data URL
        imgElement.src = canvas.toDataURL('image/png');
    }
    
    // Initialize profile page
    function initializeProfilePage() {
        if (!profileName || !memberSince || !largeProfilePic) return;
        
        // Set profile name
        profileName.textContent = userData.name || userData.email.split('@')[0];
        
        // Set membership date
        const createdAt = new Date(userData.createdAt || new Date());
        const formattedDate = createdAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        memberSince.textContent = `Member since: ${formattedDate}`;
        
        // Set large profile picture
        if (userData.avatarUrl) {
            largeProfilePic.src = userData.avatarUrl;
            largeProfilePic.onerror = () => {
                // If image fails to load, use text avatar
                setTextAvatar(largeProfilePic, userData.name || userData.email[0]);
            };
        } else {
            // Use text avatar if no image URL
            setTextAvatar(largeProfilePic, userData.name || userData.email[0]);
        }
        
        // Populate form if it exists
        populateProfileForm(profileData);
        
        // Initialize avatar modal
        initAvatarModal();
    }
    
    // Create a large text avatar
    function setLargeTextAvatar(name) {
        const firstLetter = name.charAt(0).toUpperCase();
        
        if (!largeProfilePic) return;
        
        if (largeProfilePic.tagName === 'IMG') {
            // Convert img to div
            const parentElement = largeProfilePic.parentElement;
            const newDiv = document.createElement('div');
            newDiv.id = 'largeProfilePic';
            newDiv.style.width = '100%';
            newDiv.style.height = '100%';
            newDiv.style.borderRadius = '50%';
            newDiv.style.backgroundColor = getColorForLetter(firstLetter);
            newDiv.style.color = 'white';
            newDiv.style.display = 'flex';
            newDiv.style.alignItems = 'center';
            newDiv.style.justifyContent = 'center';
            newDiv.style.fontSize = '4rem';
            newDiv.style.fontWeight = 'bold';
            newDiv.textContent = firstLetter;
            
            if (parentElement) {
                parentElement.replaceChild(newDiv, largeProfilePic);
                largeProfilePic = newDiv;
            }
        } else {
            // Just update the div
            largeProfilePic.style.backgroundColor = getColorForLetter(firstLetter);
            largeProfilePic.textContent = firstLetter;
        }
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
        profileForm.addEventListener('submit', function(e) {
            handleProfileFormSubmit(e, userData);
        });
    }
    
    // Handle profile form submission
    function handleProfileFormSubmit(e, userData) {
        e.preventDefault();
        
        const editFullName = document.getElementById('editFullName');
        
        // Get form data
        const fullName = editFullName ? editFullName.value : '';
        const phone = editPhone ? editPhone.value : '';
        const school = editSchool ? editSchool.value : '';
        const grade = editGrade ? editGrade.value : '';
        const bio = editBio ? editBio.value : '';
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
        }
        
        // Update user data
        userData.name = fullName;
        userData.phone = phone;
        userData.school = school;
        userData.grade = grade;
        userData.bio = bio;
        
        // Save to localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update UI
        if (profileName) {
            profileName.textContent = fullName || userData.email.split('@')[0];
        }
        
        if (userName) {
            userName.textContent = fullName || userData.email.split('@')[0];
        }
        
        // Simulate API delay
        setTimeout(() => {
            // Show success message
            alert('Profile updated successfully');
            
            // Reset button state
            if (submitBtn) {
                submitBtn.textContent = 'Save Changes';
                submitBtn.disabled = false;
            }
        }, 1000);
    }
    
    // Initialize avatar modal
    function initAvatarModal(userData, supabaseClient) {
        const avatarOverlay = document.querySelector('.avatar-overlay');
        const avatarModal = document.getElementById('avatarModal');
        
        if (!avatarOverlay || !avatarModal) return;
        
        const modalClose = document.querySelector('#avatarModal .close');
        const avatarInput = document.getElementById('avatarInput');
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarForm = document.getElementById('avatarForm');
        
        if (!modalClose || !avatarInput || !avatarPreview || !avatarForm) return;
        
        // Open modal when clicking the avatar overlay
        avatarOverlay.addEventListener('click', () => {
            avatarModal.style.display = 'block';
            
            // Set current avatar as preview or first letter
            const userData = getUserFromLocalStorage();
            if (userData.avatarUrl) {
                avatarPreview.src = userData.avatarUrl;
                avatarPreview.onerror = () => {
                    createAvatarPreview(userData.name || userData.email[0]);
                };
            } else {
                createAvatarPreview(userData.name || userData.email[0]);
            }
        });
        
        // Create avatar preview with letter
        function createAvatarPreview(name) {
            const firstLetter = name.charAt(0).toUpperCase();
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = getColorForLetter(firstLetter);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw letter
            ctx.font = 'bold 100px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(firstLetter, canvas.width/2, canvas.height/2);
            
            // Set as preview
            avatarPreview.src = canvas.toDataURL('image/png');
        }
        
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
            
            // Show loading state
            const submitBtn = avatarForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            // Convert the selected file to a data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAvatarUrl = e.target.result;
                
                // Get user data
                const userData = getUserFromLocalStorage();
                
                // Update avatar URL in user data
                userData.avatarUrl = newAvatarUrl;
                
                // Save to localStorage
                localStorage.setItem('userData', JSON.stringify(userData));
                
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
            
            // Simulate password update (in real app, this would be an API call)
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
            }, 1000);
        });
    }

       // Initialize notification settings
       function initNotificationSettings() {
        const saveNotificationBtn = document.getElementById('saveNotificationSettings');
        if (!saveNotificationBtn) return;
        
        // Handle save button click
        saveNotificationBtn.addEventListener('click', () => {
            // Get checkbox states
            const studyReminders = document.getElementById('notifyStudyReminders').checked;
            const newFeatures = document.getElementById('notifyNewFeatures').checked;
            const comments = document.getElementById('notifyComments').checked;
            const updates = document.getElementById('notifyUpdates').checked;
            
            // Get user data
            const userData = getUserFromLocalStorage();
            
            // Update notification settings
            userData.notifications = {
                studyReminders,
                newFeatures,
                comments,
                updates
            };
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Show loading state
            saveNotificationBtn.textContent = 'Saving...';
            saveNotificationBtn.disabled = true;
            
            // Simulate API delay
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
            // Get select values
            const profileVisibility = document.getElementById('profileVisibility').value;
            const notesVisibility = document.getElementById('notesVisibility').value;
            
            // Get user data
            const userData = getUserFromLocalStorage();
            
            // Update privacy settings
            userData.privacy = {
                profileVisibility,
                notesVisibility
            };
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Show loading state
            savePrivacyBtn.textContent = 'Saving...';
            savePrivacyBtn.disabled = true;
            
            // Simulate API delay
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
                // Get user data
                const userData = getUserFromLocalStorage();
                
                // Ask for email confirmation
                const emailConfirmation = prompt(`To confirm deletion, please type your email address (${userData.email}):`);
                
                if (emailConfirmation === userData.email) {
                    // Clear user data from localStorage
                    localStorage.removeItem('userData');
                    
                    // Show success message
                    alert('Your account has been deleted. You are now signed out.');
                    
                    // Redirect to home page
                    window.location.href = 'index.html';
                } else {
                    alert('Email address does not match. Account deletion cancelled.');
                }
            }
        });
    }
    
    // Set up logout button
    function setupLogoutButton() {
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Clear user data (in a real app, this would also involve API calls)
                localStorage.removeItem('userData');
                
                // Redirect to home page
                window.location.href = 'index.html';
            });
        }
    }

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
    
    // Create demo user data in localStorage if not exists
    function initializeDemoUser() {
        if (!localStorage.getItem('userData')) {
            const demoUser = {
                email: 'user@example.com',
                name: '',
                createdAt: '2025-03-02T18:46:27Z', // Using the current UTC time you provided
                notifications: {
                    studyReminders: true,
                    newFeatures: true,
                    comments: false,
                    updates: true
                },
                privacy: {
                    profileVisibility: 'public',
                    notesVisibility: 'friends'
                }
            };
            localStorage.setItem('userData', JSON.stringify(demoUser));
        }
    }

    // Set up mobile menu toggle
    window.showMenu = function() {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.style.right = '0';
        }
    };

    window.hideMenu = function() {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.style.right = '-200px';
        }
    };

    // Initialize demo user on first load
    initializeDemoUser();

    // Update the copyright year in the footer
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} NotesBuddy. All Rights Reserved.`;
    }
})();