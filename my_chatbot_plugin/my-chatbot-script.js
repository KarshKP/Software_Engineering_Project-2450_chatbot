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
});

