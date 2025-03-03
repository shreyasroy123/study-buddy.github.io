// Admin setup for shreyasroy123
async function setAdminUser(username) {
    try {
        // First get user's ID by email (assuming username is used as email prefix)
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('full_name', username)
            .single();
            
        if (userError) throw userError;
        
        if (userData) {
            // Reset all admin privileges
            const { error: resetError } = await supabase
                .from('profiles')
                .update({ is_admin: false })
                .not('id', 'eq', userData.id);
                
            if (resetError) throw resetError;
            
            // Set this user as admin
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', userData.id);
                
            if (error) throw error;
            
            console.log(`User ${username} is now the only admin`);
            return true;
        } else {
            console.error(`User ${username} not found`);
            return false;
        }
    } catch (error) {
        console.error('Error setting admin:', error);
        return false;
    }
}

// For admin use only - run in console when needed
// setAdminUser('shreyasroy123');