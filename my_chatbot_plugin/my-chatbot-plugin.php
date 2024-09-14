<?php
/*
Plugin Name: Chatbot Plugin
Description: A simple chatbot plugin for WordPress.
Version: 1.0
Author: Chris Zheng, Danxi Hu, Shashvat Mishra
*/

// Registering and loading CSS and JS files
function my_chatbot_enqueue_assets() {
    wp_enqueue_style('my-chatbot-style', plugin_dir_url(__FILE__) . 'my-chatbot-style.css');
    wp_enqueue_script('my-chatbot-script', plugin_dir_url(__FILE__) . 'my-chatbot-script.js', array('jquery'), null, true);
}
add_action('wp_enqueue_scripts', 'my_chatbot_enqueue_assets');

// 注册一个 AJAX 处理函数
function my_get_latest_posts() {
    // 使用 WordPress 函数获取最近的三篇文章
    $recent_posts = wp_get_recent_posts(array(
        'numberposts' => 3, // 设置为获取最近的三篇文章
        'post_status' => 'publish' // 仅获取已发布的文章
    ));

    // 创建一个数组来保存文章的标题和链接
    $posts_data = array();
    foreach ($recent_posts as $post) {
        $posts_data[] = array(
            'title' => $post['post_title'],
            'link' => get_permalink($post['ID'])
        );
    }

    // 将文章数据以 JSON 格式返回
    echo json_encode($posts_data);
    wp_die(); // 结束 AJAX 请求
}

// 将函数添加到 AJAX 钩子中
add_action('wp_ajax_my_get_latest_posts', 'my_get_latest_posts');
add_action('wp_ajax_nopriv_my_get_latest_posts', 'my_get_latest_posts');

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
                <div class="question"><span id="latest_articles">Our Latest articles</span></div>
                <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span>What trainings available?</span></a></div>
                <div class="question"><span id="tips">Food safety tips</span></div>
                <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" style="text-decoration: none; color: inherit;" target="_blank"><span>Contact Us</span></a></div>
            </div>
        </div>
        <div class="footer">
            <input type="text" id="chatbot-input" placeholder="Please input your question..." />
            <button id="chatbot-send"></button>
        </div>
    </div>
    <?php
}

add_action('wp_footer', 'my_chatbot_render_html');





