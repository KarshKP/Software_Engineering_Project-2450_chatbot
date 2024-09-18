document.addEventListener('DOMContentLoaded', function() {
  // Hide the dialog box in the initial state
  document.querySelector('.container').style.visibility = 'hidden';
  document.querySelector('.container').style.opacity = '0';

  // lick on the icon to show the dialog box and hide the icon at the same time
  document.getElementById('my-chatbot-icon').addEventListener('click', function() {
      document.querySelector('.container').style.visibility = 'visible';
      document.querySelector('.container').style.opacity = '1';
      document.getElementById('my-chatbot-icon').style.visibility = 'hidden';
      document.getElementById('my-chatbot-icon').style.opacity = '0';
  });

  // Click the Close button to hide the dialog box and redisplay the icons.
  document.getElementById('my-chatbot-close').addEventListener('click', function() {
      document.querySelector('.container').style.visibility = 'hidden';
      document.querySelector('.container').style.opacity = '0';
      document.getElementById('my-chatbot-icon').style.visibility = 'visible';
      document.getElementById('my-chatbot-icon').style.opacity = '1';
  });

  document.getElementById('chatbot-send').addEventListener('click',function(){
    const input = document.getElementById('chatbot-input');
    const message = input.value;
    console.log(input.value);
        if (message) {
            addMessageToChat(message);
            input.value = '';
            sendToExternalAPI(message);
        }
  });

  // 修改此函数以调用外部 API
  function sendToExternalAPI(message) {
    fetch('https://external-api.example.com/endpoint', { // 将此处替换为外部 API 的 URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 根据外部 API 要求选择合适的 Content-Type
            'Authorization': 'Bearer YOUR_API_TOKEN' // 如果需要认证令牌，请在此处替换为您的 API 令牌
        },
        body: JSON.stringify({ content: message }) // 根据外部 API 的要求构造请求体
    })
    .then(response => response.json())
    .then(data => {
        addMessageToChat(data.reply, false); // 假设 API 返回一个包含回复的 JSON 对象
    })
    .catch(error => console.error('Error:', error));
  }
  
  // add message to body
  function addMessageToChat(message, isUser = true) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'messages';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.className = isUser ? 'user_message' : 'chatbot_message';

    messageContainer.appendChild(messageElement);
    
    const chatBody = document.querySelector('.container .body');
    chatBody.appendChild(messageContainer);
  }
  
  document.getElementById('latest_articles').addEventListener('click',function(){
    const input = document.getElementById('chatbot-input');
    const message = input.value;
    console.log(input.value);
        if (message) {
            addMessageToChat(message);
            input.value = '';
            sendToExternalAPI(message);
        }
  });
  
  // document.getElementById('latest_articles').addEventListener('click', function() {
  //   // 使用 WordPress REST API 获取最近的三篇文章的标题和链接
  //   fetch('/wp-json/wp/v2/posts?per_page=3&_fields=title,link')
  //       .then(response => response.json())
  //       .then(posts => {
  //           // 遍历文章并显示带有链接的标题
  //           posts.forEach(post => {
  //               showLatestArticles(post.title.rendered, post.link);
  //           });
  //       })
  //       .catch(error => console.error('Error fetching articles:', error));
  // });

  document.getElementById('latest_articles').addEventListener('click', function() {
    // 发送 AJAX 请求到 WordPress 后台获取最近的文章
    fetch('https://foodmicrobiology.academy/wp-admin/admin-ajax.php?action=my_get_latest_posts')
        .then(response => response.json())
        .then(posts => {
            // 遍历文章数据并显示带有链接的标题
            posts.forEach(post => {
                showLatestArticles(post.title, post.link);
            });
        })
        .catch(error => console.error('Error fetching articles:', error));
  });

  document.getElementById('tips').addEventListener('click', function() {
    const tips = [
        "Avoid washing raw chicken.",
        "Keep cold foods cold, at or below 4 °C.",
        "Keep hot foods hot, at or above 60 °C.",
        "Avoid cross contamination - don’t use the same cutting board for different types of food, such as meat and vegetables.",
        "Avoid cross contamination – don’t use the same cutting board for raw and cooked meat.",
        "Ensure meat is kept below vegetables and ready to eat food in the fridge.",
        "Don’t eat undercooked meat.",
        "Store eggs in the fridge to ensure they are kept at 4 °C or below.",
        "Don’t be tempted to drink raw milk.",
        "Wash your dish cloth frequently."
    ];
    // Shuffle array and select first three
    const shuffled = tips.sort(() => 0.5 - Math.random());
    const selectedTips = shuffled.slice(0, 3);

    let tipsHtml = "<div class='chatbot_message'><strong>Food safety tips:</strong><br><br>"; // Added an extra break after "Tips"
    selectedTips.forEach((tip, index) => {
        tipsHtml += `${index + 1}. ${tip}<br><br>`; // Double break line for space between tips
    });
    tipsHtml += "</div>";

    const chatBody = document.querySelector('.container .body');
    chatBody.innerHTML += tipsHtml; // Adds the formatted tips message to the chat
});


// Assuming the addMessageToChat function is like this
function addMessageToChat(message, isUser = true) {
    const messageContainer = document.createElement('div');
    messageContainer.className = isUser ? 'user_message' : 'chatbot_message';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);
    
    const chatBody = document.querySelector('.container .body');
    chatBody.appendChild(messageContainer);
}



 
  // show latest articles
  function showLatestArticles(title, link) {
    const messageContainer = document.createElement('div');
    messageContainer.id = 'rec_articles';

    const articleContainer = document.createElement('div');
    articleContainer.className = 'question';

    // 创建一个 <a> 元素来显示文章标题和链接
    const messageElement = document.createElement('span');
    const linkElement = document.createElement('a');
    linkElement.href = link; // 设置链接地址
    linkElement.textContent = title; // 设置链接文本为文章标题
    linkElement.target = '_blank'; // 新标签页打开链接

    // 将链接元素添加到 <p> 元素中
    messageElement.appendChild(linkElement);

    // 将生成的 <p> 元素添加到消息容器中
    articleContainer.appendChild(messageElement);
    messageContainer.appendChild(articleContainer);
    
    // 将消息容器添加到聊天内容中
    const chatBody = document.querySelector('.container .body');
    chatBody.appendChild(messageContainer);
  }

  


});

