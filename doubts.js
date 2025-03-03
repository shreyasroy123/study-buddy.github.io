// Doubts page functionality

// Initialize question modal
function initQuestionModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('question-modal')) {
        const modal = document.createElement('div');
        modal.id = 'question-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Ask a Question</h2>
                <form id="question-form">
                    <div class="form-group">
                        <label for="question-title">Title</label>
                        <input type="text" id="question-title" placeholder="Enter a descriptive title" required>
                    </div>
                    <div class="form-group">
                        <label for="question-subject">Subject</label>
                        <select id="question-subject" required>
                            <option value="">Select a subject</option>
                            <option value="math">Mathematics</option>
                            <option value="science">Science</option>
                            <option value="english">English</option>
                            <option value="history">History</option>
                            <option value="computer">Computer Science</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="question-content">Question Details</label>
                        <textarea id="question-content" rows="6" placeholder="Explain your question in detail..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="question-image">Upload Image (Optional)</label>
                        <input type="file" id="question-image" accept="image/*">
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Question</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Form submission
        const questionForm = document.getElementById('question-form');
        questionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Check if user is logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert('Please log in to ask a question');
                    window.location.href = 'login.html';
                    return;
                }

                // Get form values
                const title = document.getElementById('question-title').value;
                const subject = document.getElementById('question-subject').value;
                const content = document.getElementById('question-content').value;
                const imageFile = document.getElementById('question-image').files[0];

                // Upload image if present
                let imageUrl = null;
                if (imageFile) {
                    const fileName = `${Date.now()}-${imageFile.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('question-images')
                        .upload(fileName, imageFile);
                        
                    if (uploadError) throw uploadError;
                    
                    imageUrl = `${SUPABASE_URL}/storage/v1/object/public/question-images/${fileName}`;
                }

                // Insert question into database
                const { data, error } = await supabase
                    .from('questions')
                    .insert([
                        {
                            title,
                            subject,
                            content,
                            image_url: imageUrl,
                            user_id: user.id
                        }
                    ]);
                    
                if (error) throw error;
                
                alert('Your question has been posted successfully!');
                modal.style.display = 'none';
                
                // Refresh the questions list
                loadQuestions();
                
            } catch (error) {
                alert('Error posting question: ' + error.message);
            }
        });
    }
}

// Load questions from Supabase
async function loadQuestions() {
    try {
        const questionsList = document.getElementById('questions-list');
        if (!questionsList) return;

        // Get filter values
        const subjectFilter = document.getElementById('subject-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;

        // Construct query
        let query = supabase
            .from('questions')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url)
            `);
            
        // Apply subject filter if selected
        if (subjectFilter) {
            query = query.eq('subject', subjectFilter);
        }
        
        // Apply sorting
        switch(sortFilter) {
            case 'latest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'popular':
                query = query.order('likes', { ascending: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        // Execute query
        const { data, error } = await query;
            
        if (error) throw error;
        
        questionsList.innerHTML = '';
        
        if (data.length === 0) {
            questionsList.innerHTML = '<p>No questions found. Be the first to ask!</p>';
            return;
        }

        // Render questions
        data.forEach(question => {
            const date = new Date(question.created_at).toLocaleDateString();
            
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card';
            questionCard.innerHTML = `
                <div class="question-header">
                    <div class="question-author">
                        <img src="${question.profiles.avatar_url || 'https://via.placeholder.com/40?text=User'}" alt="User">
                        <span>${question.profiles.full_name}</span>
                    </div>
                    <div class="question-meta">
                        <span class="question-date">${date}</span>
                        <span class="question-subject">${question.subject}</span>
                    </div>
                </div>
                <div class="question-body">
                    <h3>${question.title}</h3>
                    <p>${question.content}</p>
                    ${question.image_url ? `<img src="${question.image_url}" alt="Question Image">` : ''}
                </div>
                <div class="question-footer">
                    <button class="btn-like" data-id="${question.id}">
                        <i class="far fa-thumbs-up"></i> ${question.likes || 0}
                    </button>
                    <button class="btn-reply" data-id="${question.id}">
                        <i class="far fa-comment"></i> Reply
                    </button>
                </div>
                <div class="question-replies" id="replies-${question.id}"></div>
            `;
            
            questionsList.appendChild(questionCard);
            
            // Load replies for this question
            loadReplies(question.id);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-like').forEach(button => {
            button.addEventListener('click', handleLike);
        });
        
        document.querySelectorAll('.btn-reply').forEach(button => {
            button.addEventListener('click', handleReply);
        });
        
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Handle like button click
async function handleLike(e) {
    try {
        const questionId = e.currentTarget.dataset.id;
        
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to like questions');
            window.location.href = 'login.html';
            return;
        }
        
        // Update the likes count in the database
        const { data, error } = await supabase.rpc('increment_likes', {
            question_id: questionId
        });
        
        if (error) throw error;
        
        // Update the UI
        const likesCount = parseInt(e.currentTarget.textContent.trim()) + 1;
        e.currentTarget.innerHTML = `<i class="fas fa-thumbs-up"></i> ${likesCount}`;
        e.currentTarget.disabled = true;
        
    } catch (error) {
        alert('Error liking question: ' + error.message);
    }
}

// Handle reply button click
function handleReply(e) {
    const questionId = e.currentTarget.dataset.id;
    const repliesContainer = document.getElementById(`replies-${questionId}`);
    
    // Toggle reply form
    if (repliesContainer.querySelector('.reply-form')) {
        repliesContainer.querySelector('.reply-form').remove();
    } else {
        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.innerHTML = `
            <textarea placeholder="Write your reply..." required></textarea>
            <button class="btn btn-primary btn-submit-reply" data-id="${questionId}">Post Reply</button>
        `;
        
        repliesContainer.prepend(replyForm);
        
        // Add event listener to reply submit button
        replyForm.querySelector('.btn-submit-reply').addEventListener('click', submitReply);
    }
}

// Submit a reply
async function submitReply(e) {
    try {
        const questionId = e.currentTarget.dataset.id;
        const replyContent = e.currentTarget.previousElementSibling.value.trim();
        
        if (!replyContent) {
            alert('Please write a reply before submitting');
            return;
        }
        
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to reply');
            window.location.href = 'login.html';
            return;
        }
        
        // Insert reply into database
        const { data, error } = await supabase
            .from('replies')
            .insert([
                {
                    question_id: questionId,
                    user_id: user.id,
                    content: replyContent
                }
            ]);
            
        if (error) throw error;
        
        // Reload replies for this question
        loadReplies(questionId);
        
        // Remove reply form
        document.getElementById(`replies-${questionId}`).querySelector('.reply-form').remove();
        
    } catch (error) {
        alert('Error posting reply: ' + error.message);
    }
}

// Load replies for a question
async function loadReplies(questionId) {
    try {
        const repliesContainer = document.getElementById(`replies-${questionId}`);
        
        // Get replies from database
        const { data, error } = await supabase
            .from('replies')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url)
            `)
            .eq('question_id', questionId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Remove existing replies (except the form)
        const replyForm = repliesContainer.querySelector('.reply-form');
        repliesContainer.innerHTML = '';
        if (replyForm) {
            repliesContainer.appendChild(replyForm);
        }
        
        // Add replies count
        const repliesCount = document.createElement('div');
        repliesCount.className = 'replies-count';
        repliesCount.textContent = `${data.length} ${data.length === 1 ? 'Reply' : 'Replies'}`;
        repliesContainer.appendChild(repliesCount);
        
        // Render replies
        data.forEach(reply => {
            const date = new Date(reply.created_at).toLocaleDateString();
            
            const replyCard = document.createElement('div');
            replyCard.className = 'reply-card';
            replyCard.innerHTML = `
                <div class="reply-header">
                    <div class="reply-author">
                        <img src="${reply.profiles.avatar_url || 'https://via.placeholder.com/30?text=User'}" alt="User">
                        <span>${reply.profiles.full_name}</span>
                    </div>
                    <div class="reply-date">${date}</div>
                </div>
                <div class="reply-content">
                    <p>${reply.content}</p>
                </div>
            `;
            
            repliesContainer.appendChild(replyCard);
        });
        
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check user authentication
    checkUserLoggedIn();
    
    // Load questions
    loadQuestions();
    
    // Initialize filters
    const subjectFilter = document.getElementById('subject-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (subjectFilter) {
        subjectFilter.addEventListener('change', loadQuestions);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', loadQuestions);
    }
    
    // Initialize ask question button
    const askQuestionBtn = document.getElementById('ask-question');
    if (askQuestionBtn) {
        askQuestionBtn.addEventListener('click', async () => {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please log in to ask a question');
                window.location.href = 'login.html';
                return;
            }
            
            initQuestionModal();
            document.getElementById('question-modal').style.display = 'block';
        });
    }
});