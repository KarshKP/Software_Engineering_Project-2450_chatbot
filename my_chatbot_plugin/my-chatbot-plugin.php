<?php
/*
Plugin Name: Chatbot Plugin
Description: A simple chatbot plugin for WordPress.
Version: 1.0
Author: Chris Zheng, Danxi Hu, Shashvat Mishra
*/

// Registering and loading CSS and JS files
function my_chatbot_enqueue_assets() {
    wp_enqueue_style('my-chatbot-style', plugin_dir_url(__FILE__) . './my-chatbot-style.css');
    wp_enqueue_script('my-chatbot-script', plugin_dir_url(__FILE__) . './my-chatbot-script.js', array('jquery'), null, true);
}
add_action('wp_enqueue_scripts', 'my_chatbot_enqueue_assets');

// Insert chatbot HTML at bottom of page
function my_chatbot_render_html() {
    ?>
    <div id="my-chatbot-icon">
        <img src="<?php echo plugin_dir_url(__FILE__) . 'bot_icon.svg'; ?>" alt="Chat Icon">
    </div>
    <div class="container">
        <div class="header">
            <img id="my-chatbot-logo" src="<?php echo plugin_dir_url(__FILE__) . 'logo.png'; ?>" alt="Logo">
            <span>Chatbot</span>
            <img id="my-chatbot-close" src="<?php echo plugin_dir_url(__FILE__) . 'close.svg'; ?>" alt="Close Icon">
        </div>
        <div class="body">
            <div id="welcome-message">
                <p class="chatbot_message">Hi! Welcome to Food Microbiology Academy. How can I help you?</p>
            </div>
            <div id="hot-topic">
                <div class="question"><span>This is the hot topic</span></div>
                <div class="question"><span>This is the hot topic</span></div>
                <div class="question"><span>This is the hot topic</span></div>
                <div class="question"><span>This is the hot topic</span></div>
                <div class="question"><span>This is the hot topic</span></div>
            </div>
            <div class="messages">
                <p class="user_message">I want to.....</p>
            </div>
            <div class="messages">
                <p class="user_message">I want to do.....</p>
            </div>
            <div class="messages">
                <p class="user_message">I want to do something</p>
            </div>
            <div class="messages">
                <p class="user_message">I want .....</p>
            </div>
            <div class="messages"></div>
            <div class="messages"></div>
        </div>
        <div class="footer">
            <input type="text" id="chatbot-input" placeholder="Please input your question..." />
            <button id="chatbot-send"></button>
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'my_chatbot_render_html');




