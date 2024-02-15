import logging
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from pathlib import Path
import dotenv
from flask import Flask, render_template, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

#API KEY
dotenv_path = '/home/livechat/mysite/.env'
dotenv.load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

#Asks the user through the terminal what question to send to slack, this signifies the user sending a question towards the 24/7 teach chatbot in the frontend
def post_message_to_slack(channel, message):
    global client
    client = WebClient(token=os.environ['slack_token'])
    try:
        response = client.chat_postMessage(channel=channel, text=message)
        print("Message sent successfully: ", response["message"]["text"])
    except SlackApiError as e:
        print(f"Error posting message: {e}")

@app.route('/send-message', methods=['GET', 'POST'])
def send_message():
    if request.method == "GET":
        channel = request.args.get('channel')
        message = request.args.get('message')
        post_message_to_slack(channel, message)
        app.logger.info("Received a GET request to /send-message")
        return "Successfully sent message to slack"

@app.route('/retrieve-message', methods=['GET', 'POST'])
def retrieve_message():
    if request.method == "GET":
        channel = request.args.get('channel')
        msg = wait_for_response(channel)
        return msg

# This function waits for a response from the slack representative
def wait_for_response(channel):
    client = WebClient(token=os.environ['slack_token'])
    # Define a set to keep track of seen messages

    global texts
    conversation_history = []

    # Retrieves message from live representative
    try:
        approvedUsers = ['U05M9TS56P5', 'U05LL1BFK4Z', 'U05LL1BFK4Z']
        result = client.conversations_history(channel=channel)
        conversation_history = result["messages"]
        # Identifies which user to receive the message from, change message['user'] == 'id' to change which user it takes a response from
        texts = [message['text'] for message in conversation_history if message['user'] in approvedUsers]

    except SlackApiError as e:
        print(f"Error: {e}")

    # Recursively call the function again if there is no response indicated
    if len(texts) == 0:
        return '0'

    return texts[-1]

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)