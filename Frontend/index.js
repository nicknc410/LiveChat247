$(document).ready(function () {
    //mode 0 is chat bot mode and mode 1 is live chat mode
    let mode = 0;
    let connected = false;
    // let sentlivemessage = false;

    // false - there were no errors with the chatbot
    // true - there were errors with the chatbot
    let chatbotErrorFlag = false;

    // chat bot button click
    $('.chatbot-btn').click(function () {
        // toggle the chat symbol and x symbol
        $('.chatbot-btn .robot').toggle();
        $('.material-symbols-outlined.symbol-x').toggle();

        // toggle chat text
        $('.chatbot-btn span:last-child').toggle();

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

    // send button click
    $('.send-btn').click(function () {
        if ($('.example-prompt').is(":visible")) $('.example-prompt').toggle();

        let userMessage = $('#user-message').val();

        // prevents empty messages
        if (userMessage.length === 0) return;

        // remove the regenerate response button
        if (chatbotErrorFlag) {
            chatbotErrorFlag = false;
            $('.resend-btn-container').toggle();
        }

        // create user message 
        let message = createUserMessage(userMessage);
        addToMessagesContainer(message);

        // reset input text box
        $('#user-message').val('');

        // chatbot mode
        if (mode == 0) {
            // disable input until response is received
            disableUserInput();

            // play robot thinking animation
            let robotThinkingMsg = createRobotThinkingMessage();
            addToMessagesContainer(robotThinkingMsg);

            // send message to backend
            answerChatbotQuestion(robotThinkingMsg, userMessage);
        } else {
            // live chat 
            send_to_live_support(userMessage);
        }
    })

    // sample question click
    $('.example-prompt .sample-question').click(function () {
        // toggle sample question div
        $('.example-prompt').toggle();

        // add the message to the container
        let sampleQuestion = $(this).text();
        let userMessageQuestion = createUserMessage(sampleQuestion);
        addToMessagesContainer(userMessageQuestion);

        disableUserInput();

        // play robot thinking animation
        let robotThinkingMsg = createRobotThinkingMessage();
        addToMessagesContainer(robotThinkingMsg);

        // ask chatbot to answer the question and upaate to the messages container
        answerChatbotQuestion(robotThinkingMsg, sampleQuestion);
    });

    // resend button click
    $('.resend-btn').click(function () {
        // hide regenerate button 
        $(this).parent().css("display", "none");
        disableUserInput();

        // remove previous chatbot message
        $(".message > img.robot").last().parent().remove();

        // retrieve previous user message
        let prevUserMessage = ($(".message > img.user").last().parent().find("div.messagecontent").text());

        // send user message back to the chatbot again and update frontend
        let robotThinkingMessage = createRobotThinkingMessage();
        addToMessagesContainer(robotThinkingMessage);
        answerChatbotQuestion(robotThinkingMessage, prevUserMessage);
    });


    // disables users from typing in input and sending a message
    function disableUserInput() {
        // disable input until response is received
        $('#user-message').prop('disabled', true);

        // toggle send-btn
        $('.send-btn').toggle();

        // play sending animation
        $('#send-btn-loading').toggle();
    }

    function enableUserInput() {
        // disable input until response is received
        $('#user-message').prop('disabled', false);

        // toggle send-btn
        $('.send-btn').toggle();

        // play sending animation
        $('#send-btn-loading').toggle();

        // give focus back to the user input
        $('#user-message').focus();
    }

    // create a user message
    function createUserMessage(userMessage) {
        let message = $('<div>');
        message.addClass('message');
        message.append(
            `<img class="user" src="https://images.squarespace-cdn.com/content/63c867491abe131843b09837/77d47f57-f0ce-46ad-8d37-968db13955a9/Male+User.png?content-type=image%2Fpng" alt="user-fill">` +
            `<div class = "messagecontent">${userMessage}</p>`
        );
        if (mode == 0) {
            message.append(
                `<button class="help-btn">
                <img class="help-circle" src="https://images.squarespace-cdn.com/content/63c867491abe131843b09837/c751c1a9-7cb4-478d-a31d-8dedf9969783/Help.png?content-type=image%2Fpng"/>
            </button>`
            );
        }

        return message;
    }

    // creates the robot thinking message
    function createRobotThinkingMessage() {
        let robotThinkingMsg = $('<div>');
        robotThinkingMsg.addClass('message robot-thinking');
        robotThinkingMsg.append(
            '<img class="robot" src="https://images.squarespace-cdn.com/content/63c867491abe131843b09837/490548d6-1ab1-4592-a066-0b8eb1beb394/Message+Bot+%281%29.png?content-type=image%2Fpng" alt="robot-fill">' +
            '<div class="loading-dots-animation"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'
        )
        return robotThinkingMsg;
    }

    // add message to the conversation
    function addToMessagesContainer(message) {
        if (mode == 0) {
            $('.messages').append(message);
        }
        else {
            $('.livechatmessages').append(message);
        }
        scrollToBottom();
    }

    function createChatbotMessage(message) {
        let chatbotMsg = $('<div>');
        chatbotMsg.addClass('message');
        chatbotMsg.append(
            `<img class="robot" src="https://images.squarespace-cdn.com/content/63c867491abe131843b09837/490548d6-1ab1-4592-a066-0b8eb1beb394/Message+Bot+%281%29.png?content-type=image%2Fpng" alt="robot-fill">`
        );

        // make the color of the chatbot text turn red 
        if (chatbotErrorFlag) {
            chatbotMsg.append(`<p class="chatbot-error">${message}</p>`);
        } else {
            chatbotMsg.append(`<p>${message}</p>`);
        }

        return chatbotMsg;
    }

    // pass in the reference of the robot thinking message (to be removed when chatbot responds)
    // question refers to the question being asked to the chatbot
    function answerChatbotQuestion(robotThinkingMsg, question) {
        // send message to backend
        $.ajax({
            url: `https://shahad247.pythonanywhere.com/process_form`,
            type: "GET",
            dataType: "json",
            data: { 'question': question },
            timeout: 30000, // set the timout for failure (30000ms = 30 seconds) if the chatbot doesn't respond in 30 seconds then something went wrong
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
                let resultMsg = result['message'];
                let chatbotMsg = createChatbotMessage(resultMsg);

                addToMessagesContainer(chatbotMsg);

                // give focus back to input
                $('#user-message').focus();
            },
            error: function () {
                console.log("error");
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // chatbot fails to respond within timout time
            if (textStatus === "timeout") {
                // update chatbot error flag
                chatbotErrorFlag = true;

                // remove the robot thinking animation
                $('.robot-thinking').remove();

                // create a chatbot message saying that there was an error
                let chatbotMessage = "Our chatbot has timedout and could not respond to your query within a certain time period. Please hit the regenerate response button to try again or click on the ? to talk to a live person."
                addToMessagesContainer(createChatbotMessage(chatbotMessage));

                // display regenerate response button
                $('.resend-btn').parent().css("display", "block");

                // reenable user input
                enableUserInput();

            } else {
                // other type of error has occurred
                console.error("Error:", errorThrown);
            }
        });
    }

    function scrollToBottom() {
        if (mode == 0) {
            // scroll to the bottom of the messages container
            $('.messages').scrollTop($('.messages')[0].scrollHeight);
        }
        else {
            // scroll to the bottom of the live chat messages container
            $('.live-chat-msg-container').scrollTop($('.live-chat-msg-container')[0].scrollHeight);
        }
    }

    // Displays waiting message if user is not yet connected to live chat
    function updateWaitingMessage() {
        if (!connected && mode == 1) {
            $(".waiting-message").toggle();
            // $('#user-message').prop('disabled', true);
        }
        else {
            $(".waiting-message").hide();
            // $('#user-message').prop('disabled', false);
        }

    }

    // Hides chatbot messages, shows live chat
    // Also adds question to live chat
    $(document).on('click', '.messages .help-btn', function () {
        let parent = $(this).parent();
        let messageContent = parent.find('.messagecontent').text();

        // toggles live chat features
        $(".live-chat-msg-container").toggle();

        $(".livechat-intro").css("display", "grid");

        // display back-btn
        $('.back-btn').css('display', 'flex');

        // toggle chatbot features
        $('.messages-container').toggle();
        $(".messages").toggle();
        $(".chatbox-intro").toggle();

        // check to see if waiting message is visible
        console.log($('.waiting-message').css('display'));
        if($('.waiting-message').css('display') !== 'none'){
            $('.waiting-message').toggle();
        }

        // change chatbot mode to live chat mode
        mode = mode ^ 1

        updateWaitingMessage();

        // add message to the live chatbox container
        let message = createUserMessage(messageContent);
        addToMessagesContainer(message);

        send_to_live_support(messageContent);
    });

    function send_to_live_support(message) {
        const urlSend = 'https://live-chat-api-ejiw.onrender.com/send-message';

        $.ajax({
            url: `${urlSend}`,
            method: 'GET',
            dataType: "json",
            data: {'message': String(message)},
            timeout: 30000,
            success: function (result) {
                console.log("Message Sent");
            },
            error: function (error) {
                console.error('Error sending message:', error);
            }
        });
    }

    $('.back-btn').click(function () {
        // toggle chat bot message container
        $('.messages-container').toggle();
        $(".live-chat-msg-container").toggle();
        $(".livechat-intro").toggle();
        $(".messages").toggle();
        $(".chatbox-intro").toggle();
        mode = mode ^ 1
        updateWaitingMessage();
    })

    // connect to chat server
    // N: I'm thinking that we should this only when the user clicks on the ? button for help        

    let conn = new WebSocket("wss://live-chat-chatserver.onrender.com");
    conn.onopen = function(e) {
        console.log("Connection established!");
    };
    conn.onmessage = function(e) {
        // remove the waiting message if it is visible
        if($('.waiting-message').is(':visible')){
            $('.waiting-message').toggle();
        }

        let msg1 = createChatbotMessage(e.data);
        console.log(msg1);
        // $('.livechatmessages').append(msg1);
        addToMessagesContainer(msg1);
    };
    conn.onclose = function(e) {
        console.log(e.code);
        console.log(e.reason);
    };              
    conn.onerror = function(e) {
        console.log(e);
    };    
});
