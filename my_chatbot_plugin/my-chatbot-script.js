// This event runs after the page is fully loaded.
document.addEventListener('DOMContentLoaded', function() {
  // Select the main container for the chatbot messages.
  const chatbot_message_Body = document.querySelector('.chatbot_body');
  // Listens for clicks within the chatbot message body
   chatbot_message_Body.addEventListener('click', function(event) {
    // Checks if the clicked element is a child of an element with class 'question' and a span element.
    if (event.target.closest('.question span')) {
      // Retrieves the ID of the parent element that includes the title.
        const targetId = event.target.closest('.question').querySelector('.bodytitle').id;
        // Handles different functionalities based on the ID of the clicked element
        switch(targetId) {
            case 'latest_articles':
                fetchLatestArticles();
                break;
            case 'tips':
                displayFoodSafetyTips();
                break;
            case 'blog_search':
                initiateBlogSearch();
                break;
            default:
                console.log('Clicked on:', event.target.innerText);
                break;
        }
    }
});

  // Initially sets the chatbot dialog to be invisible, ensuring it doesn't obstruct the webpage before interaction
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
    // Resets the blog search input and results
    resetSearchFunction(); 
  });

  // Handle the Enter key press event to trigger the send button
  document.getElementById('chatbot_input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
       // Prevent the default action of Enter key
        event.preventDefault();
        // Trigger the send button click event
        document.getElementById('chatbot_send').click(); 
    }
});

// Function to handle the send button click event
document.getElementById('chatbot_send').addEventListener('click', function() {
  const input = document.getElementById('chatbot_input');
  const originalMessage = input.value.trim();  
  const message = originalMessage.toLowerCase();

  // Splits the message into individual words to facilitate further analysis
  const words = originalMessage.split(/\s+/);
  
  // Determines if the blog search section of the interface is visible or not
  const blogSearchContainer = document.querySelector('.blog_search_container');
  const isBlogSearchHidden = window.getComputedStyle(blogSearchContainer).display === 'none';

  // Checks if the message is not empty before proceeding
  if (originalMessage) {
      input.value = ''; 

      // Directs the input to different handling logic depending on whether the blog search is hidden
      handleInput(words, originalMessage, message, isBlogSearchHidden);
  }
});
  

  /**
 * Fetches and displays the latest articles from the server.
 * 
 * Sends an AJAX request to retrieve recent articles and appends them
 * to the chatbot's message body, allowing the user to see the latest content.
 */
  function fetchLatestArticles() {
    // Sends a request to the server to get the latest articles
    fetch(chatbotAjax.ajax_url + '?action=my_get_latest_posts')
    .then(response => response.json()) 
    .then(posts => {
      // Creates a container in the UI to display articles
      const articlesContainer = document.createElement('div');
      articlesContainer.className = 'rec_articles'; 
      const divtitle=document.createElement('div');
      divtitle.className = 'divtitle';
      const titlespan=document.createElement('span');
      titlespan.className = 'titlespan';
      titlespan.textContent = 'Latest Articles'; 
      
      // Builds the article container structure
      divtitle.appendChild(titlespan);
      articlesContainer.appendChild(divtitle);
      
      // Add each fetched article to the container
      posts.forEach(post => {
        showLatestArticles(post.title, post.link,articlesContainer);
      });

      // Appends the complete articles container to the chatbot's body and scrolls to show the newly added content
        const chatBody = document.querySelector('.chatbot_container .chatbot_body');
        chatBody.appendChild(articlesContainer); 
        chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(error => console.error('Error fetching articles:', error)); 
  }

 

  /**
 * Retrieves and displays food safety tips from the server.
 * 
 * Initiates an AJAX request to fetch tips and displays them in the chatbot UI.
 */
  function displayFoodSafetyTips() {
    // Initiates an AJAX request to the server endpoint specified to fetch food safety tips
    fetch(chatbotAjax.ajax_url + '?action=my_chatbot_get_tips')
      .then(response => response.json())
      .then(data => {
           // Invokes another function to display these tips in the user interface
          showTips(data.data.tips); 
      })
      .catch(error => console.error('Error fetching tips:', error)); 
  }



/**
 * Initiates and prepares the blog search feature.
 * 
 * Displays the blog search container, hides the regular chat body,
 * and prompts the user to enter a search keyword.
 */
function initiateBlogSearch() {
  // Displays the blog search container by setting its display style to 'flex'
  document.getElementById('blog_search_container').style.display = 'flex'; 

  // Hides the regular chat body to make space for the blog search interface.
  document.querySelector('.chatbot_container .chatbot_body').style.display = 'none'; 

  // Resets the search functionality to clear previous results and messages
  resetSearchFunction(); 

  // Informs the user to start a blog search
  addMessageToChat("Please enter a keyword to search for blog articles.", false, true); 
}
});

  /**
 * Displays a message in the chat, either from the user or the chatbot.
 * 
 * @param {string} message - The message text to be displayed.
 * @param {boolean} [isUser=true] - Indicates if the message is from the user; defaults to true.
 * @param {boolean} [isSearch=false] - Indicates if the message is part of a blog search result; defaults to false.
 */
  function addMessageToChat(message, isUser = true, isSearch=false) {
    const messageContainer = document.createElement('div');
    // Uses different styling depending on the sender
    messageContainer.className = isUser ? 'user_message' : 'chatbot_message';

    // Creates a span element that will contain the text of the message
    const messageElement = document.createElement('span');
    messageElement.className="message";
    messageElement.textContent = message; 

    // Appends the message text to the message container
    messageContainer.appendChild(messageElement);
    
    // Determines the appropriate chat body (area) to append the message to
    // depending on whether it's part of a search result or regular chat interaction
    let chatBody;
    if (!isSearch){
      // Regular messages go to the main chat body
      chatBody = document.querySelector('.chatbot_container .chatbot_body');}
    else{
      // Search messages go to a specific search message container
      chatBody = document.querySelector('.blog_search_container .search_message');
    }
    // Adds the complete message container to the designated chat body
    chatBody.appendChild(messageContainer);
    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;
  }


/**
 * Processes user input and directs it to the appropriate handler.
 * Determines whether the input should be treated as a blog search or a standard chatbot query.
 *
 * @param {Array<string>} words - Array of individual words from the user's input.
 * @param {string} originalMessage - The original message input from the user.
 * @param {string} message - The lowercase version of the original message.
 * @param {boolean} isBlogSearchHidden - Indicates if the blog search mode is currently hidden.
 */
function handleInput(words, originalMessage, message, isBlogSearchHidden) {
  // Checks if the blog search is active and if the input consists of 50 words or fewer
  if (!isBlogSearchHidden && words.length <= 50) {  
    // If in blog search mode and the input is concise, perform a search
    addMessageToChat(originalMessage, true, true);
    performBlogSearch(message);
  } else if (words.length <= 50) {
    // If not in search mode, check spelling and handle as a query
    performSpellingCheck(words, originalMessage);
  } else {
    // Handle input with more than 50 words
    handleLongInput(originalMessage, isBlogSearchHidden);
  }
  }
  
  // Function to check and correct spelling errors in user input using the Typo.js dictionary
  function performSpellingCheck(words, originalMessage) {
    // Initializes the Typo.js dictionary with settings for US English
  var dictionary = new Typo("en_US", null, null, {
     // Path to dictionary files, configured in WordPress settings
    dictionaryPath: typo_vars.dictionaryPath,
    asyncLoad: true,
    loadedCallback: function () {
        var incorrectWords = [];
        var correctedWords = [...words];

        // Iterate over each word in the input to check spelling
        words.forEach(function(word, index) {
            if (!dictionary.check(word)) { 
                // Retrieves spelling suggestions for any incorrect word
                let suggestions = dictionary.suggest(word);
                if (suggestions.length > 0) {
                    // If suggestions are available, replace the incorrect word with the first suggestion
                    correctedWords[index] = suggestions[0];
                }
                incorrectWords.push(word);
            }
        });
        
        // After processing all words, check if there were any spelling errors
        if (incorrectWords.length > 0) {
            // Joins the corrected words into a single string
            let correctedMessage = correctedWords.join(' ');
            // If errors were corrected, proceed to handle the corrected input
            continueWithCorrectedInput(originalMessage,originalMessage);
        } else {
            // If no spelling errors, continue with the original input
            continueWithCorrectedInput(originalMessage,originalMessage);
        }
    }
  });
  }
  
  
  /**
 * Checks and corrects spelling errors in user input using Typo.js.
 * 
 * Loads the Typo.js dictionary asynchronously and provides corrections for any misspelled words.
 *
 * 
 * @param {string} originalMessage - The original message text from the user.
 * @param {string} message - The text is processed by the system
 */
  function continueWithCorrectedInput(originalMessage,message) {
    addMessageToChat(originalMessage);
    // Sends the processed message to the server to get a response to the user's query or command
    fetchQandA(message);
  }
  
  /**
 * Fetches a response from the server's Q&A API based on the user's question.
 * 
 * Sends an HTTP POST request to retrieve an answer for the user's question, and
 * handles the response by displaying the answer or a fallback message.
 *
 * @param {string} question - The question entered by the user.
 */
  function fetchQandA(question) {
    // Makes an HTTP POST request to the server with the user's question
    fetch(chatbotAjax.ajax_url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded', 
    },
    body: new URLSearchParams({
        action: 'my_chatbot_get_answer', // Specifies the action to be handled by the server
        question: question  // Passes the user's question to the server
    })
  })
  .then(response => response.json()) 
  .then(data => {
    // Check if the Q&A response was successful
    if (data.success) {
        addMessageToChat(data.data.answer, false); 
    } else {
        addMessageToChat("I’m sorry, I didn’t quite understand that. If you need further assistance, please contact us.", false); 
        showHotTopic(); // Shows main menu options again to guide user to other functionalities
    }
  })
  .catch(error => {
    // Logs an error message and informs the user if there's a problem communicating with the server
    console.error('Error fetching answer:', error);
    addMessageToChat("An error occurred. Please try again later.", false); // Handles communication or server-side errors
  });
  }
  
  
  /**
 * Displays the main menu (hot topic) options in the chat interface.
 * 
 * Inserts HTML for clickable options, providing the user with direct access
 * to key functionalities such as articles, safety tips, and contact options.
 */
  function showHotTopic(){
    // Defines the HTML structure of the hot topic menu, which includes clickable options for different topics
    const hotTopicHTML = `
        <div id="hot_topic">
            <div class="question"><span id="latest_articles" class="bodytitle">Our Latest Articles</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/shop/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">View our shop</span></a></div>
            <div class="question"><span id="tips" class="bodytitle">Food safety tips</span></div>
            <div class="question"><a href="https://foodmicrobiology.academy/contact-us-2/" style="text-decoration: none; color: inherit;" target="_blank"><span class="bodytitle">Contact Us</span></a></div>
            <div class="question"><span id="blog_search" class="bodytitle">Blog Search</span></div>
        </div>
    `;

    // Selects the chatbot's body element where messages and menus are displayed
    const chatbotBody = document.querySelector('.chatbot_body');
    // Inserts the hot topic HTML into the chatbot body, adding it just before the end of the element's content
    chatbotBody.insertAdjacentHTML('beforeend', hotTopicHTML);
    // Automatically scrolls the chatbot body to the bottom to ensure the new content is visible
    chatbotBody.scrollTop = chatbotBody.scrollHeight; 
  }
  

  /**
 * Manages user input that exceeds 50 words.
 * 
 * Displays the user's input and provides feedback requesting the user
 * to shorten their input for easier processing.
 *
 * @param {string} originalMessage - The complete message entered by the user.
 * @param {boolean} isBlogSearchHidden - Indicates if the input is part of a blog search.
 */
  function handleLongInput(originalMessage, isBlogSearchHidden) {
  if (isBlogSearchHidden) {
    // Displays the user's message in the main chat area because it's not specific to the blog search
    addMessageToChat(originalMessage, true);
    // Provides feedback to the user, requesting them to shorten their input for better handling
    addMessageToChat("Enter more than 100 words, please re-enter", false);
  } else {
    // Shows user's input in the chat
    addMessageToChat(originalMessage, true, true); 
    // Similarly, prompts the user within the blog search area to shorten their message
    addMessageToChat("Enter more than 100 words, please re-enter", false, true);
  }
  }

  /**
 * Displays an individual article with its title and link in a specified container.
 *
 * @param {string} title - The title of the article to display.
 * @param {string} link - The URL link to the article.
 * @param {HTMLElement} container - The container element where the article will be appended.
 */
   function showLatestArticles(title, link, container) {
    const articleContainer = document.createElement('div');
    articleContainer.className = 'articles';

    const articleElement = document.createElement('span');
    articleElement.className='bodytitle';
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.textContent = title;
    linkElement.target = '_blank'; // Ensures that the link opens in a new tab

    articleElement.appendChild(linkElement);
    articleContainer.appendChild(articleElement);
    container.appendChild(articleContainer); // Appends the complete article element to the specified container
  }

    /**
 * Displays selected food safety tips in the chatbot interface.
 *
 * @param {Array<string>} selectedTips - An array of food safety tips to display.
 */
    function showTips(selectedTips){
      console.log(selectedTips); // Logs tips data for debugging purposes
        const container=document.createElement('div');
        container.id="recommend_Tips";
        const divtitle=document.createElement('div');
            divtitle.className = 'divtitle';
            const titlespan=document.createElement('span');
            titlespan.className = 'titlespan';
            titlespan.textContent = 'Food Safety Tips'; // Label for the tips section
            
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
    
      chatBody.scrollTop = chatBody.scrollHeight; // Scrolls to make the tips visible
      }

      
    
/**
 * Conducts a blog search using a user-supplied keyword.
 *
 * Sends a POST request to the server with the search keyword and
 * displays the resulting articles in the chatbot's search results area.
 *
 * @param {string} keyword - The search keyword entered by the user.
 */
  function performBlogSearch(keyword) {
    // Initiates a POST request to the server with the search keyword
    fetch(chatbotAjax.ajax_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Sets the content type of the request
        },
        body: new URLSearchParams({
            action: 'my_search_blog_posts', // Specifies the action to perform on the server
            query: keyword // Sends the user's search keyword as part of the request
        })
    })
    .then(response => response.json()) // Parses the JSON response from the server
    .then(data => {
        // Checks if the server response was successful and contains blog post data
        if (data.success && Array.isArray(data.data)) {
          // Creates a new container for displaying search results
          const articlesContainer = document.createElement('div');
          articlesContainer.className = 'search_articles_result';
           // Adds a title to the search results container
          const divtitle=document.createElement('div');
          divtitle.className = 'divtitle';
          const titlespan=document.createElement('span');
          titlespan.className = 'titlespan';
          titlespan.textContent = 'Search Results'; // Title for the search results section
          // Assembles the title and the container
          divtitle.appendChild(titlespan);
          articlesContainer.appendChild(divtitle);
            // Iterates through each search result and adds it to the results container
            data.data.forEach(post => {
                if (post.title && post.link) {
                  // Displays each article using a helper function that formats and appends it to the container
                    showLatestArticles(post.title, post.link,articlesContainer); 
                } else {
                    console.error('Post missing title or link:', post); // Logs an error for incomplete data
                }
            });
          // Adds the populated search results container to the chat interface
          const chatBody = document.querySelector('.chatbot_container .search_message');
          chatBody.appendChild(articlesContainer); 
          chatBody.scrollTop = chatBody.scrollHeight; // Scrolls to make the newly added content visible
        } else {
          // Displays an error message if no valid data was found or returned
            addMessageToChat("No articles found or the data format is incorrect.", false,true);
        }
    })
    .catch(error => {
        console.error('Error fetching blog posts:', error);
        // If no articles are found, display an error message
        addMessageToChat("An error occurred while searching. Please try again later.", false);
    });
}




/**
 * Resets the content of the chatbot body to the default welcome message and menu options.
 * 
 * Updates the main chat area with a welcome message and menu options, giving users
 * access to key functionalities such as articles, training information, tips, and search.
 */
function resetChatbotBody() {
  // Selects the main chat area within the chatbot interface
  const chatBody = document.querySelector('.chatbot_body');
  // Updates the HTML content of the chat body to include a welcome message and a menu of options
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
}

/**
 * Resets the blog search section to its initial state, ready for new searches.
 * 
 * Clears the current search content and sets up the initial search navigation with a clean message area.
 */
function resetSearchFunction(){
  // Selects the container specifically used for blog searches
  const searchBody=document.querySelector('.blog_search_container');
  // Clears the existing content and sets up the initial search navigation and message area
  searchBody.innerHTML = `
  <div id="search_nav">
    <p>Search Blog</p>
    <img id="return" src="${chatbotAjax.pluginDirUrl}recourses/return.svg" alt="return">
  </div>
  <div id="search_message" class="search_message"></div>
  `;

  // Calls a function to rebind necessary events for the search functionality
  rebindSearchEvents(); 
}

/**
 * Rebinds events within the blog search interface, particularly for the 'return' button.
 * 
 * Adds an event listener to the 'return' button, allowing users to return to the main chat view.
 */
function rebindSearchEvents(){
  // Adds an event listener to the 'return' button to handle user clicks, allowing users to exit the search view
  document.getElementById('return').addEventListener('click', function() {
    // Hides the blog search container
    document.getElementById('blog_search_container').style.display = 'none';
    // Displays the regular chat body, returning the user to the main chat interface
    document.querySelector('.chatbot_container .chatbot_body').style.display = 'flex';
  });
}

