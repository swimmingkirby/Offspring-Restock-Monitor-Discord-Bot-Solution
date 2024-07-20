// emailParser.js
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

let oAuth2Client;

function initialize(client) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), client);
    });
}

function authorize(credentials, client) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile('token.json', (err, token) => {
        if (err) return getAccessToken(oAuth2Client, client);
        oAuth2Client.setCredentials(JSON.parse(token));
        startCheckingInbox(client);
    });
}

function getAccessToken(oAuth2Client, client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile('token.json', JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', 'token.json');
            });
            startCheckingInbox(client);
        });
    });
}

function listMessages(auth, client) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list(
        {
            userId: 'me',
            q: 'is:unread',
        },
        (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const messages = res.data.messages;
            if (messages && messages.length) {
                console.log('Messages:');
                messages.forEach((message) => {
                    getMessageDetails(auth, message.id, client);
                });
            } else {
                console.log('No new messages.');
            }
        }
    );
}

function getMessageDetails(auth, messageId, client) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.get(
        {
            userId: 'me',
            id: messageId,
        },
        (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const message = res.data;
            const headers = message.payload.headers;
            const subjectHeader = headers.find(header => header.name === 'Subject');
            const fromHeader = headers.find(header => header.name === 'From');
            const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
            const from = fromHeader ? fromHeader.value : '(Unknown Sender)';
            
            let body = '';
            if (message.payload.parts) {
                const part = message.payload.parts.find(part => part.mimeType === 'text/plain');
                if (part && part.body && part.body.data) {
                    body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            } else if (message.payload.body && message.payload.body.data) {
                body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
            }

            sendDiscordMessage(client, `New Email:\nFrom: ${from}\nSubject: ${subject}\nBody: ${body.substring(0, 1000)}`);

            gmail.users.messages.modify(
                {
                    userId: 'me',
                    id: messageId,
                    resource: {
                        removeLabelIds: ['UNREAD'],
                    },
                },
                (err, res) => {
                    if (err) return console.log('Failed to mark as read:', err);
                    console.log(`Message ${messageId} marked as read.`);
                }
            );
        }
    );
}

function startCheckingInbox(client) {
    console.log('Started checking inbox...');
    setInterval(() => {
        listMessages(oAuth2Client, client);
    }, 60000); // 60 seconds
}

function sendDiscordMessage(client, content) {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send(content);
    } else {
        console.log('Could not find Discord channel');
    }
}

module.exports = { initialize };