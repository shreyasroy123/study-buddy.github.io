// Admin setup - Run once in browser console
async function makeUserAdmin(email) {
    try {
        // First get the user's ID
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email) // You'll need to store email in profiles table
            .single();
            
        if (userError) throw userError;
        
        if (userData) {
            // Reset all admin privileges
            await supabase.from('profiles').update({ is_admin: false }).neq('id', userData.id);
            
            // Set this user as admin
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', userData.id);
                
            if (error) throw error;
            
            console.log(`User ${email} is now the only admin`);
        }
    } catch (error) {
        console.error('Error setting admin:', error);
    }
}

// Execute with your admin user's email
makeUserAdmin('shreyasroysandy@gmail.com');