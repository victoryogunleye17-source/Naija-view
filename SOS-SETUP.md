# SOS button (no server needed)

Hold the red SOS button for 2 seconds. After a 5 second cancel window, the SOS screen opens with
Call 112 and a list of police and Army lines. Each line has buttons for Call, WhatsApp, SMS and Email.
The message is pre-filled: "SOS! Please check my location. I am in danger." + a live Google Maps link,
refreshed every 10 seconds. The user taps Send in WhatsApp / SMS / email (browsers cannot send these automatically).

Edit the numbers in SOS_AGENCIES (top of the script in index.html). Add family/friends in SOS_CONTACTS.
Numbers were taken from npf.gov.ng and from police/Army public announcements; verify them before launch.

Optional automatic sending (30 alerts) needs Telegram or a server: see below.


Hold the red SOS button for 2 seconds. A 5 second cancel countdown starts, then the app sends 30 alerts
(one every 10 seconds, each with the latest GPS fix) saying:
"SOS! Please check my location. I am in danger." + Google Maps link.

## Option A: no server (Telegram)
1. In Telegram, message @BotFather, send /newbot, and copy the bot token. Make this bot only for SOS.
2. Create a group, add the bot and the people who must be alerted (family, community security, any agency
   officer who agrees to join). Get the group's chat id (add @RawDataBot or open
   https://api.telegram.org/bot<TOKEN>/getUpdates after sending a message in the group).
3. In index.html set SOS_TG_TOKEN and SOS_TG_CHATS. Each of the 30 alerts is sent straight from the phone.
Caution: the token is visible to anyone who views the page source. If someone abuses it, revoke it in
@BotFather and make a new one.

Also set SOS_CONTACTS (phone numbers) so the SOS screen shows one-tap SMS and WhatsApp buttons.
The user must tap Send in those apps; browsers cannot send them automatically.

## Option B: your own server
A web app cannot text or call police/DSS/NEMA by itself, and there is no public API for them.
Edit this line near the top of the script in index.html:

    const SOS_ENDPOINTS = ['https://your-server.example.com/sos'];

Each alert is POSTed as JSON: id, seq (1..30), lat, lng, accuracy, maps, time, battery.
Your server should forward it by SMS (Termii, Twilio, Africa's Talking), email, Telegram or WhatsApp
to the contacts you choose, and to any agency that agrees to receive it. Get that agreement first.

## Tuning
SOS_COUNT, SOS_GAP_MS, SOS_HOLD_MS, SOS_ARM_SECS, SOS_EMERGENCY at the top of the script.

## Limits
- The screen must stay on (the app asks for a wake lock). Browsers pause pages in the background.
- Needs internet and GPS permission already granted.
- Test with your own phone number first.
