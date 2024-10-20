document.addEventListener('DOMContentLoaded', function() {

    // Hide the dialog box in the initial state
    document.querySelector('.chatbot_container').style.visibility = 'hidden';
    document.querySelector('.chatbot_container').style.opacity = '0';
    document.getElementById('blog_search_container').style.display = 'none';
  
    // Click on the icon to show the dialog box and hide the icon at the same time
    document.getElementById('chatbot_icon').addEventListener('click', function() {
        document.querySelector('.chatbot_container').style.visibility = 'visible';
        document.querySelector('.chatbot_container').style.opacity = '1';
        document.getElementById('chatbot_icon').style.visibility = 'hidden';
        document.getElementById('chatbot_icon').style.opacity = '0';
    });
  
    // Click the Close button to hide the dialog box and redisplay the icons
    document.getElementById('chatbot_close').addEventListener('click', function() {
        document.querySelector('.chatbot_container').style.visibility = 'hidden';
        document.querySelector('.chatbot_container').style.opacity = '0';
        document.getElementById('chatbot_icon').style.visibility = 'visible';
        document.getElementById('chatbot_icon').style.opacity = '1';
       // Reset chatbot content to the initial state
        resetChatbotBody();
    });
    
    // Switch back to chat mode from blog search mode
    document.getElementById('return').addEventListener('click', function() {
      document.getElementById('blog_search_container').style.display = 'none';
      document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
      resetSearchFunction();
    });
  
    // Handle the Enter key press event to trigger the send button
    document.getElementById('chatbot_input').addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
          event.preventDefault(); // Prevent the default action of Enter key
          document.getElementById('chatbot_send').click(); // Trigger the send button click event
      }
  });
  
  
  // Function to handle the send button click event
  document.getElementById('chatbot_send').addEventListener('click', function() {
    const input = document.getElementById('chatbot_input');
    const originalMessage = input.value.trim();  
    const message = originalMessage.toLowerCase();  
  
    // Split the input into words and check the word count
    const words = originalMessage.split(/\s+/);
    
    // Check if the blog search is currently hidden
    const blogSearchContainer = document.querySelector('.blog_search_container');
    const isBlogSearchHidden = window.getComputedStyle(blogSearchContainer).display === 'none';
  
    if (originalMessage) {
        input.value = '';
  
        // Handle input based on the current mode
        handleInput(words, originalMessage, message, isBlogSearchHidden);
    }
  });
  
  // Function to handle input
  function handleInput(words, originalMessage, message, isBlogSearchHidden) {
  if (!isBlogSearchHidden && words.length <= 50) {  
    // Blog search mode
    addMessageToChat(originalMessage, true, true);
    performBlogSearch(message);
  } else if (words.length <= 50) {
    // Q&A mode with spelling check
    performSpellingCheck(words, originalMessage);
  } else {
    // Handle input with more than 50 words
    handleLongInput(originalMessage, isBlogSearchHidden);
  }
  }
  
  // Spelling check functionality
  function performSpellingCheck(words, originalMessage) {
  var dictionary = new Typo("en_US", null, null, {
    dictionaryPath: typo_vars.dictionaryPath, // Ensure typo_vars is correctly passed from WordPress
    asyncLoad: true,
    loadedCallback: function () {
        var incorrectWords = [];
        var correctedWords = [...words];  // Store the corrected words
  
        words.forEach(function(word, index) {
            if (!dictionary.check(word)) {
                // Get spelling suggestions
                let suggestions = dictionary.suggest(word);
                if (suggestions.length > 0) {
                    // Replace incorrect word with the best suggestion
                    correctedWords[index] = suggestions[0];
                }
                incorrectWords.push(word);
            }
        });
  
        if (incorrectWords.length > 0) {
            // If there are spelling errors, display the corrected message
            let correctedMessage = correctedWords.join(' ');
            // addMessageToChat("Original message: " + originalMessage, false);
            addMessageToChat("Corrected message: " + correctedMessage, false);
            continueWithCorrectedInput(originalMessage,correctedMessage);  // Proceed with the corrected input
        } else {
            // If no spelling errors, continue with the original input
            continueWithCorrectedInput(originalMessage,originalMessage);
        }
    }
  });
  }
  
  // Function to proceed with the corrected input
  function continueWithCorrectedInput(originalMessage,message) {
  addMessageToChat(originalMessage);
  // Call the Q&A functionality
  fetchQandA(message);
  }
  
  // Function to show the hot topic again.
  function showHotTopic(){
    const hotTopicHTML = `
        <div id="hot_topic">
            <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">View our shop</span></a></div>
            <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
            <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
        </div>
    `;
    const chatbotBody = document.querySelector('.chatbot_body');
    chatbotBody.insertAdjacentHTML('beforeend', hotTopicHTML);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }
  
  // Function to handle Q&A functionality
  function fetchQandA(question) {
  fetch(chatbotAjax.ajax_url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        action: 'my_chatbot_get_answer',
        question: question
    })
  })
  .then(response => response.json())
  .then(data => {
    // Check if the Q&A response was successful
    if (data.success) {
        addMessageToChat(data.data.answer, false); // Display chatbot's response
    } else {
        addMessageToChat("Sorry, I don't know the answer to that question.", false);
        showHotTopic();
    }
  })
  .catch(error => {
    console.error('Error fetching answer:', error);
    addMessageToChat("An error occurred. Please try again later.", false);
  });
  }
  
  // Function to handle input longer than 50 words
  function handleLongInput(originalMessage, isBlogSearchHidden) {
  if (isBlogSearchHidden) {
    addMessageToChat(originalMessage, true);
    addMessageToChat("Enter more than 100 words, please re-enter", false);
  } else {
    addMessageToChat(originalMessage, true, true);
    addMessageToChat("Enter more than 100 words, please re-enter", false, true);
  }
  }
  
    // Function to display user or chatbot messages in the chat
    function addMessageToChat(message, isUser = true, isSearch=false) {
      const messageContainer = document.createElement('div');
      messageContainer.className = isUser ? 'user_message' : 'chatbot_message';
  
      const messageElement = document.createElement('span');
      messageElement.className="message";
      messageElement.textContent = message;
  
      messageContainer.appendChild(messageElement);
      let chatBody;
      if (!isSearch){
        chatBody = document.querySelector('.chatbot_container .chatbot_body');}
      else{
        chatBody = document.querySelector('.blog_search_container .search_message');
      }
  
      chatBody.appendChild(messageContainer);
      // Scroll to the bottom of the chat
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  
    // Fetch and display the latest articles when the 'Latest Articles' button is clicked
    document.getElementById('latest_articles').addEventListener('click', function() {
      // Send AJAX request to WordPress backend to fetch recent posts
      fetch(chatbotAjax.ajax_url + '?action=my_get_latest_posts')
        .then(response => response.json())
        .then(posts => {
          // create the articles container and title
          const articlesContainer = document.createElement('div');
          articlesContainer.className = 'rec_articles';
          const divtitle=document.createElement('div');
          divtitle.className = 'divtitle';
          const titlespan=document.createElement('span');
          titlespan.className = 'titlespan';
          titlespan.textContent = 'Latest Articles';
          
          divtitle.appendChild(titlespan);
          articlesContainer.appendChild(divtitle);
          
          // Add each fetched article to the container
          posts.forEach(post => {
            showLatestArticles(post.title, post.link,articlesContainer);
          });
  
            const chatBody = document.querySelector('.chatbot_container .chatbot_body');
            chatBody.appendChild(articlesContainer); 
            chatBody.scrollTop = chatBody.scrollHeight;
  
        })
        .catch(error => console.error('Error fetching articles:', error));
    });
  
    // Display individual articles with title and link
    function showLatestArticles(title, link, container) {
      const articleContainer = document.createElement('div');
      articleContainer.className = 'articles';
  
      const articleElement = document.createElement('span');
      articleElement.className='bodytitle';
      const linkElement = document.createElement('a');
      linkElement.href = link;
      linkElement.textContent = title;
      linkElement.target = '_blank';
  
      articleElement.appendChild(linkElement);
      articleContainer.appendChild(articleElement);
      container.appendChild(articleContainer);
    }
  
    // Display random food safety tips when the 'Food Safety Tips' button is clicked
    document.getElementById('tips').addEventListener('click', function() {
      fetch(chatbotAjax.ajax_url + '?action=my_chatbot_get_tips')
        .then(response => response.json())
        .then(data => {
          console.log(data.data.tips);
            showTips(data.data.tips);
        })
        .catch(error => console.error('Error fetching tips:', error));
    });
  
    // Function to display selected food safety tips in the chat
    function showTips(selectedTips){
    //  if (!document.getElementById('recommend_Tips')) {
    console.log(selectedTips);
      const container=document.createElement('div');
      container.id="recommend_Tips";
      const divtitle=document.createElement('div');
          divtitle.className = 'divtitle';
          const titlespan=document.createElement('span');
          titlespan.className = 'titlespan';
          titlespan.textContent = 'Food Safety Tips';
          
          divtitle.appendChild(titlespan);
          container.appendChild(divtitle);
      selectedTips.forEach((tip) => {
     // If it doesn't exist, create a new one
     const tipsContainer = document.createElement('div');
     tipsContainer.className = 'tips';
  
     const tipElement = document.createElement('span');
     tipElement.className="bodytitle"
     tipElement.textContent = tip;
    
     tipsContainer.appendChild(tipElement);
     container.appendChild(tipsContainer);
    });
  
    const chatBody = document.querySelector('.chatbot_container .chatbot_body');
    chatBody.appendChild(container); 
  
    chatBody.scrollTop = chatBody.scrollHeight;
    }
    // else{
    //   message="Already get tips , can't get it again!!"; // change message context when user already get tips
    //   addMessageToChat(message,false);
    // }
  
  
    // Add event listener for the 'Blog Search' button and use blog search function
    document.getElementById('blog_search').addEventListener('click', function() {
      document.getElementById('blog_search_container').style.display = 'flex';
      document.querySelector('.chatbot_container .chatbot_body').style.display = 'none';
      addMessageToChat("Please enter a keyword to search for blog articles.", false,true); 
    });
  
    // Function to perform a blog search using a keyword
    function performBlogSearch(keyword) {
      fetch(chatbotAjax.ajax_url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              action: 'my_search_blog_posts',
              query: keyword
          })
      })
      .then(response => response.json())
      .then(data => {
          // Check if the search was successful and data contains blog post results
          if (data.success && Array.isArray(data.data)) {
            // Create a container for the search results
            const articlesContainer = document.createElement('div');
            articlesContainer.className = 'search_articles_result';
             // Create and append a title for the search results
            const divtitle=document.createElement('div');
            divtitle.className = 'divtitle';
            const titlespan=document.createElement('span');
            titlespan.className = 'titlespan';
            titlespan.textContent = 'Search Results';
          
            divtitle.appendChild(titlespan);
            articlesContainer.appendChild(divtitle);
             // Loop through the search results and display each article
              data.data.forEach(post => {
                  if (post.title && post.link) {
                      showLatestArticles(post.title, post.link,articlesContainer);
                  } else {
                      console.error('Post missing title or link:', post);
                  }
              });
            const chatBody = document.querySelector('.chatbot_container .search_message');
            chatBody.appendChild(articlesContainer); 
            chatBody.scrollTop = chatBody.scrollHeight;
          } else {
              addMessageToChat("No articles found or the data format is incorrect.", false,true);
          }
          
      })
      .catch(error => {
          console.error('Error fetching blog posts:', error);
          // If no articles are found, display an error message
          addMessageToChat("An error occurred while searching. Please try again later.", false);
      });
  }
  
  
  
  // Function to reset the chatbot_body content to its initial state
  function resetChatbotBody() {
    const chatBody = document.querySelector('.chatbot_body');
    chatBody.innerHTML = `
        <div class="chatbot_message">
            <span class="message">Hi! Welcome to Food Microbiology Academy. How can I help you?</span>
        </div>
        <div id="hot_topic">
            <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">What trainings available?</span></a></div>
            <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
            <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
        </div>
    `;
    
    resetSearchFunction(); // Reset the blog search functionality
    rebindChatbotEvents(); // Rebind all necessary event listeners after resetting the content
  }
  
  // Function to reset the blog search functionality
  function resetSearchFunction(){
    const searchBody=document.querySelector('.blog_search_container');
    searchBody.innerHTML = `
    <div id="search_nav">
      <p>Search Blog</p>
      <img id="return" src="${chatbotAjax.pluginDirUrl}recourses/return.svg" alt="return">
    </div>
    `;
    rebindSearchEvents(); // Rebind events for the search functionality
  }
  
  // Function to rebind the search events, especially the return button
  function rebindSearchEvents(){
    document.getElementById('return').addEventListener('click', function() {
      document.getElementById('blog_search_container').style.display = 'none';
      document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
      resetSearchFunction();
    });
  }
  
  // Function to rebind events to the chatbot interface after resetting its content
  function rebindChatbotEvents() {
    document.getElementById('blog_search_container').style.display = 'none';
    document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
  
     // Event listener for fetching latest articles
    document.getElementById('latest_articles').addEventListener('click', function() {
      fetch(chatbotAjax.ajax_url + '?action=my_get_latest_posts')
      .then(response => response.json())
      .then(posts => {
        const articlesContainer = document.createElement('div');
        articlesContainer.className = 'rec_articles';
        posts.forEach(post => {
          showLatestArticles(post.title, post.link,articlesContainer);
        });
          const chatBody = document.querySelector('.chatbot_container .chatbot_body');
          chatBody.appendChild(articlesContainer); 
          chatBody.scrollTop = chatBody.scrollHeight;
  
      })
      .catch(error => console.error('Error fetching articles:', error));
    });
  
    // Event listener for showing random food safety tips
    document.getElementById('tips').addEventListener('click', function() {
        const shuffled = tips.sort(() => 0.5 - Math.random());
        const selectedTips = shuffled.slice(0, 3);
  
        showTips(selectedTips);
    });
  
    // Event listener for the blog search button
    document.getElementById('blog_search').addEventListener('click', function() {
        // Blog search functionality
        document.getElementById('blog_search_container').style.display = 'flex';
        document.querySelector('.chatbot_container .chatbot_body').style.display = 'none';
        addMessageToChat("Please enter a keyword to search for blog articles.", false,true); 
    });
    
  }
  
  });
  
  