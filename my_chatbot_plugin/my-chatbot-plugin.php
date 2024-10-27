<?php
/*
Plugin Name: Chatbot Plugin Final
Description: A chatbot plugin for WordPress with an article recommendation feature and Q&A feature.
Version: 9.0
Author: P000237SE-Blog Website Chatbot Project
*/

/**
 * Enqueue the necessary CSS and JavaScript files for the chatbot.
 * Includes localization for AJAX URL and plugin directory URL for JavaScript use.
 */
function chatbot_enqueue_assets() {
    wp_enqueue_style('chatbot-style', plugin_dir_url(__FILE__) . 'chatbot-style.css');
    wp_enqueue_script('chatbot-script', plugin_dir_url(__FILE__) . 'chatbot-script.js', array('jquery'), null, true);
    wp_enqueue_script('typo-js', plugin_dir_url(__FILE__) . 'typo.js', array(), null, true);
    
    wp_localize_script('typo-js', 'typo_vars', array(
        'dictionaryPath' => plugin_dir_url(__FILE__) . 'dictionaries'
    ));

    // Localize script to provide AJAX URL and nonce for security
    wp_localize_script('chatbot-script', 'chatbotAjax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'pluginDirUrl' => plugin_dir_url(__FILE__) // Injecting plugin directory URL into JavaScript
    ));
}
add_action('wp_enqueue_scripts', 'chatbot_enqueue_assets');

/**
 * Renders the HTML structure for the chatbot interface at the footer.
 * Displays chatbot icon, main chatbot container, and UI elements.
 */
function my_chatbot_render_html() {
    ?>
    <div id="chatbot_icon">
        <img src="<?php echo plugin_dir_url(__FILE__) . 'recourses/bot_icon.svg'; ?>" alt="Chat Icon">
    </div>
    <div class="chatbot_container">
        <div class="chatbot_header">
            <img id="chatbot_logo" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/logo.png'; ?>" alt="Logo">
            <span class="header_title">Chatbot</span>
            <img id="chatbot_close" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/close.svg'; ?>" alt="Close Icon">
        </div>
        <div class="chatbot_body">
            <div class="chatbot_message">
                <span class="message">Hi! Welcome to Food Microbiology Academy. How can I help you?</span>
            </div>
            <div id="hot_topic">
                <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
                <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">View our shop</span></a></div>
                <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
                <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
                <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
            </div>
        </div>
        <div id="blog_search_container" class="blog_search_container">
            <div id="search_nav">
            <p>Search Blog</p>
            <img id="return" src="<?php echo plugin_dir_url(__FILE__) . 'recourses/return.svg'; ?>" alt="return">
            </div>
            <div id="search_message" class="search_message"></div>
            
        </div>
        <div class="chatbot_footer">
            <input type="text" id="chatbot_input" placeholder="Please input your question..." />
            <button id="chatbot_send"></button>
        </div>
    </div>
    <?php
}

add_action('wp_footer', 'my_chatbot_render_html');



/**
 * Handles AJAX request to retrieve the latest posts.
 * Returns the latest three published posts in JSON format.
 */
function my_get_latest_posts() {
    // Use WordPress function to get the latest three posts
    $recent_posts = wp_get_recent_posts(array(
        'numberposts' => 3,
        'post_status' => 'publish'
    ));

    // Create an array to hold post titles and links
    $posts_data = array();
    foreach ($recent_posts as $post) {
        $posts_data[] = array(
            'title' => $post['post_title'],
            'link' => get_permalink($post['ID'])
        );
    }
    // Return post data as JSON
    echo json_encode($posts_data);
    wp_die(); // Terminate AJAX request
}

add_action('wp_ajax_my_get_latest_posts', 'my_get_latest_posts');
add_action('wp_ajax_nopriv_my_get_latest_posts', 'my_get_latest_posts');

/**
 * Searches blog posts based on keywords in the title and content.
 * Uses SQL to match keyword patterns and returns up to five posts.
 */
function my_search_blog_posts() {
    // Get the search keyword from the POST request and sanitize it
    $keyword = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
    if (empty($keyword)) {
        wp_send_json_error('No keyword provided');
        return;
    }

    global $wpdb;
    $keywords = explode(' ', $keyword);
    $keywords = array_filter($keywords); // Remove invalid characters like spaces

    // Initialize search conditions and similarity score
    $search_patterns = [];
    $similarity_score = "0";  // Initial similarity score is set to 0

    // Search condition for the full keyword in title and its similarity score
    $full_keyword = $wpdb->esc_like($keyword);
    $search_patterns[] = "(post_title LIKE '%$full_keyword%')";
    $similarity_score .= " + (CASE WHEN post_title LIKE '%$full_keyword%' THEN 5 ELSE 0 END)";

    // If there are multiple keywords, create conditions for each word
    if (count($keywords) > 1) {
        // Process multiple word combinations and their similarity scores
        for ($i = 0; $i < count($keywords); $i++) {
            for ($j = count($keywords) - $i; $j >= 2; $j--) {
                $sub_phrase = implode(' ', array_slice($keywords, $i, $j));
                $sub_phrase = $wpdb->esc_like($sub_phrase);
                $search_patterns[] = "(post_title LIKE '%$sub_phrase%')";
                $similarity_score .= " + (CASE WHEN post_title LIKE '%$sub_phrase%' THEN 4 ELSE 0 END)";
            }
        }
        // Generate search conditions and similarity scores for each individual word
        foreach ($keywords as $word) {
            $word = $wpdb->esc_like($word);
            $search_patterns[] = "(post_title LIKE '%$word%')";
            $similarity_score .= " + (CASE WHEN post_title LIKE '%$word%' THEN 3 ELSE 0 END)";
        }
    }

    // Build SQL query, calculate similarity score, and order by score
    $query = "
        SELECT *, (COALESCE($similarity_score, 0)) AS relevance_score
        FROM {$wpdb->posts}
        WHERE post_status = 'publish'
        AND post_type = 'post'
        AND (" . implode(' OR ', $search_patterns) . ")
        ORDER BY relevance_score DESC
        LIMIT 5
    ";

    // Execute the query
    $posts = $wpdb->get_results($query);
    if (!empty($posts)) {
        $posts_data = [];
        foreach ($posts as $post) {
            $posts_data[] = [
                'title' => $post->post_title,
                'link' => get_permalink($post->ID)
            ];
        }
        wp_send_json_success($posts_data);
    } else {
        wp_send_json_error('No posts found');
    }

    wp_die();
}


add_action('wp_ajax_nopriv_my_search_blog_posts', 'my_search_blog_posts');
add_action('wp_ajax_my_search_blog_posts', 'my_search_blog_posts');

/**
 * Responds to user questions by searching through a Q&A JSON file for matching questions.
 * Uses word similarity to identify the most relevant answer, returns it in JSON format.
 */
function my_chatbot_get_answer() {
    // Load the JSON file with Q&A data
    $json_data = file_get_contents(plugin_dir_path(__FILE__) . 'Q&A.json');
    $qa_data = json_decode($json_data, true);

    // Get the user question
    $question = isset($_POST['question']) ? sanitize_text_field($_POST['question']) : '';
    if (empty($question)) {
        wp_send_json_error('No question provided');
        return;
    }
    // Convert the question to lowercase
    $lower_question = strtolower($question);
    // Split the question into words
    $question_words = explode(' ', $lower_question); 

    // Initialize the highest similarity and the matching question
    $highest_similarity = 0;
    $best_match_question = null;
    $best_match_found = false;

    // Traverse all questions to find the one with the highest similarity
    foreach ($qa_data as $key => $value) {
        $key_lower = strtolower($key);
        $key_words = explode(' ', $key_lower); // Split the key into words
        $word_matches = 0;

        // Check each word in the question against the key
        foreach ($question_words as $q_word) {
            if (in_array($q_word, $key_words)) {
                $word_matches++;
            }
        }

        // Calculate match percentage based on the number of matching words
        $match_percentage = $word_matches / count($question_words) * 100;

        // Check for the best match based on the percentage of matched words
        if ($match_percentage > $highest_similarity) {
            $highest_similarity = $match_percentage;
            $best_match_question = $key;
            $best_match_found = true;
        }
    }

    // If a match is found that meets the threshold, return the corresponding answer
    if ($best_match_found && $highest_similarity > 50) { // You can adjust the threshold as needed
        $answers = $qa_data[$best_match_question];

        // If multiple answers are available, randomly select one
        if (is_array($answers)) {
            $random_answer = $answers[array_rand($answers)];
        } else {
            $random_answer = $answers;
        }

        wp_send_json_success(array('answer' => $random_answer));
    } else {
        wp_send_json_error('I’m sorry, I didn’t quite understand that. If you need further assistance, please contact us.');
    }

    wp_die(); // End AJAX request
}

add_action('wp_ajax_my_chatbot_get_answer', 'my_chatbot_get_answer');
add_action('wp_ajax_nopriv_my_chatbot_get_answer', 'my_chatbot_get_answer');

/**
 * Provides random food safety tips by loading from a Tips JSON file.
 * Returns three random tips in JSON format.
 */
function my_chatbot_get_tips(){
    // Load the JSON file with Tips data
    $json_data = file_get_contents(plugin_dir_path(__FILE__) . 'Tips.json');
    $tips_data = json_decode($json_data, true);

    if (is_array($tips_data['tips'])) {
        shuffle($tips_data['tips']);
        
        // get Tips
        $randomTips = array_slice($tips_data['tips'], 0, 3);
        
        wp_send_json_success(array('tips' => $randomTips));
    } else {
        wp_send_json_error('Sorry, system can not find the file.');
    }

}

add_action('wp_ajax_my_chatbot_get_tips', 'my_chatbot_get_tips');
add_action('wp_ajax_nopriv_my_chatbot_get_tips', 'my_chatbot_get_tips');

