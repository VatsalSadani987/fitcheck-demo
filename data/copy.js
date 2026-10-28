/* FitCheck chat wording, in English and Hinglish (Roman script). Placeholders look like {name}.
   Hinglish is written gender-neutral on purpose (the bot says "hum", never a gendered verb).
   Safety-relevant lines (doctor verdict, "not medical advice", "follow your pack") mean the same in both languages. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FitCopy = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var en = {
    greet: 'Hey! 👋 Welcome to *FitCheck*, your buddy for getting the most out of your Be.Bodywise order.\n\nWhich language is easier for you?\nAapko kaunsi language easy lagti hai?\n\n_A sample idea by Vatsal Sadani, St. Xavier’s College (Autonomous), Kolkata._',
    lbl: { what: 'What it’s for', how: 'How to use', time: 'Give it time', good: 'Good to know' },
    plan: 'Here’s the plan: a quick nudge on day 3 to see if you’ve started, then a proper check-in around day {days}. For this demo they arrive in seconds ⏱',
    nudge: 'Quick nudge 👋 It’s day 3 (for this demo, a few seconds later 😄).\n\nHave you started using your order yet?',
    nudgeUsing: 'Great start! 🙌 Using it regularly is what makes a fair trial.\n\nI’ll check in around day {days}.',
    nudgeNot: 'No rush! 😊 Here’s the first step to make it easy to start:\n\n{step}\n\nI’ll check in around day {days}.',
    nudgeHelp: 'Happy to help! Here’s how to use it:\n\n{how}\n\nIf your pack says something different, follow your pack.\n\nI’ll check in around day {days}.',
    ago: { 7: 'a week', 14: 'two weeks', 28: 'a month' },
    checkin: 'Hey! It’s been about {ago} since you got your *{nick}* 🙂\n\n{progress}How’s it treating you so far?',
    checkinNext: 'Now for your *{nick}* ({i} of {n}) 🙂\n\nHow’s that one going?',
    progress: '🗓 Day {d} of about {t}\n{bar}\n\n',
    q1: 'How’s your *{nick}* going?',
    gotit: 'Got it, thanks for being straight with me 🙏',
    useq: 'Quick one: how have you been using it?',
    reasonFirst: 'What’s bugging you the most? 👀\n\nYou can pick more than one. I’ll ask after each.',
    reasonMore: 'What else is bugging you?',
    more: 'Noted ✅\n\nAnything else?',
    share: 'Last thing 🙌\n\nWant to tell the Be.Bodywise team how this went? It’s completely anonymous: no name, no number.',
    note: 'Thank you! Add a line in your own words if you like (no names or numbers please), or just send *skip*.',
    noteThanks: 'Got it, thank you! 💙 It goes to the team anonymously.',
    skipped: 'No problem at all, nothing was shared 👍',
    retry: 'Sorry, I didn’t catch that 🙈 Could you pick one of the options?',
    timeNS: 'The pages I checked don’t say how long to give it, so your pack is the best guide.',
    v: {
      doctor: 'I’m really sorry that happened 😔\n\n*My take: stop using it for now.*\n\nIf the irritation doesn’t settle soon, please see a doctor or pharmacist. I can’t diagnose skin problems, and your comfort comes first.\n\nIt’s also worth re-reading the cautions on your pack.',
      keep: 'Love to hear that! 🎉\n\n*My take: keep going.* Stick with how you’re using it now and let it do its thing.\n\n⏳ {time}',
      little: 'Totally fine, life gets busy 😄\n\n*My take: give it a proper go first.* A fair trial needs regular use, as directed:\n\n{how}\n\n⏳ {time}',
      usageLess: 'Thanks for being honest 🙏\n\n*My take: let’s sort out how it’s used first.* It’s hard to judge a product that isn’t used as directed. Here’s the quick version:\n\n{how}\n\n⏳ Then give it time. {time}',
      instr: 'Thanks, this one is really useful for the brand to hear 💡\n\n*My take: the instructions need to be clearer.* Here’s what the pack and listing say:\n\n{how}\n\nIf your pack says something different, go with your pack, or ask customer support.{extra}',
      swap: 'That’s fair, feel and smell are very personal 🤷\n\n*My take: consider a swap.* Using it differently won’t change those much.\n\n{swap}{extra}',
      value: 'Fair enough 💸\n\n*My take: nothing to fix in how you’re using it.* Whether it’s worth the price is really your call.\n\n{swap}',
      wait: 'Thanks for sharing 🙏\n\n*My take: give it more time.* You’re using it as directed, so time is the next step.\n\n⏳ {time}\n\nIf you reach that point with no change, a swap or a word with a doctor or pharmacist could help.\n\n{swap}{extra}'
    },
    swapHead: 'A swap in the same range to consider:',
    swapLine: '• *{name}* ({size}, demo price ₹{price}): {for}',
    swapTail: 'I can’t promise it’ll suit you better, so compare the ingredient list on the pack and do a patch test.',
    noSwap: 'There’s no like-for-like swap in this store, so your options are adjusting how you use it, giving it more time, or asking customer support.',
    extraPrice: '\n\nOn price: only you can say whether it’s worth it for you.',
    badge: { start: 'Started right', fair: 'Fair trial', voice: 'Honest voice' },
    badgeHint: { start: 'say you’ve started at the day-3 nudge', fair: 'finish a check-in', voice: 'share anonymously' },
    badgeHead: '🏅 *Your badges* ({n} of 3)',
    finish: 'And that’s the whole FitCheck loop 🎉\n\n{badges}\n\n{passport}In real life, check-ins arrive after 1 to 4 weeks, not 30 seconds. The brand only ever sees anonymous reasons, never your number.\n\nSend *demo* to try again.',
    welcome: 'Hey! 👋 I’m *FitCheck*. I help you give a new product a fair trial and work out what to do next.\n\nTo start, order something in the demo store{site}\nthen tap *Continue on WhatsApp*.\n\nOr send *demo* and I’ll show you how it works with a sample product.\n\nHinglish chahiye? *demo hinglish* bhejein.',
    opt: {
      Q1: { well: '😊 Working well', none: '🤔 No change yet', notexp: '😕 Not what I expected', irr: '⚠️ Skin irritation', little: '⏳ Haven’t used it much' },
      USE: { less: 'Less than directed', asdir: 'As directed', unsure: 'Not sure how' },
      REASON: { results: 'No visible results', feel: 'Feel or texture', smell: 'Smell', price: 'Price or value', instr: 'Instructions unclear', other: 'Something else' },
      MORE: { more: 'Yes, one more', done: 'That’s all' },
      SHARE: { share: 'Yes, share it', skip: 'No thanks' },
      NUDGE: { using: 'Yes, using it ✅', notyet: 'Not yet', help: 'Need help' },
      LANG: { en: 'English', hi: 'Hinglish' }
    },
    btnTell: 'Tell me', btnPick: 'Pick one'
  };

  var hi = {
    greet: en.greet,
    hello: 'Hey! 👋 *FitCheck* mein aapka swagat hai, aapke Be.Bodywise order ka poora fayda uthane mein aapka saathi.\n\n_Vatsal Sadani ka ek sample idea, St. Xavier\u2019s College (Autonomous), Kolkata._',
    passportLine: 'Aapka trial passport (agle step ke saath):',
    lbl: { what: 'Yeh kis liye hai', how: 'Kaise use karein', time: 'Thoda time dein', good: 'Dhyan rakhein' },
    plan: 'Plan yeh hai: din 3 par ek chhota nudge, yeh dekhne ke liye ki aapne shuru kiya ya nahi, phir din {days} ke aaspaas poora check-in. Is demo mein yeh seconds mein aayenge ⏱',
    nudge: 'Chhota sa nudge 👋 Aaj din 3 hai (is demo mein kuch seconds baad 😄).\n\nKya aapne apna order use karna shuru kiya?',
    nudgeUsing: 'Badhiya shuruaat! 🙌 Regular use hi ek fair trial banata hai.\n\nHum din {days} ke aaspaas check-in karenge.',
    nudgeNot: 'Koi jaldi nahi! 😊 Shuru karna aasaan ho, isliye pehla step yeh hai:\n\n{step}\n\nHum din {days} ke aaspaas check-in karenge.',
    nudgeHelp: 'Zaroor madad karenge! Aise use karein:\n\n{how}\n\nAgar aapke pack par kuch alag likha ho, to pack ki baat maanein.\n\nHum din {days} ke aaspaas check-in karenge.',
    ago: { 7: 'ek hafta', 14: 'do hafte', 28: 'ek mahina' },
    checkin: 'Hey! Aapka *{nick}* aaye lagbhag {ago} ho gaya 🙂\n\n{progress}Ab tak kaisa chal raha hai?',
    checkinNext: 'Ab aapke *{nick}* ki baat ({i}/{n}) 🙂\n\nYeh wala kaisa chal raha hai?',
    progress: '🗓 Din {d} / lagbhag {t}\n{bar}\n\n',
    q1: 'Aapka *{nick}* kaisa chal raha hai?',
    gotit: 'Samajh gaye, sach batane ke liye thanks 🙏',
    useq: 'Ek chhota sawaal: aap ise kaise use kar rahe hain?',
    reasonFirst: 'Sabse zyada kya khatak raha hai? 👀\n\nAap ek se zyada chun sakte hain. Har ek ke baad hum poochhenge.',
    reasonMore: 'Aur kya khatak raha hai?',
    more: 'Note kar liya ✅\n\nAur kuch?',
    share: 'Aakhri baat 🙌\n\nKya aap Be.Bodywise team ko batana chahenge ki kaisa raha? Yeh poori tarah anonymous hai: na naam, na number.',
    note: 'Thanks! Chahein to apne shabdon mein ek line likhein (please naam ya number na likhein), ya bas *skip* bhejein.',
    noteThanks: 'Mil gaya, thank you! 💙 Yeh team tak anonymously pahunchta hai.',
    skipped: 'Koi baat nahi, kuch share nahi hua 👍',
    retry: 'Sorry, samajh nahi aaya 🙈 Please koi ek option chunein.',
    timeNS: 'Humne jo pages dekhe, unme yeh nahi likha ki kitna time dena hai, isliye aapka pack hi sabse achha guide hai.',
    v: {
      doctor: 'Yeh sunkar bura laga 😔\n\n*Hamari salah: abhi ise use karna band karein.*\n\nAgar irritation jaldi theek na ho, to please kisi doctor ya pharmacist ko dikhayein. Hum skin problems diagnose nahi kar sakte, aur aapka comfort sabse pehle hai.\n\nApne pack par likhi savdhaniyan bhi ek baar dobara padh lein.',
      keep: 'Yeh sunkar achha laga! 🎉\n\n*Hamari salah: aise hi chalte rahein.* Jaise abhi use kar rahe hain, waise hi karte rahein aur ise apna kaam karne dein.\n\n⏳ {time}',
      little: 'Koi baat nahi, busy life hoti hai 😄\n\n*Hamari salah: pehle ise sahi se try karein.* Fair trial ke liye directions ke mutabik regular use zaroori hai:\n\n{how}\n\n⏳ {time}',
      usageLess: 'Sach batane ke liye thanks 🙏\n\n*Hamari salah: pehle use karne ka tareeka theek karein.* Jo product directions ke mutabik use na ho, use judge karna mushkil hota hai. Seedhi baat yeh hai:\n\n{how}\n\n⏳ Phir ise time dein. {time}',
      instr: 'Thanks, brand ke liye yeh bahut kaam ki baat hai 💡\n\n*Hamari salah: instructions aur saaf honi chahiye.* Pack aur listing yeh kehte hain:\n\n{how}\n\nAgar aapke pack par kuch alag likha hai, to pack ki baat maanein, ya customer support se poochhein.{extra}',
      swap: 'Sahi baat hai, feel aur smell bahut personal hote hain 🤷\n\n*Hamari salah: swap par vichar karein.* Alag tareeke se use karne se yeh zyada nahi badlenge.\n\n{swap}{extra}',
      value: 'Theek hai 💸\n\n*Hamari salah: aap jaise use kar rahe hain, usme kuch badalne ki zaroorat nahi.* Price ke hisaab se yeh worth hai ya nahi, yeh aapka faisla hai.\n\n{swap}',
      wait: 'Share karne ke liye thanks 🙏\n\n*Hamari salah: ise thoda aur time dein.* Aap directions ke mutabik use kar rahe hain, to ab time hi agla step hai.\n\n⏳ {time}\n\nAgar us time ke baad bhi koi fark na dikhe, to swap ya kisi doctor ya pharmacist se baat karna madadgaar ho sakta hai.\n\n{swap}{extra}'
    },
    swapHead: 'Isi range mein ek swap, jis par vichar kar sakte hain:',
    swapLine: '• *{name}* ({size}, demo price ₹{price}): {for}',
    swapTail: 'Hum yeh vaada nahi kar sakte ki yeh aapko zyada suit karega, isliye pack par poori ingredient list compare karein aur patch test karein.',
    noSwap: 'Is store mein koi bilkul milta-julta swap nahi hai, isliye aapke options hain: use karne ka tareeka sudharein, ise aur time dein, ya customer support se poochhein.',
    extraPrice: '\n\nPrice ke baare mein: yeh aapke liye worth hai ya nahi, yeh sirf aap bata sakte hain.',
    badge: { start: 'Sahi shuruaat', fair: 'Fair trial', voice: 'Honest voice' },
    badgeHint: { start: 'din 3 ke nudge par bataiye ki shuru kar diya', fair: 'ek check-in poora karein', voice: 'anonymously share karein' },
    badgeHead: '🏅 *Aapke badges* ({n}/3)',
    finish: 'Aur yeh raha poora FitCheck loop 🎉\n\n{badges}\n\n{passport}Asli zindagi mein check-in 1 se 4 hafte baad aate hain, 30 second mein nahi. Brand ko sirf anonymous reasons dikhte hain, aapka number kabhi nahi.\n\nDobara try karne ke liye *demo hinglish* bhejein.',
    welcome: en.welcome,
    opt: {
      Q1: { well: '😊 Badhiya chal raha', none: '🤔 Abhi koi fark nahi', notexp: '😕 Umeed jaisa nahi', irr: '⚠️ Skin irritation', little: '⏳ Zyada use nahi kiya' },
      USE: { less: 'Kam use kiya', asdir: 'Directions jaisa', unsure: 'Pata nahi kaise' },
      REASON: { results: 'Result nahi dikha', feel: 'Feel ya texture', smell: 'Smell', price: 'Price ya value', instr: 'Instructions unclear', other: 'Kuch aur' },
      MORE: { more: 'Haan, ek aur', done: 'Bas itna hi' },
      SHARE: { share: 'Haan, share karo', skip: 'Nahi, thanks' },
      NUDGE: { using: 'Haan, shuru kiya ✅', notyet: 'Abhi nahi', help: 'Help chahiye' },
      LANG: { en: 'English', hi: 'Hinglish' }
    },
    btnTell: 'Bataiye', btnPick: 'Ek chunein'
  };

  return { en: en, hi: hi };
});
