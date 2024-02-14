$(document).ready(function () {
    const messages = $('.messages');

    $('.chatbot-btn').click(function () {
        // toggle the chat symbol and x symbol
        $('.material-symbols-outlined.chat').toggle();
        $('.material-symbols-outlined.symbol-x').toggle();

        // toggle the chatbox display
        $('.chatbox').toggle();
    })

    // press enter will activate the send-btn click function
    $('#user-message').keydown(function (event) {
        if (event.which === 13) { // listens for enter press
            event.preventDefault(); // prevent default form submission behavior
            $('.send-btn').click(); // trigger send-btn click function
        }
    });

    $('.send-btn').click(function () {
        let userMessage = $('#user-message').val();

        // prevents empty messages
        if (userMessage.length === 0) return;

        // create message 
        let message = $('<div>');
        message.addClass('message');
        message.append(
            `<span class="material-symbols-outlined user">
            account_circle
            </span>` +
            `<p>${userMessage}</p>`
        );

        // append message to the conversation
        $('.messages').append(message);
        scrollToBottom();

        // reset input text box
        $('#user-message').val('');

        // disable input until response is received
        $('#user-message').prop('disabled', true);

        // toggle send-btn
        $('.send-btn').toggle();

        // play animation
        $('#send-btn-loading').toggle();

        // display a robot with animation
        let robotThinkingMsg = $('<div>');
        robotThinkingMsg.addClass('message', 'robot-thinking');
        robotThinkingMsg.append(
            '<span class="material-symbols-outlined robot">smart_toy</span>' + 
            '<div class="loading-dots-animation"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'
        )
        $('.messages').append(robotThinkingMsg);
        scrollToBottom();

        // send message to backend
        $.ajax({
            url: `https://shahad247.pythonanywhere.com/process_form`,
            type: "GET",
            dataType: "json",
            data: { 'question': userMessage },
            success: function (result) {
                // wait for response before enabling input tag and toggling waiting animation
                robotThinkingMsg.remove();

                // toggle send button
                $('.send-btn').toggle();

                // toggle send button animation
                $('#send-btn-loading').toggle();

                // enable input 
                $('#user-message').prop('disabled', false);

                // update robot message with response
                let chatbotMsg = $('<div>');
                chatbotMsg.addClass('message');
                chatbotMsg.append(
                    `<span class="material-symbols-outlined robot">
                    smart_toy
                </span>` +
                    `<p>${result['message']}</p>`
                );

                // append message to the conversation
                $('.messages').append(chatbotMsg);
                scrollToBottom();

                // give focus back to input
                $('#user-message').focus();
            },
            error: function () {
                console.log("error");
            }
        });
    })

    function scrollToBottom(){
        $('.messages-container').scrollTop($('.messages-container')[0].scrollHeight);
    }
});