// Fix for profile picture preview on signup page
document.addEventListener('DOMContentLoaded', function() {
    const profilePicInput = document.getElementById('profile-pic');
    const profilePreview = document.getElementById('profile-preview');
    
    if (profilePicInput && profilePreview) {
        profilePicInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    profilePreview.src = e.target.result;
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});