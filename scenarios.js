

const START_BALANCE = 200000;

const REAL_LIFE_HELP = [
  'Call 1930, the National Cyber Crime Helpline. The first hour matters most for freezing the money.',
  'File a complaint at cybercrime.gov.in.',
  'Call your bank on the number printed on your card and block the card, UPI and net banking.',
];

const OLD_MAIL = [
  { from: 'Coursera', subject: 'Your weekly learning summary', preview: 'You completed 3 lessons this week…', time: 'Mon' },
  { from: 'College Placement Cell', subject: 'Pre-placement talk: Thursday 4 PM', preview: 'All final-year students are requested…', time: 'Sun' },
];

const CYBER_LEVELS = [

  {
    id: 1,
    title: 'Phishing Inbox',
    subtitle: "Five emails land in your phone's inbox. Some are real. Check them like you would your own.",
    icon: '📧',
    device: 'phone',
    difficulty: 'easy',
    tip: 'Tap the sender name to see the real email address. Tapping a link shows where it really goes before it opens.',
    badge: { id: 'inbox-guard', icon: '📧', name: 'Inbox Guard' },
    scenarios: [
      {
        title: 'The tax refund',
        setup: 'An email notification pops up while you are scrolling Instagram.',
        notify: { app: 'Mail', from: 'Income Tax Department', preview: 'Refund of ₹15,490 approved — action required' },
        start: 'inbox',
        steps: {
          inbox: {
            view: 'inbox',
            items: [{ from: 'Income Tax Department', subject: 'Refund of ₹15,490 approved — action required', preview: 'Dear Taxpayer, after the last annual calculation…', go: 'mail' }],
          },
          mail: {
            view: 'mail', from: 'Income Tax Department', address: 'refund@incometax-gov-in.co',
            subject: 'Refund of ₹15,490 approved — action required',
            body: [
              'Dear Taxpayer,',
              'After the last annual calculation of your fiscal activity, you are eligible to receive a tax refund of ₹15,490.',
              'Please submit your card details within 48 hours, or the refund will be cancelled.',
            ],
            link: { text: 'Claim refund', url: 'http://incometax-gov-in.co/refund/claim', go: 'site' },
            actions: [
              { label: 'Report phishing', end: 'reported' },
              { label: 'Delete', end: 'deleted' },
            ],
          },
          site: {
            view: 'browser', url: 'incometax-gov-in.co/refund/claim', heading: 'e-Filing Refund Claim',
            note: 'Your refund will be credited to your debit card within 2 hours.',
            fields: ['PAN', 'Debit card number', 'Expiry (MM/YY)', 'CVV', 'OTP'],
            submit: { label: 'Claim ₹15,490', end: 'scammed' },
            close: { label: 'Close tab', end: 'closed' },
          },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. You reported it.', text: 'Reporting helps your mail app catch the same email for other people too.' },
          deleted: { safe: true, title: 'Safe. You deleted it.', text: 'Nothing lost. Reporting it as phishing would have been even better.' },
          closed: { safe: true, title: 'Safe, but that was close.', text: 'You backed out before typing anything. Next time, check the link before you open it.' },
          scammed: { safe: false, loss: 28000, title: 'Your card was used.', text: 'The page sent your card number, CVV and OTP to the scammer, who spent it within minutes. There was never any refund.' },
        },
        flags: [
          'The sender is incometax-gov-in.co. The real department uses incometax.gov.in.',
          'Tax refunds go straight to the bank account linked on the e-filing portal. Nobody asks for your card or CVV.',
          'A 48-hour deadline is there to rush you.',
          '"Annual calculation of your fiscal activity" is not how the tax department writes.',
        ],
      },
      {
        title: 'The sign-in alert',
        setup: 'You just signed in to your Gmail on a new laptop in the college library.',
        notify: { app: 'Mail', from: 'Google', preview: 'Security alert: new sign-in on Windows' },
        start: 'inbox',
        steps: {
          inbox: {
            view: 'inbox',
            items: [{ from: 'Google', subject: 'Security alert', preview: 'A new sign-in on Windows. We noticed a new sign-in…', go: 'mail' }],
          },
          mail: {
            view: 'mail', from: 'Google', address: 'no-reply@accounts.google.com', subject: 'Security alert',
            body: [
              'A new sign-in on Windows',
              "We noticed a new sign-in to your Google Account on a Windows device. If this was you, you don't need to do anything. If not, we'll help you secure your account.",
            ],
            link: { text: 'Check activity', url: 'https://myaccount.google.com/notifications', end: 'checked' },
            actions: [
              { label: 'Report phishing', end: 'falsealarm' },
              { label: 'Archive', end: 'archived' },
            ],
          },
        },
        outcomes: {
          archived: { safe: true, title: 'Correct. This one was real.', text: 'It matched what you had just done, came from accounts.google.com, and asked for nothing.' },
          checked: { safe: true, title: 'Correct. This one was real.', text: 'The link really did go to myaccount.google.com, so checking your activity was fine.' },
          falsealarm: { safe: false, title: 'False alarm. This one was genuine.', text: "Being careful is good, but you just signed in on a new laptop. Reporting real alerts trains you to ignore them when they matter." },
        },
        flagsTitle: 'Why this one was genuine',
        flags: [
          'It came from accounts.google.com, the real Google domain.',
          'It described something you had just done yourself.',
          'It did not ask for a password, OTP or payment, and gave no deadline.',
          'The link pointed to myaccount.google.com.',
        ],
      },
      {
        title: 'The scholarship form',
        setup: 'You applied for a few scholarships last month. A new email arrives.',
        notify: { app: 'Mail', from: 'National Scholarship Cell', preview: 'Congratulations! You are shortlisted for the ₹50,000 scholarship' },
        start: 'inbox',
        steps: {
          inbox: {
            view: 'inbox',
            items: [{ from: 'National Scholarship Cell', subject: 'Shortlisted: Merit Scholarship 2026', preview: 'Congratulations! You are shortlisted for ₹50,000…', go: 'mail' }],
          },
          mail: {
            view: 'mail', from: 'National Scholarship Cell', address: 'nsp.scholarship2026@gmail.com',
            subject: 'Shortlisted: Merit Scholarship 2026',
            body: [
              'Dear Student,',
              'Congratulations! You have been shortlisted for the Merit Scholarship 2026 of ₹50,000.',
              'Download the attached form, fill in your details and bank account, and submit within 24 hours.',
            ],
            attachment: { name: 'Scholarship_Form.pdf.apk', size: '4.2 MB', go: 'install' },
            actions: [
              { label: 'Report phishing', end: 'reported' },
              { label: 'Delete', end: 'reported' },
            ],
          },
          install: {
            view: 'dialog', app: 'Files',
            behind: [{ t: 'h', text: 'Downloads' }, { t: 'card', text: 'Scholarship_Form.pdf.apk', sub: '4.2 MB · just now' }],
            title: 'Install unknown app?',
            text: 'For your security, your phone is not allowed to install unknown apps from this source.',
            actions: [
              { label: 'Settings → Allow from this source', go: 'perm' },
              { label: 'Cancel', end: 'cancelled' },
            ],
          },
          perm: {
            view: 'dialog', app: 'Scholarship Form',
            behind: [{ t: 'h', text: 'Scholarship Form' }, { t: 'muted', text: 'Setting up…' }],
            title: 'Allow Scholarship Form to read and send SMS messages?',
            text: 'It also wants to display over other apps and read your contacts.',
            actions: [
              { label: 'Allow', end: 'scammed' },
              { label: "Don't allow", end: 'cancelled' },
            ],
          },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. You spotted it.', text: 'Government scholarships are handled on scholarships.gov.in, not through Gmail attachments.' },
          cancelled: { safe: true, title: 'Safe, at the last step.', text: "You stopped before the app got control. Delete the file from Downloads so you don't tap it by mistake later." },
          scammed: { safe: false, loss: 22000, title: 'The "form" was a banking trojan.', text: 'With SMS access, the app read your bank OTPs and approved payments while you slept.' },
        },
        flags: [
          'A government scholarship cell writing from a @gmail.com address.',
          'The file ends in .apk, so it is an Android app pretending to be a PDF.',
          'It asks for your bank account through a downloaded form, with a 24-hour deadline.',
          'A "form" asking to read your SMS is never normal.',
        ],
      },
      {
        title: 'The food order receipt',
        setup: 'You ordered dinner on Swiggy 20 minutes ago and paid ₹419 by UPI.',
        notify: { app: 'Mail', from: 'Swiggy', preview: 'Your Swiggy order summary' },
        start: 'inbox',
        steps: {
          inbox: {
            view: 'inbox',
            items: [{ from: 'Swiggy', subject: 'Your Swiggy order summary', preview: 'Thanks for ordering from Paradise Biryani…', go: 'mail' }],
          },
          mail: {
            view: 'mail', from: 'Swiggy', address: 'noreply@swiggy.in', subject: 'Your Swiggy order summary',
            body: [
              'Thanks for ordering from Paradise Biryani.',
              'Item total ₹389 · Delivery fee ₹30 · Total paid ₹419 via UPI',
              'Need help with this order? Open the Swiggy app and go to Help.',
            ],
            actions: [
              { label: 'Report phishing', end: 'falsealarm' },
              { label: 'Archive', end: 'archived' },
            ],
          },
        },
        outcomes: {
          archived: { safe: true, title: 'Correct. This one was real.', text: 'It matched your real order and amount, and asked you to do nothing.' },
          falsealarm: { safe: false, title: 'False alarm. This one was genuine.', text: 'Not every email is a trap. This one matched an order you had just placed.' },
        },
        flagsTitle: 'Why this one was genuine',
        flags: [
          'It came from swiggy.in and matched an order you actually placed, for the exact amount you paid.',
          'There were no links asking you to log in or pay.',
          'For help, it sent you to the app itself, not to a link.',
        ],
      },
      {
        title: 'The password expiry notice',
        setup: 'Your college email address ends in @yourcollege.edu.in.',
        notify: { app: 'Mail', from: 'College IT Helpdesk', preview: 'Your password expires today' },
        start: 'inbox',
        steps: {
          inbox: {
            view: 'inbox',
            items: [{ from: 'College IT Helpdesk', subject: 'Your password expires today', preview: 'To avoid losing access to email and the student portal…', go: 'mail' }],
          },
          mail: {
            view: 'mail', from: 'College IT Helpdesk', address: 'it-helpdesk@yourcollege-edu.in',
            subject: 'Your password expires today',
            body: [
              'Hello Student,',
              'Your Microsoft 365 password expires today. To avoid losing access to email, results and the student portal, keep your current password using the link below.',
              'IT Helpdesk',
            ],
            link: { text: 'Keep my current password', url: 'http://yourcollege-edu.in.login-verify.co/m365', go: 'site' },
            actions: [
              { label: 'Report phishing', end: 'reported' },
              { label: 'Delete', end: 'reported' },
            ],
          },
          site: {
            view: 'browser', url: 'yourcollege-edu.in.login-verify.co/m365', heading: 'Sign in — Microsoft 365',
            note: 'Confirm your current password to keep it.',
            fields: ['College email', 'Password'],
            submit: { label: 'Sign in', end: 'scammed' },
            close: { label: 'Close tab', end: 'closed' },
          },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. You caught the lookalike.', text: 'Telling your real IT team helps them warn everyone else who got it.' },
          closed: { safe: true, title: 'Safe, but that was close.', text: 'You left before signing in. The address bar gave it away.' },
          scammed: { safe: false, title: 'Your college account was taken over.', text: 'The attacker logged in, downloaded your documents and sent the same email to all your classmates from your account.' },
        },
        flags: [
          'yourcollege-edu.in (with a hyphen) is not yourcollege.edu.in.',
          'The real website is the part just before the first single slash: login-verify.co. Everything before it is decoration.',
          '"Expires today" is pressure. Real IT teams warn you days ahead and send you to the usual login page.',
          'You can never "keep" a password by typing it into a link.',
        ],
      },
    ],
  },

{
    id: 2,
    title: 'Passwords & Accounts',
    subtitle: 'Sign up, save passwords and secure your accounts on your phone, then see what happens weeks later.',
    icon: '🔐',
    device: 'phone',
    difficulty: 'easy',
    tip: 'Never type a password you really use into any game or website you do not trust, including this one.',
    badge: { id: 'locksmith', icon: '🔐', name: 'Locksmith' },
    scenarios: [
      {
        title: 'Create a password',
        setup: 'You are signing up for a new shopping app. Type a password the way you normally would, but make up a new one. Do not use a password you actually use.',
        start: 'signup',
        steps: {
          signup: { view: 'signup', app: 'ShopKart', email: 'you@gmail.com', strongEnd: 'strong', weakEnd: 'weak' },
        },
        outcomes: {
          strong: { safe: true, title: 'Strong password.', text: 'Length does most of the work. Three or four random words, or a password manager, gets you here easily.' },
          weak: { safe: false, loss: 6500, title: 'Cracked after a data breach.', text: "Months later, ShopKart was hacked. Attackers cracked weak passwords from the stolen list and used your saved card." },
        },
        flags: [
          'Length beats complexity: "mango tractor purple river" is far stronger than "P@ssw0rd1".',
          'Names, birthdays, cricket players, "123" and "@" for "a" are the first things attackers try.',
          'A password manager can create and remember a different strong password for every site.',
        ],
      },
      {
        title: 'The autofill shortcut',
        setup: 'You are signing up for a food delivery app. Your phone offers to fill in a password for you.',
        start: 'fill',
        steps: {
          fill: {
            view: 'dialog', app: 'QuickBite',
            behind: [{ t: 'h', text: 'Create account' }, { t: 'field', label: 'Email', value: 'you@gmail.com' }, { t: 'field', label: 'Password', value: '' }],
            title: 'Choose a password',
            text: 'Saved passwords on this phone',
            actions: [
              { label: 'Use my Gmail password again (saved for accounts.google.com)', end: 'reused' },
              { label: 'Use suggested strong password: Tq7#mVx2!pLr9wKe', end: 'unique' },
              { label: 'Type my usual password with a 1 at the end', end: 'variant' },
            ],
          },
        },
        outcomes: {
          unique: { safe: true, title: 'Safe. A unique password.', text: 'Your phone remembers it, so you do not have to. If QuickBite is ever hacked, nothing else is affected.' },
          reused: { safe: false, title: 'Your Gmail was taken over.', text: 'A year later QuickBite leaked its user list. Attackers tried the same email and password on Gmail, and it worked. From Gmail they reset your other accounts.' },
          variant: { safe: false, title: 'Your other accounts were taken over.', text: 'Attackers try common tweaks like adding 1, 123 or ! automatically. A small change to an old password is the same as reusing it.' },
        },
        flags: [
          'Reusing a password means one leaked site unlocks all of them.',
          'Adding a number to your usual password does not make it new.',
          'Letting your phone or a password manager suggest and save passwords is both easier and safer.',
        ],
      },
      {
        title: 'Two-step verification',
        setup: 'Instagram shows you a prompt while you are posting a story.',
        start: 'prompt',
        steps: {
          prompt: {
            view: 'app', app: 'Instagram', title: 'Security',
            blocks: [
              { t: 'card', text: 'Two-factor authentication is off', sub: 'Add a second step, like a code from an authenticator app, whenever someone logs in from a new device.' },
              { t: 'muted', text: 'Takes about 1 minute.' },
            ],
            actions: [
              { label: 'Turn it on', go: 'later-safe' },
              { label: 'Not now', go: 'later-hacked' },
            ],
          },
          'later-safe': {
            view: 'app', app: 'Instagram', title: 'Notifications',
            blocks: [
              { t: 'note', text: 'Three weeks later…' },
              { t: 'card', text: 'Login attempt blocked', sub: 'Someone tried to log in from Lagos, Nigeria with your correct password but could not enter the code.' },
            ],
            actions: [{ label: 'Change my password', end: 'protected' }],
          },
          'later-hacked': {
            view: 'app', app: 'Instagram', title: 'Notifications',
            blocks: [
              { t: 'note', text: 'Three weeks later…' },
              { t: 'card', text: 'Your password was changed', sub: "If this wasn't you, secure your account." },
            ],
            actions: [{ label: 'Try to log in', end: 'lost' }],
          },
        },
        outcomes: {
          protected: { safe: true, title: 'Two-step saved you.', text: 'Your password had leaked, but without the second code it was useless to the attacker.' },
          lost: { safe: false, title: 'Your account was stolen.', text: 'Your password leaked from another site. With nothing else in the way, the attacker changed your email and password and started messaging your friends for money.' },
        },
        flags: [
          'Passwords leak all the time, often from sites you forgot you signed up for.',
          'Two-step verification stops most account takeovers, even when the password is known.',
          'An authenticator app is safer than SMS codes, but either is far better than nothing.',
        ],
      },
      {
        title: 'The breach warning',
        setup: 'Chrome sends you a notification while you are shopping online.',
        notify: { app: 'Chrome', from: 'Password Checkup', preview: '1 compromised password found' },
        start: 'check',
        steps: {
          check: {
            view: 'app', app: 'Chrome', title: 'Password Checkup',
            blocks: [
              { t: 'card', text: 'Your password for flipkart.com appeared in a data breach', sub: 'You also use this password on 3 other sites: gmail.com, instagram.com, paytm.com' },
              { t: 'muted', text: 'Change it now to keep your accounts safe.' },
            ],
            actions: [
              { label: 'Change it on all 4 sites now', end: 'all' },
              { label: 'Change it only on Flipkart', end: 'one' },
              { label: "Ignore it, I'll do it later", end: 'ignored' },
            ],
          },
        },
        outcomes: {
          all: { safe: true, title: 'Safe. You closed every door.', text: 'Changing it everywhere it was used is the only fix that works. Use a different password for each one.' },
          one: { safe: false, loss: 9000, title: 'Paytm was emptied.', text: 'Attackers took the leaked password and tried it on popular sites. Flipkart was fixed, but Paytm still had the same one.' },
          ignored: { safe: false, loss: 9000, title: '"Later" was too late.', text: 'Leaked password lists are tested by bots within hours. Your Paytm wallet was emptied that night.' },
        },
        flags: [
          'A breach alert is a real warning. Act on it the same day.',
          'If the password was reused, every site using it is at risk, not just the breached one.',
          'You can check if your email was in a breach at haveibeenpwned.com.',
        ],
      },
    ],
  },


  {
    id: 3,
    title: 'Calls & Tricksters',
    subtitle: 'Callers and texters pretend to be IT, your bank, a friend or the electricity board. Keep your guard up.',
    icon: '🎭',
    device: 'phone',
    difficulty: 'medium',
    tip: 'When in doubt, hang up and contact the person or company yourself, using a number you already know.',
    badge: { id: 'call-screener', icon: '🎭', name: 'Call Screener' },
    scenarios: [
      {
        title: 'The IT support call',
        setup: 'You are in the library. Your phone rings.',
        start: 'ring',
        steps: {
          ring: { view: 'ring', name: 'College IT Support', number: '+91 80 4718 2290', accept: { go: 'call1' }, decline: { end: 'declined' } },
          call1: {
            view: 'call', name: 'College IT Support',
            lines: [
              "Hi, this is Alex from the college IT team. We've detected suspicious logins on your student account.",
              'I need to verify it is really you. Can you tell me your username and current password?',
            ],
            actions: [
              { label: 'Tell him your username and password', say: 'Okay, my username is…', end: 'gave' },
              { label: 'Ask which logins he means', say: 'Which logins are you talking about?', go: 'call2' },
              { label: "Say you'll call the IT helpdesk back yourself", say: "I'll call the helpdesk number on the college website myself.", end: 'callback' },
            ],
          },
          call2: {
            view: 'call',
            lines: [
              'From another city, 3 minutes ago. Your account will be locked in 5 minutes.',
              "Fine, no password. Just read me the 6-digit code we've sent to your phone so I can confirm it's you.",
            ],
            actions: [
              { label: 'Read out the code', say: "It's 731…", end: 'gave' },
              { label: 'Hang up and call the helpdesk yourself', end: 'callback' },
            ],
          },
        },
        outcomes: {
          declined: { safe: true, title: 'Safe.', text: 'If it were really IT, they would email you or you could contact them yourself.' },
          callback: { safe: true, title: 'Safe. You verified it yourself.', text: 'The real helpdesk had not called anyone. They reset your password just in case.' },
          gave: { safe: false, title: 'Your student account was taken over.', text: 'The "code" was the login code for your account. The attacker now has your email, your files and your results portal.' },
        },
        flags: [
          'Real IT staff never need your password or login code.',
          'The deadline ("locked in 5 minutes") was there to stop you from thinking.',
          'When he did not get the password, he asked for something else. That is a classic tactic.',
        ],
      },
      {
        title: 'The card blocked call',
        setup: 'You are on the bus home. Your phone shows an incoming call.',
        start: 'ring',
        steps: {
          ring: { view: 'ring', name: 'Bank Card Dept', number: '+91 92114 60873', accept: { go: 'call1' }, decline: { end: 'declined' } },
          call1: {
            view: 'call', name: 'Bank Card Dept',
            lines: [
              'Sir, I am calling from your bank. Your debit card has been blocked due to pending KYC.',
              'To reactivate, please confirm your 16-digit card number, expiry and CVV.',
            ],
            actions: [
              { label: 'Read out your card details', say: 'Okay, the number is 4…', go: 'call2' },
              { label: 'Hang up and call the number on the back of your card', end: 'safe' },
            ],
          },
          call2: {
            view: 'call',
            lines: ['Thank you sir. Now you will receive one OTP for verification. Please read it to complete reactivation.'],
            actions: [
              { label: 'Read out the OTP', say: 'The OTP is 4…', end: 'scammed' },
              { label: 'Refuse and hang up', end: 'half' },
            ],
          },
        },
        outcomes: {
          declined: { safe: true, title: 'Safe.', text: 'If your card really had a problem, you would see it in your bank app.' },
          safe: { safe: true, title: 'Safe. You called the real bank.', text: 'Your card was never blocked. The bank flagged the number that called you.' },
          half: { safe: false, title: 'Your card details are out there.', text: 'You stopped before the OTP, but they have your card number and CVV. Block the card in your bank app right now and order a new one.' },
          scammed: { safe: false, loss: 18000, title: 'You lost ₹18,000.', text: 'The OTP approved an online payment the scammer was making with your card details.' },
        },
        flags: [
          'Banks never ask for your full card number, CVV or OTP over a call.',
          'Caller ID names can be faked. "Bank Card Dept" is just a label.',
          'The OTP SMS itself says what it is for. Read it before reading it out.',
        ],
      },
      {
        title: '"Hi, this is my new number"',
        setup: 'It is exam week. A WhatsApp message arrives from an unknown number.',
        notify: { app: 'WhatsApp', from: '+91 77380 55129', preview: "Hi bro, it's Rohan. Phone fell in water 😭" },
        start: 'chat',
        steps: {
          chat: {
            view: 'chat', app: 'WhatsApp', contact: '+91 77380 55129', sub: 'Not in your contacts',
            messages: [
              { from: 'them', text: "Hi bro, it's Rohan. Phone fell in water 😭 this is my new number" },
              { from: 'them', text: 'Can you send ₹8,000 to rohan.fees@ybl? Exam fee deadline is today and my account is blocked. Will return tomorrow pakka 🙏' },
            ],
            actions: [
              { label: 'Send ₹8,000', say: 'Sent! Good luck with the exam.', end: 'scammed' },
              { label: 'Ask a question only Rohan would know', say: 'Haha which teacher did we bunk class for last week?', go: 'push' },
              { label: 'Call Rohan on his old number', end: 'verified' },
            ],
          },
          push: {
            view: 'chat',
            messages: [{ from: 'them', text: 'Bro no time for games 😤 deadline in 1 hour please just send' }],
            actions: [
              { label: 'Send ₹8,000', say: 'Okay okay, sent.', end: 'scammed' },
              { label: 'Call Rohan on his old number', end: 'verified' },
            ],
          },
        },
        outcomes: {
          verified: { safe: true, title: 'Safe. You checked with the real Rohan.', text: 'His phone was fine. Someone had copied his name and photo from Instagram.' },
          scammed: { safe: false, loss: 8000, title: 'You lost ₹8,000.', text: 'The real Rohan never sent that message. The scammer found your friendship on Instagram.' },
        },
        flags: [
          '"New number" plus an urgent money request is a very common script.',
          'They dodged a simple question and pushed harder. A real friend would answer.',
          "One call to the old number takes 10 seconds and settles it.",
        ],
      },
      {
        title: 'The electricity bill SMS',
        setup: 'It is 7 PM. An SMS arrives.',
        notify: { app: 'Messages', from: '+91 98761 22045', preview: 'Dear Consumer, your electricity power will be disconnected tonight…' },
        start: 'sms',
        steps: {
          sms: {
            view: 'chat', app: 'Messages', contact: '+91 98761 22045', sub: 'Not in your contacts',
            messages: [
              { from: 'them', text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately contact our electricity officer 9876122045. Thank you.' },
            ],
            actions: [
              { label: 'Call the officer', go: 'ring' },
              { label: "Check the bill in the electricity board's official app", end: 'checked' },
              { label: 'Delete and report as spam', end: 'checked' },
            ],
          },
          ring: {
            view: 'call', name: 'Electricity Officer', sub: '+91 98761 22045',
            lines: [
              'Yes, your bill is not updated in our system. I will update it for you right now.',
              'Please install the AnyDesk app from Play Store and tell me the 9-digit code it shows.',
            ],
            actions: [
              { label: 'Install AnyDesk and read out the code', say: 'Okay, the code is 482 118 903.', go: 'call2' },
              { label: 'Hang up and check the bill yourself', end: 'checked' },
            ],
          },
          call2: {
            view: 'call',
            lines: ['Good. Now just pay a ₹10 token amount from your bank app so the system updates. I am watching for confirmation.'],
            actions: [
              { label: 'Open your bank app and pay ₹10', say: 'Okay, paying now.', end: 'scammed' },
              { label: 'Hang up and uninstall AnyDesk', end: 'half' },
            ],
          },
        },
        outcomes: {
          checked: { safe: true, title: 'Safe. Your bill was already paid.', text: 'Electricity boards do not send disconnection warnings from personal mobile numbers.' },
          half: { safe: false, title: 'Close call.', text: 'He could see your screen for a while. Uninstalling AnyDesk was right. Change your bank and UPI PINs in case he saw them.' },
          scammed: { safe: false, loss: 31000, title: 'You lost ₹31,000.', text: 'AnyDesk let him watch your screen as you typed your bank PIN. The "₹10" was cover. He then made his own transfers.' },
        },
        flags: [
          'Utility companies do not send SMS from personal 10-digit numbers or ask you to call an "officer".',
          'Screen-sharing apps like AnyDesk, TeamViewer or QuickSupport give a stranger a view of everything you type.',
          'A "small token payment" is how they watch you enter your PIN.',
        ],
      },
    ],
  },


  {
    id: 4,
    title: 'Money & UPI Scams',
    subtitle: 'KYC links, OLX buyers, task jobs, "digital arrest" and OTP tricks, the scams emptying Indian bank accounts today.',
    icon: '💸',
    device: 'phone',
    difficulty: 'medium',
    tip: 'Entering a UPI PIN always sends money. You never need it to receive any.',
    badge: { id: 'scam-proof', icon: '💸', name: 'Scam Proof' },
    scenarios: [
      {
        title: 'The KYC update SMS',
        setup: "It's a normal afternoon. Your phone buzzes with a new message.",
        notify: { app: 'Messages', from: '+91 98301 44721', preview: 'Dear Customer, your SBI YONO account will be BLOCKED today…' },
        start: 'sms',
        steps: {
          sms: {
            view: 'chat', app: 'Messages', contact: '+91 98301 44721', sub: 'Not in your contacts',
            messages: [
              { from: 'them', text: 'Dear Customer, your SBI YONO account will be BLOCKED today due to pending PAN/KYC update. Update immediately:', link: { url: 'http://sbi-yono-kyc.in/update', go: 'site' } },
            ],
            actions: [
              { label: 'Reply: "Is this really from SBI?"', say: 'Is this really from SBI?', go: 'reply' },
              { label: 'Delete and report as spam', end: 'reported' },
            ],
          },
          reply: {
            view: 'chat',
            messages: [
              { from: 'them', text: 'Yes sir, official SBI KYC department. Kindly update within 2 hours or account will be permanently blocked and balance frozen.', link: { url: 'http://sbi-yono-kyc.in/update', go: 'site' } },
            ],
            actions: [{ label: 'Delete and report as spam', end: 'reported' }],
          },
          site: {
            view: 'browser', url: 'sbi-yono-kyc.in/update', heading: 'YONO KYC Update',
            note: 'Your KYC is pending. Complete it now to avoid account suspension.',
            fields: ['Username', 'Password', 'Registered mobile number', 'OTP'],
            submit: { label: 'Submit KYC', end: 'scammed' },
            close: { label: 'Close tab', end: 'closed' },
          },
        },
        outcomes: {
          reported: { safe: true, title: "Safe. You didn't take the bait.", text: 'Deleting and reporting is exactly right. Your bank will never ask you to update KYC through an SMS link.' },
          closed: { safe: true, title: 'Safe, but that was close.', text: 'You backed out before typing anything. Next time, skip the link entirely, since some fake sites try to install malware on your phone.' },
          scammed: { safe: false, loss: 24500, title: 'Your account was emptied.', text: 'The page sent your username, password and OTP straight to the scammer. They logged in and moved the money out within minutes.' },
        },
        flags: [
          'It came from an ordinary 10-digit mobile number. Banks send SMS from sender IDs like "AD-SBIBNK".',
          'A threat plus a deadline ("BLOCKED today") is meant to make you panic and act fast.',
          "The link is sbi-yono-kyc.in. SBI's real website is onlinesbi.sbi.",
          'No bank asks for your password and OTP on a page you opened from an SMS.',
        ],
      },
      {
        title: 'The OLX buyer',
        setup: 'You listed your old study table on OLX for ₹4,500. A buyer messages you on WhatsApp.',
        notify: { app: 'WhatsApp', from: 'Rajesh (OLX buyer)', preview: 'Hello, is the study table still available?' },
        start: 'chat',
        steps: {
          chat: {
            view: 'chat', app: 'WhatsApp', contact: 'Rajesh (OLX buyer)', sub: '+91 63920 18834',
            messages: [
              { from: 'them', text: 'Hello, is the study table still available?' },
              { from: 'them', text: "I will take it for ₹4,500, no bargaining. I'm in the Army, posted at Pathankot, so my friend will collect it." },
              { from: 'them', text: "I'm sending payment on UPI first. Just approve the request I send 🙏" },
            ],
            actions: [
              { label: 'Open the UPI app', go: 'upi' },
              { label: 'Ask him to send the money directly instead', say: 'Can you just send it directly instead of a request?', go: 'push' },
              { label: 'Block and report the chat', end: 'reported' },
            ],
          },
          push: {
            view: 'chat',
            messages: [{ from: 'them', text: 'Bhai army account se direct nahi hota, request se hi aata hai. Approve fast please, I am going on duty.' }],
            actions: [
              { label: 'Open the UPI app', go: 'upi' },
              { label: 'Block and report the chat', end: 'reported' },
            ],
          },
          upi: {
            view: 'upi', label: 'Collect request', payee: 'Rajesh Kumar', vpa: 'rajesh.army4821@okaxis', amount: 4500, note: 'Payment for study table',
            pay: { go: 'pin' }, decline: { end: 'declined' },
          },
          pin: { view: 'pin', payee: 'Rajesh Kumar', amount: 4500, done: { end: 'scammed' }, cancel: { end: 'cancelled' } },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. You spotted the trick.', text: 'A genuine buyer can send money straight to your UPI ID. Nobody needs you to approve anything to pay you.' },
          declined: { safe: true, title: 'Safe. You declined the request.', text: 'A collect request is a request for you to pay. Declining it was the right call.' },
          cancelled: { safe: true, title: 'Safe, at the very last second.', text: 'You backed out at the PIN screen. Remember: if the app asks for your PIN, money is about to leave your account.' },
          scammed: { safe: false, loss: 4500, title: 'You paid the "buyer".', text: 'Entering your UPI PIN sent ₹4,500 to the scammer. The table is still yours, but the money is gone.' },
        },
        flags: [
          'You never need to enter a UPI PIN to receive money. Entering a PIN always means paying.',
          'A "collect request" asks you to pay, whatever the note on it says.',
          '"I\'m in the Army and can\'t come in person" is one of the most common marketplace scam stories.',
          'He kept rushing you ("approve fast, going on duty").',
        ],
      },
      {
        title: 'The part-time job offer',
        setup: 'You get a WhatsApp message from a number you have never seen before.',
        notify: { app: 'WhatsApp', from: '+44 7700 912604', preview: "Hello! 😊 I'm Priya from DigitalBoost Media…" },
        start: 'chat',
        steps: {
          chat: {
            view: 'chat', app: 'WhatsApp', contact: '+44 7700 912604', sub: '~Priya HR · Not in your contacts',
            messages: [
              { from: 'them', text: "Hello! 😊 I'm Priya from DigitalBoost Media." },
              { from: 'them', text: 'We are hiring for part-time work from home. Just like YouTube videos and earn ₹150 per like. ₹3,000–₹8,000 daily!' },
              { from: 'them', text: 'Interested?' },
            ],
            actions: [
              { label: 'Yes, interested!', say: 'Yes, interested!', go: 'task1' },
              { label: 'Who gave you my number?', say: 'Who gave you my number?', go: 'who' },
              { label: 'Block and report', end: 'reported' },
            ],
          },
          who: {
            view: 'chat',
            messages: [{ from: 'them', text: 'We got it from a job portal database 😊 Many students are earning daily. Want to try one free task first?' }],
            actions: [
              { label: 'Okay, one free task', say: 'Okay, one free task.', go: 'task1' },
              { label: 'Block and report', end: 'reported' },
            ],
          },
          task1: {
            view: 'chat',
            messages: [
              { from: 'them', text: 'Great! Task 1: like these 3 videos and send me the screenshots.' },
              { from: 'system', text: 'You liked 3 videos and sent the screenshots.' },
              { from: 'them', text: '✅ Well done! ₹450 sent to your UPI. Please check your account.' },
              { from: 'them', text: 'Now join our Telegram VIP group. Premium task: deposit ₹1,500 and get ₹1,950 back in 30 minutes.' },
            ],
            actions: [
              { label: 'Pay ₹1,500 for the premium task', say: 'Okay, paid ₹1,500.', go: 'task2' },
              { label: 'Say "I don\'t want to pay anything" and leave', say: "I don't want to pay anything.", end: 'left' },
            ],
          },
          task2: {
            view: 'chat',
            messages: [
              { from: 'them', text: 'Congratulations! 🎉 Your task balance is now ₹1,950.' },
              { from: 'them', text: 'To withdraw, complete one final merchant task: deposit ₹10,000. Total return ₹14,800!' },
              { from: 'them', text: 'Hurry, this slot closes in 15 minutes.' },
            ],
            actions: [
              { label: 'Pay ₹10,000 to unlock the withdrawal', say: 'Paid ₹10,000. Please release my money.', end: 'scammed' },
              { label: 'Stop and report it on cybercrime.gov.in', end: 'stopped' },
            ],
          },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. You ignored easy money.', text: 'Real employers do not recruit through random WhatsApp messages from foreign numbers.' },
          left: { safe: true, title: 'Safe. You walked away in time.', text: 'You kept the ₹450 and lost nothing. That small payment was bait to make the next step feel trustworthy.' },
          stopped: { safe: false, loss: 1500, title: 'You stopped, but ₹1,500 is gone.', text: 'The "task balance" was never real money. Stopping before the bigger deposit saved you from losing much more.' },
          scammed: { safe: false, loss: 11500, title: 'You lost ₹11,500.', text: 'There is no withdrawal. Each payment unlocks a new "final task" until you stop paying.' },
        },
        flags: [
          'An unknown international number offering easy money for liking videos.',
          'They paid a small amount first to win your trust. This is how the trap works.',
          'Any job that asks you to deposit money is a scam.',
          '"Pay more to withdraw" means your money is already gone.',
        ],
      },
      {
        title: 'The "digital arrest" call',
        setup: "You're at home in the evening. An unknown number is calling.",
        start: 'ring',
        steps: {
          ring: { view: 'ring', name: 'Mumbai Cyber Crime', number: '+91 89206 31457', accept: { go: 'call1' }, decline: { end: 'declined' } },
          call1: {
            view: 'call', name: 'Mumbai Cyber Crime',
            lines: [
              'This is Inspector Vikram Sharma, Mumbai Cyber Crime.',
              'A FedEx parcel booked with your Aadhaar was seized at Mumbai airport. It had 5 fake passports and drugs inside.',
              'A case is registered against you. Switch to video call now for your statement.',
            ],
            actions: [
              { label: "That parcel isn't mine! What do I do?", say: "That parcel isn't mine! What do I do?", go: 'call2' },
              { label: 'Ask for his badge number', say: 'What is your badge number?', go: 'badge' },
              { label: 'Hang up and go to the local police station myself', end: 'hungup' },
            ],
          },
          badge: {
            view: 'call',
            lines: [
              'Badge number MH-4471. You can verify later. Right now you are wasting time.',
              'If you do not cooperate, a team will come for physical arrest within one hour.',
            ],
            actions: [
              { label: "Okay, okay. I'll cooperate.", say: "Okay, I'll cooperate.", go: 'call2' },
              { label: 'Hang up and call 1930', end: 'hungup' },
            ],
          },
          call2: {
            view: 'call',
            lines: [
              'You are now under digital arrest. Stay on video call. Do not tell your family, it will affect the investigation.',
              'Transfer your savings to the RBI verification account I share. It will be refunded within 24 hours after checking.',
            ],
            actions: [
              { label: 'Transfer ₹39,500 to the verification account', say: 'Okay sir, transferring now.', end: 'scammed' },
              { label: 'Hang up and tell my family', end: 'hungup' },
            ],
          },
        },
        outcomes: {
          declined: { safe: true, title: 'Safe. You ignored an unknown caller.', text: 'Real police send written notices or come in person. Skipping a call that claims to be police costs you nothing.' },
          hungup: { safe: true, title: 'Safe. You broke the spell.', text: 'Hanging up and talking to someone you trust is the best defence. The whole scam depends on keeping you scared and alone.' },
          scammed: { safe: false, loss: 39500, title: 'You lost ₹39,500.', text: 'There is no "RBI verification account". The money went to a mule account and was moved out within minutes.' },
        },
        flags: [
          'Police, CBI or customs never arrest anyone over a phone or video call. "Digital arrest" does not exist in Indian law.',
          'Asking you to hide it from your family is meant to stop anyone from warning you.',
          'Threats of instant arrest are there to stop you from thinking clearly.',
          'No government agency asks you to move money to a "verification account".',
        ],
      },
      {
        title: 'The OTP "sent by mistake"',
        setup: 'You just opened your bank app and tapped "Log in". An OTP is on its way.',
        notify: { app: 'Messages', from: 'AX-HDFCBK', preview: '482913 is your OTP to log in to HDFC Bank NetBanking…' },
        start: 'otp',
        steps: {
          otp: {
            view: 'chat', app: 'Messages', contact: 'AX-HDFCBK', sub: 'Bank sender ID',
            messages: [{ from: 'them', text: '482913 is your OTP to log in to HDFC Bank NetBanking. Do not share this OTP with anyone, including bank staff. -HDFC Bank' }],
            actions: [{ label: 'Enter the OTP in your bank app', go: 'scam' }],
          },
          scam: {
            view: 'chat', app: 'Messages', contact: '+91 70421 88305', sub: 'Not in your contacts',
            messages: [
              { from: 'system', text: "You're logged in. A minute later, another message arrives." },
              { from: 'them', text: 'Sir, I am from HDFC Bank head office. A transaction of ₹19,999 has been started from your account by mistake.' },
              { from: 'them', text: 'We have sent one OTP to cancel it. Kindly share the OTP quickly, otherwise the amount will be debited.' },
            ],
            actions: [
              { label: 'Reply with the OTP', say: '482913', end: 'scammed' },
              { label: 'Ask "Why do you need my OTP?"', say: 'Why do you need my OTP?', go: 'push' },
              { label: 'Ignore it and call the number on the back of my card', end: 'safe' },
            ],
          },
          push: {
            view: 'chat',
            messages: [{ from: 'them', text: 'Sir, it is only for cancellation, bank system requires. Only 2 minutes left, please hurry.' }],
            actions: [
              { label: 'Reply with the OTP', say: '482913', end: 'scammed' },
              { label: 'Ignore it and call the number on the back of my card', end: 'safe' },
            ],
          },
        },
        outcomes: {
          safe: { safe: true, title: 'Safe. You kept your OTP to yourself.', text: 'Calling the official number on your card is the right way to check anything about your account.' },
          scammed: { safe: false, loss: 19999, title: 'You lost ₹19,999.', text: 'There was no mistaken transaction. The scammer used your OTP to approve a payment of their own.' },
        },
        flags: [
          'The real OTP came from a bank sender ID (AX-HDFCBK). The follow-up came from an ordinary mobile number.',
          'The OTP message itself says: do not share it with anyone, including bank staff.',
          'Banks never need your OTP to "cancel" a transaction.',
          '"Only 2 minutes left" is pressure, not procedure.',
        ],
      },
    ],
  },


  {
    id: 5,
    title: 'Fake Apps & Permissions',
    subtitle: 'An APK on WhatsApp, an instant loan app, a battery booster. Decide what gets onto your phone and what it can touch.',
    icon: '📲',
    device: 'phone',
    difficulty: 'medium',
    tip: 'Ask yourself: why would this app need this permission? A loan app does not need your photos.',
    badge: { id: 'app-inspector', icon: '📲', name: 'App Inspector' },
    scenarios: [
      {
        title: 'The rewards APK',
        setup: 'A WhatsApp message arrives from an unknown number with a file attached.',
        notify: { app: 'WhatsApp', from: '+91 83090 11426', preview: 'Your SBI reward points ₹7,250 will expire today…' },
        start: 'chat',
        steps: {
          chat: {
            view: 'chat', app: 'WhatsApp', contact: '+91 83090 11426', sub: 'Not in your contacts',
            messages: [
              { from: 'them', text: 'Dear customer, your SBI reward points worth ₹7,250 will expire today. Install the SBI Rewards app below to redeem them into your account.' },
              { from: 'them', file: { name: 'SBI_Rewards.apk', size: '6.1 MB', go: 'install' } },
            ],
            actions: [
              { label: 'Block and report', end: 'reported' },
              { label: 'Check rewards in the official bank app instead', end: 'reported' },
            ],
          },
          install: {
            view: 'dialog', app: 'WhatsApp',
            behind: [{ t: 'h', text: 'SBI_Rewards.apk' }, { t: 'muted', text: '6.1 MB · Android app' }],
            title: 'Install unknown app?',
            text: 'For your security, your phone is not allowed to install unknown apps from WhatsApp.',
            actions: [
              { label: 'Settings → Allow from this source', go: 'perm' },
              { label: 'Cancel', end: 'cancelled' },
            ],
          },
          perm: {
            view: 'dialog', app: 'SBI Rewards',
            behind: [{ t: 'h', text: 'SBI Rewards' }, { t: 'p', text: 'Redeem ₹7,250 in 2 easy steps!' }],
            title: 'Allow SBI Rewards to send and view SMS messages?',
            text: 'Next it will ask to display over other apps.',
            actions: [
              { label: 'Allow', end: 'scammed' },
              { label: "Don't allow", end: 'cancelled' },
            ],
          },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe. Nothing installed.', text: 'Banks never send apps as WhatsApp files. Their apps are only on the Play Store or App Store.' },
          cancelled: { safe: true, title: 'Safe, but delete that file.', text: 'You stopped before the app got control. Delete SBI_Rewards.apk from your Downloads.' },
          scammed: { safe: false, loss: 42000, title: 'You lost ₹42,000.', text: 'The fake app forwarded every bank OTP to the scammer and hid the SMS from you. You found out from your statement.' },
        },
        flags: [
          'Banks never send apps as WhatsApp files. A .apk file from a chat is almost always malware.',
          'Your phone blocks unknown apps by default for a reason. Changing that setting is the real danger moment.',
          'A rewards app has no reason to read your SMS.',
        ],
      },
      {
        title: 'The instant loan app',
        setup: 'You need ₹5,000 for a trip. An ad says "Instant loan in 5 minutes, no CIBIL check".',
        start: 'store',
        steps: {
          store: {
            view: 'app', app: 'Play Store', title: 'CashNow — Instant Loan',
            blocks: [
              { t: 'card', text: 'CashNow — Instant Loan', sub: 'QuickFin Tech · 4.6★ · 1L+ downloads' },
              { t: 'p', text: 'Get ₹5,000 to ₹50,000 in 5 minutes! No documents. No CIBIL check. 100% online.' },
              { t: 'muted', text: 'Recent review ★☆☆☆☆ "They called my parents and sent edited photos of me to my contacts when I was 1 day late."' },
            ],
            actions: [
              { label: 'Install', go: 'contacts' },
              { label: 'Check whether the lender is RBI-registered first', end: 'checked' },
            ],
          },
          contacts: {
            view: 'dialog', app: 'CashNow',
            behind: [{ t: 'h', text: 'CashNow' }, { t: 'p', text: 'Get your loan in 3 steps' }],
            title: 'Allow CashNow to access your contacts?',
            text: 'Required to verify your identity.',
            actions: [
              { label: 'Allow', go: 'photos' },
              { label: "Don't allow", end: 'denied' },
            ],
          },
          photos: {
            view: 'dialog', app: 'CashNow',
            behind: [{ t: 'h', text: 'CashNow' }, { t: 'p', text: 'Almost done!' }],
            title: 'Allow CashNow to access photos and videos on this device?',
            text: 'Required for KYC.',
            actions: [
              { label: 'Allow', end: 'harassed' },
              { label: "Don't allow", end: 'denied' },
            ],
          },
        },
        outcomes: {
          checked: { safe: true, title: 'Safe. It was not registered.', text: 'CashNow was not linked to any RBI-registered bank or NBFC. Legit lenders are listed on the RBI website.' },
          denied: { safe: true, title: 'Safe. The app refused to work.', text: 'It would not give a loan without your contacts. That alone tells you what it was really after. Uninstall it.' },
          harassed: { safe: false, loss: 9000, title: 'The loan became a nightmare.', text: 'You got ₹3,200 after "fees", were asked to repay ₹12,000 in 7 days, and then the app messaged your contacts and edited photos of you when you were late.' },
        },
        flags: [
          '"No documents, no CIBIL check" is how illegal lenders advertise.',
          'A loan app has no reason to read your contacts or photos. They are used for blackmail.',
          'Read the low-star reviews, not just the rating. Fake ratings are cheap.',
          'Legit lenders are RBI-registered banks or NBFCs, and the app names its lending partner.',
        ],
      },
      {
        title: 'The battery booster',
        setup: 'Your battery drains fast. You install "Battery Saver Pro", which promises double battery life.',
        start: 'access',
        steps: {
          access: {
            view: 'dialog', app: 'Battery Saver Pro',
            behind: [{ t: 'h', text: 'Battery Saver Pro' }, { t: 'p', text: 'Enable Smart Boost to save 2x battery!' }],
            title: 'Allow Battery Saver Pro to have full control of your device?',
            text: 'It will be able to view and control the screen, and view and perform actions in any app.',
            actions: [
              { label: 'Allow', go: 'later' },
              { label: "Don't allow", end: 'denied' },
              { label: 'Uninstall the app', end: 'denied' },
            ],
          },
          later: {
            view: 'app', app: 'Messages', title: 'Two days later',
            blocks: [
              { t: 'note', text: 'Two days later, at 3:12 AM…' },
              { t: 'card', text: 'AX-BNKALT', sub: 'Rs 26,800.00 transferred via UPI to merchant QPAY8812. Not you? Call your bank.' },
            ],
            actions: [{ label: 'Check what happened', end: 'scammed' }],
          },
        },
        outcomes: {
          denied: { safe: true, title: 'Safe. No app needs that.', text: 'Your phone already has battery saving built in, under Settings → Battery.' },
          scammed: { safe: false, loss: 26800, title: 'You lost ₹26,800.', text: 'With full control (Accessibility), the app opened your UPI app at night, entered the PIN it had watched you type, and tapped Pay by itself.' },
        },
        flags: [
          '"Full control of your device" (Accessibility) lets an app read your screen and tap buttons for you.',
          'Only apps for people with disabilities or real device management ever need it.',
          'Battery, cleaner and booster apps are a favourite disguise for malware.',
        ],
      },
    ],
  },

  {
    id: 6,
    title: 'Out & About',
    subtitle: 'Free Wi-Fi at the station, a cashback QR, a public charging point. Stay safe away from home.',
    icon: '📍',
    device: 'phone',
    difficulty: 'medium',
    tip: 'Free things in public places are where scammers wait.',
    badge: { id: 'street-smart', icon: '📍', name: 'Street Smart' },
    scenarios: [
      {
        title: 'Free Wi-Fi at the station',
        setup: 'You are at the railway station and need to pay your college fee before the deadline. Your mobile data is slow.',
        start: 'wifi',
        steps: {
          wifi: {
            view: 'wifi',
            networks: [
              { name: 'Free_Railway_WiFi_5G', secure: false, go: 'captive' },
              { name: 'RailWire', secure: false, note: 'Official Indian Railways Wi-Fi', go: 'railwire' },
              { name: 'Airtel_Xstream_4581', secure: true },
            ],
            actions: [{ label: 'Wait and use mobile data', end: 'data' }],
          },
          captive: {
            view: 'browser', url: 'free-railway-wifi.net/login', heading: 'Free Railway WiFi',
            note: 'Sign in with your Google account to get 2 hours of free high-speed Wi-Fi.',
            fields: ['Gmail address', 'Gmail password'],
            submit: { label: 'Connect', end: 'phished' },
            close: { label: 'Close', end: 'closed' },
          },
          railwire: {
            view: 'app', app: 'RailWire', title: 'railwire.co.in',
            blocks: [
              { t: 'p', text: 'Enter your mobile number to get a one-time code for free Wi-Fi.' },
              { t: 'field', label: 'Mobile number', value: '98•••••210' },
            ],
            actions: [{ label: 'Log in with the code', end: 'railwire' }],
          },
        },
        outcomes: {
          data: { safe: true, title: 'Safe. Slow, but yours.', text: 'For payments, your own mobile data is always the safest network.' },
          railwire: { safe: true, title: 'Safe. That was the real one.', text: 'RailWire is the official station Wi-Fi and only asks for your mobile number. Still, use mobile data for payments when you can.' },
          closed: { safe: true, title: 'Safe. You left the fake login page.', text: 'Wi-Fi never needs your Google password.' },
          phished: { safe: false, title: 'Your Gmail was stolen.', text: 'Someone set up "Free_Railway_WiFi_5G" from a laptop on the platform. With your Gmail they reset your other accounts.' },
        },
        flags: [
          'Anyone can name a hotspot "Free_Railway_WiFi". The name proves nothing.',
          'Real public Wi-Fi asks for a mobile number and OTP, never your email password.',
          'Do payments and logins on mobile data, not open Wi-Fi.',
        ],
      },
      {
        title: 'The cashback QR',
        setup: 'A WhatsApp message arrives with a QR code.',
        notify: { app: 'WhatsApp', from: 'UPI Cashback Offers', preview: '🎉 Congratulations! You won ₹2,000 cashback…' },
        start: 'chat',
        steps: {
          chat: {
            view: 'chat', app: 'WhatsApp', contact: 'UPI Cashback Offers', sub: '+91 90041 77320',
            messages: [
              { from: 'them', text: '🎉 Congratulations! You won ₹2,000 cashback. Scan this QR in any UPI app to receive it instantly. Offer valid for 30 minutes only.' },
              { from: 'them', file: { name: 'cashback_qr.jpg', size: 'Photo', go: 'qr' } },
            ],
            actions: [{ label: 'Block and report', end: 'reported' }],
          },
          qr: {
            view: 'qr', payload: 'upi://pay?pa=cashback.offer22@ybl&pn=Cashback%20Offer&am=2000',
            actions: [
              { label: 'Open in UPI app', go: 'upi' },
              { label: 'Cancel', end: 'reported' },
            ],
          },
          upi: {
            view: 'upi', label: 'Scan & pay', payee: 'Cashback Offer', vpa: 'cashback.offer22@ybl', amount: 2000, note: 'Receive cashback',
            pay: { go: 'pin' }, decline: { end: 'declined' },
          },
          pin: { view: 'pin', payee: 'Cashback Offer', amount: 2000, done: { end: 'scammed' }, cancel: { end: 'declined' } },
        },
        outcomes: {
          reported: { safe: true, title: 'Safe.', text: 'There is no such thing as scanning a QR to receive money.' },
          declined: { safe: true, title: 'Safe, at the last step.', text: 'The UPI app said "Pay", not "Receive". You read it in time.' },
          scammed: { safe: false, loss: 2000, title: 'You paid ₹2,000 for "cashback".', text: 'Scanning a QR code and entering your PIN always sends money out.' },
        },
        flags: [
          'Scanning a QR code is for paying. You never scan anything to receive money.',
          'The QR contained "am=2000", a payment of ₹2,000, already filled in.',
          'Prize and cashback offers with a 30-minute timer are bait.',
        ],
      },
      {
        title: 'The airport charging point',
        setup: 'Your phone is at 4% at the airport. You plug into a free USB charging point at the gate.',
        start: 'usb',
        steps: {
          usb: {
            view: 'dialog', app: 'System',
            behind: [{ t: 'note', text: 'Charging via USB · 4%' }],
            title: 'Allow access to phone data?',
            text: 'The connected device will be able to access files and data on this phone.',
            actions: [
              { label: 'Allow', end: 'allowed' },
              { label: 'Deny (charge only)', end: 'charge' },
              { label: 'Unplug and use my own charger in a wall socket', end: 'wall' },
            ],
          },
        },
        outcomes: {
          charge: { safe: true, title: 'Safe. Charge only.', text: 'Denying data access means the port can only give power.' },
          wall: { safe: true, title: 'Safest choice.', text: 'Your own charger and a wall socket can only ever give power.' },
          allowed: { safe: false, title: 'Your photos and files were copied.', text: 'A charging port asking for data access is a red flag. This one copied your photos, documents and saved files while you waited.' },
        },
        flags: [
          'A charging port has no reason to read your data.',
          'Public USB ports can be tampered with ("juice jacking").',
          'Carry your own charger, or use a power bank.',
        ],
      },
    ],
  },


  {
    id: 7,
    title: 'Laptop Under Attack',
    subtitle: 'Ransomware, fake virus pop-ups, a mystery pendrive and cracked software, all on your own laptop.',
    icon: '💻',
    device: 'laptop',
    difficulty: 'hard',
    tip: 'Disconnect first, think second. Most damage happens while an infected laptop stays online.',
    badge: { id: 'laptop-medic', icon: '💻', name: 'Laptop Medic' },
    scenarios: [
      {
        title: 'Ransomware',
        setup: 'It is two days before your project submission. You open your laptop and see this.',
        start: 'note',
        steps: {
          note: {
            view: 'window', alert: true, title: 'README_RESTORE_FILES.txt',
            lines: [
              'ALL YOUR FILES HAVE BEEN ENCRYPTED.',
              'Your documents, photos and projects are locked. Pay 0.05 BTC (about ₹35,000) within 72 hours to receive the key. After that, the key is deleted forever.',
            ],
            files: ['Final_Year_Project.docx.locked', 'Photos_2026.zip.locked', 'Resume.pdf.locked'],
            actions: [
              { label: 'Pay the ransom', end: 'paid' },
              { label: 'Turn off Wi-Fi and unplug the network cable', go: 'offline' },
              { label: 'Restart the laptop and hope it goes away', end: 'restarted' },
            ],
          },
          offline: {
            view: 'window', title: 'Network disconnected',
            lines: [
              'Your laptop is offline now, so the ransomware cannot reach your cloud drive or other devices.',
              'What next?',
            ],
            actions: [
              { label: 'Pay the ransom now that it is contained', end: 'paid' },
              { label: 'Plug in my backup hard disk to check my files are okay', end: 'backuphit' },
              { label: 'Get the laptop wiped by IT, then restore from my backup', end: 'restored' },
            ],
          },
        },
        outcomes: {
          restored: { safe: true, title: 'Recovered without paying.', text: 'Disconnect, wipe, then restore from a backup that was never connected to the infected laptop. Then report it at cybercrime.gov.in.' },
          paid: { safe: false, loss: 35000, title: 'You paid, and got nothing back.', text: 'The key never came. Many victims who pay never get their files back, and paying marks you as someone who pays.' },
          restarted: { safe: false, title: 'It spread to your cloud drive.', text: 'While the laptop was back online, the encrypted files synced to your Google Drive and overwrote the good copies.' },
          backuphit: { safe: false, title: 'Your backup got encrypted too.', text: 'Plugging the backup into the infected laptop let the ransomware lock it as well. Only connect a backup to a clean machine.' },
        },
        flags: [
          'Disconnect from the network first to stop it spreading.',
          'Never connect your backup to an infected machine.',
          'Paying does not guarantee anything and funds the next attack.',
          'Keep at least one backup offline, unplugged when you are not using it.',
        ],
      },
      {
        title: 'The virus pop-up',
        setup: 'You are watching a movie on a free streaming site. Suddenly the screen changes.',
        start: 'popup',
        steps: {
          popup: {
            view: 'window', alert: true, title: 'Windows Defender Security Center',
            lines: [
              '⚠ YOUR COMPUTER IS INFECTED WITH 5 VIRUSES',
              'Your bank details and Facebook passwords are being stolen right now.',
              'Call Microsoft Support immediately: 1800-571-0399 (toll free). Do NOT close this window or restart your computer.',
            ],
            actions: [
              { label: 'Call the number', go: 'call' },
              { label: 'Press Ctrl+Shift+Esc and close the browser', end: 'closed' },
              { label: 'Click "Scan now"', end: 'clicked' },
            ],
          },
          call: {
            view: 'window', title: 'Phone call — "Microsoft Support"',
            lines: [
              '"Hello, I am from Microsoft. I can see many viruses. Install AnyDesk so I can clean it for you."',
              '"Done. Your Windows licence expired, which is why the viruses came in. A lifetime protection plan costs ₹12,999. You can pay by UPI."',
            ],
            actions: [
              { label: 'Pay ₹12,999 for protection', end: 'paid' },
              { label: 'Hang up and uninstall AnyDesk', end: 'half' },
            ],
          },
        },
        outcomes: {
          closed: { safe: true, title: 'Safe. It was just a web page.', text: 'Fake pop-ups are web pages made to look like Windows. Closing the browser ends them.' },
          clicked: { safe: false, title: 'You downloaded real malware.', text: 'The "Scan now" button downloaded a fake antivirus that now shows ads and tracks what you type.' },
          half: { safe: false, title: 'Close call.', text: 'He had access to your laptop for a while. Run a real antivirus scan and change your passwords from another device.' },
          paid: { safe: false, loss: 12999, title: 'You lost ₹12,999.', text: 'There were no viruses and there is no protection plan. Microsoft never shows phone numbers in warnings.' },
        },
        flags: [
          'Microsoft and Windows never show a phone number in a virus warning.',
          '"Do not close this window" is there to stop you doing the one thing that works.',
          'It appeared on a free streaming site, a common source of fake pop-ups.',
        ],
      },
      {
        title: 'The mystery pendrive',
        setup: 'You find a pendrive labelled "Exam Answers 2026" on a bench in the college lab.',
        start: 'found',
        steps: {
          found: {
            view: 'window', title: 'Desktop',
            lines: ['A pendrive labelled "Exam Answers 2026" is sitting next to your laptop.'],
            actions: [
              { label: 'Plug it in and take a look', go: 'usb' },
              { label: 'Plug it into a lab computer instead of mine', end: 'labpc' },
              { label: 'Hand it to the lab in-charge without plugging it in', end: 'handed' },
            ],
          },
          usb: {
            view: 'window', title: 'USB Drive (E:)',
            lines: ['USB Drive (E:) connected.'],
            files: ['Exam_Answers_2026.pdf.exe', 'Paper_Leak.lnk'],
            actions: [
              { label: 'Open Exam_Answers_2026.pdf', end: 'opened' },
              { label: 'Eject it without opening anything and hand it in', end: 'ejected' },
            ],
          },
        },
        outcomes: {
          handed: { safe: true, title: 'Safe. Exactly right.', text: 'Dropped pendrives with tempting labels are a known way to get malware inside colleges and companies.' },
          ejected: { safe: true, title: 'Safe, but avoid plugging it in at all.', text: 'Some USB devices attack as soon as they are plugged in, before you open anything.' },
          labpc: { safe: false, title: 'You infected the lab network.', text: 'The lab computer was connected to the college network. The malware spread to other lab machines that afternoon.' },
          opened: { safe: false, loss: 15000, title: 'It was a keylogger.', text: 'The "PDF" was a program. It recorded everything you typed, including your net banking password.' },
        },
        flags: [
          'Found pendrives with exciting labels are bait.',
          '"Exam_Answers_2026.pdf.exe" ends in .exe, so it is a program, not a PDF.',
          'Plugging it into someone else\'s computer just moves the risk to them.',
        ],
      },
      {
        title: 'Cracked software',
        setup: 'You need Photoshop for an assignment. A YouTube video links to a free "full version".',
        start: 'download',
        steps: {
          download: {
            view: 'window', title: 'Downloads',
            lines: [
              'Photoshop_2026_Full_Crack.zip downloaded from free-softz.xyz',
              'Windows Security: Threat found — Trojan:Win32/Keylogger. Action blocked.',
              'The README says: "Turn off antivirus before running. It is a false positive, don\'t worry."',
            ],
            files: ['Photoshop_2026_Full_Crack.zip'],
            actions: [
              { label: 'Turn off antivirus and run it', end: 'ran' },
              { label: 'Delete the file', end: 'deleted' },
              { label: 'Use a free alternative or the student licence instead', end: 'legit' },
            ],
          },
        },
        outcomes: {
          deleted: { safe: true, title: 'Safe. Antivirus was right.', text: 'When a download tells you to turn off your antivirus, believe the antivirus.' },
          legit: { safe: true, title: 'Safe, and still got the work done.', text: 'Photopea and GIMP are free, and Adobe has student plans. No risk at all.' },
          ran: { safe: false, loss: 22000, title: 'The crack came with a keylogger.', text: 'Photoshop worked fine, which is why you did not notice. The hidden keylogger sent your banking login to the attacker a week later.' },
        },
        flags: [
          '"Turn off your antivirus first" is the biggest warning a download can give.',
          'Cracked software is the most common way students get malware.',
          'There are free and student versions of almost everything.',
        ],
      },
    ],
  },
];
