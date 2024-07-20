# Offspring Restock Monitor Discord Bot Solution

Welcome to the Offspring Restock Monitor Discord Bot Solution repository! This repository contains three distinct Node.js projects designed to monitor and alert for sneaker restocks on offspring.com.

## Project Descriptions

### 1. Offspring Monitor Web App

The Offspring Monitor Web App allows users to enter a product code from offspring.com and retrieves the stock information for that product. It uses Express.js to serve a web interface and handle the backend logic.

#### Features:
- Enter a product code from offspring.com
- Retrieve and display stock information for the specified product
- Serves a simple HTML interface for user interaction

### 2. Discord Bot for Restock Alerts

The Discord Bot for Restock Alerts monitors a Google inbox for emails from offspring.com and sends notifications to a designated Discord channel whenever restock notifications are received.

#### Features:
- Monitor Google inbox for restock notifications
- Parse incoming emails for relevant restock information
- Send notifications to a specified Discord channel

### 3. Offspring Session Web Scraper

The Offspring Session Web Scraper uses Puppeteer to automate the process of signing up for email restocks on offspring.com. It can target specific sizes or all out-of-stock sizes.

#### Features:
- Automated Restock Sign-ups: Automatically sign up for restock notifications on offspring.com
- Console Interface: Provides a user-friendly console interface for interaction
- Captcha Handling: Solves CAPTCHAs during the browsing session
- Dynamic Cookie and Header Management: Manages cookies and headers for HTTP requests
- Stock Information Retrieval: Retrieves and displays stock information for specified products

#### Technical Details:
- Session Setup: Initializes a Puppeteer browser session for browsing offspring.com
- Cookie and Header Management: Manages cookies and sets headers for HTTP requests
- Interactive Console Interface: Guides users through product and restock operations
- Command Handling: Listens for user input and executes corresponding functions
- Product Size Retrieval: Uses Axios to fetch product size information
- Restock Email Sign-up: Automates signing up for restock notifications
- Error Handling: Implements robust error handling for API calls and session issues

## Technologies used:
Node.js | Express.js | discord.js | Puppeteer | Axios |Google API (Gmail API)

# Project Disclaimer

## Disclaimer

This project is for educational purposes only. It does not provide accurate stock size information from offspring.com and is not intended for commercial use or distribution. Use of this project is at your own risk.

**Additional Disclaimer:**

This project is incomplete, and all references to real-world APIs have been left out.

## Things that need to be improved:

1. **Email Parsing and Formatting:**
   - The email returned needs to be parsed and formatted accordingly.

2. **Stock Checking:**
   - The returning of the stock for a product must call the correct API or use an alternative web scraping method.

Hopefully, this project will act as a proof of concept or a guide for the development of a restock monitor bot for Offspring.

For any questions, feel free to get in contact with me.



