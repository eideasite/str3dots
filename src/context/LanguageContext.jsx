/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from 'react'

const tamil = {
  'Search accessibility settings': 'அணுகல்தன்மை அமைப்புகளைத் தேடுக', 'Text-to-speech': 'உரையைப் பேச்சாக மாற்றுதல்', 'Browser speech options': 'உலாவியின் பேச்சு விருப்பங்கள்', 'Text formatting options': 'உரை வடிவமைப்பு விருப்பங்கள்', 'Bold and outline text': 'தடித்த மற்றும் விளிம்புள்ள உரை', Display: 'காட்சி', 'Display size & text': 'காட்சி அளவு மற்றும் உரை', 'Display > Color contrast': 'காட்சி > நிற வேறுபாடு', Accessibility: 'அணுகல்தன்மை', 'Text-to-speech output': 'உரைப் பேச்சு வெளியீடு', 'Make text easier to distinguish.': 'உரையை எளிதில் வேறுபடுத்திக் காணும்படி செய்யவும்.', 'Speech uses voices available in this browser or device. TalkBack and system verbosity are managed in device settings.': 'இந்த உலாவி அல்லது சாதனத்தில் உள்ள குரல்களைப் பேச்சு வசதி பயன்படுத்தும். TalkBack மற்றும் பேச்சு அமைப்புகள் சாதன அமைப்புகளில் நிர்வகிக்கப்படும்.', 'Test text-to-speech': 'உரைப் பேச்சைச் சோதிக்கவும்', 'Text-to-speech is not supported by this browser.': 'இந்த உலாவியில் உரைப் பேச்சு வசதி இல்லை.', 'This is a sample of text to speech.': 'இது உரையைப் பேச்சாக மாற்றும் வசதிக்கான மாதிரி.', 'Speaking...': 'பேசுகிறது...', Stop: 'நிறுத்து',
  'Accessibility settings': 'அணுகல்தன்மை அமைப்புகள்', 'Size options': 'அளவு விருப்பங்கள்', 'Font size': 'எழுத்தளவு', 'Make text bigger or smaller': 'எழுத்தைச் சிறிதாகவோ பெரிதாகவோ மாற்றவும்', 'Display size': 'திரை அளவு', 'Make everything bigger or smaller': 'அனைத்தையும் சிறிதாகவோ பெரிதாகவோ மாற்றவும்', 'Style options': 'தோற்ற விருப்பங்கள்', 'Bold text': 'தடித்த எழுத்து', 'Outline text': 'எழுத்தைச் சுற்றி விளிம்பு', 'Add a black or white background around text to increase contrast': 'எழுத்து தெளிவாகத் தெரிய கருப்பு அல்லது வெள்ளை விளிம்பைச் சேர்க்கவும்', 'Reset settings': 'அமைப்புகளை மீட்டமை', Decrease: 'குறைக்கவும்', Increase: 'அதிகரிக்கவும்', 'Dark theme': 'இருண்ட தோற்றம்', 'Use a dark background for comfortable viewing.': 'வசதியாகப் பார்ப்பதற்கு இருண்ட பின்னணியைப் பயன்படுத்தவும்.', 'Use a dark background to make this writing space more comfortable. Your theme is saved on this device.': 'எழுத்துப் பணியிடத்தை வசதியாகப் பயன்படுத்த இருண்ட பின்னணியைத் தேர்ந்தெடுக்கவும். தோற்றம் இந்தச் சாதனத்தில் சேமிக்கப்படும்.', 'Use dark theme': 'இருண்ட தோற்றத்தைப் பயன்படுத்து', 'Theme style': 'தோற்ற வகை', Standard: 'சாதாரணம்', Expanded: 'விரிவாக்கம்', 'Use the app dark theme as designed.': 'இந்தப் பயன்பாட்டின் இருண்ட தோற்றத்தைப் பயன்படுத்தவும்.', 'Use stronger dark surfaces and contrast throughout this app.': 'இந்தப் பயன்பாட்டில் அதிக மாறுபாடுள்ள இருண்ட தோற்றத்தைப் பயன்படுத்தவும்.', 'Pure black': 'முழுக் கருப்பு', 'Pure black background for dark theme': 'இருண்ட தோற்றத்தில் முழுக் கருப்புப் பின்னணி', Timing: 'நேர அமைப்பு', Off: 'முடக்கு', 'Change the theme manually.': 'தோற்றத்தை கைமுறையாக மாற்றவும்.', Schedule: 'அட்டவணை', 'Turns on at custom time': 'குறிப்பிட்ட நேரத்தில் இயக்கப்படும்', 'Start time': 'தொடக்க நேரம்', 'End time': 'முடிவு நேரம்', 'The schedule follows this device local time while this app is open.': 'இந்தப் பயன்பாடு திறந்திருக்கும் போது அட்டவணை சாதனத்தின் உள்ளூர் நேரத்தைப் பின்பற்றும்.', 'Device modes can also turn on dark theme.': 'சாதனத்தின் பயன்முறைகளும் இருண்ட தோற்றத்தை இயக்கலாம்.', 'This website cannot read or change device modes. Its custom schedule follows this browser local time while the app is open.': 'இந்த இணையதளம் சாதனப் பயன்முறைகளைப் படிக்கவோ மாற்றவோ முடியாது. பயன்பாடு திறந்திருக்கும் போது தனிப்பயன் அட்டவணை உலாவியின் உள்ளூர் நேரத்தைப் பின்பற்றும்.',
  'Back to home': 'முகப்புக்குத் திரும்பு',
  'Article preview': 'கட்டுரை முன்னோட்டம்', 'Save as PDF': 'PDF ஆகச் சேமி', 'Choose Save as PDF in the browser print dialog.': 'அச்சிடும் சாளரத்தில் Save as PDF என்பதைத் தேர்ந்தெடுக்கவும்.', Close: 'மூடு',
  'Write a Post': 'இடுகை எழுத', 'Write an Article': 'கட்டுரை எழுத', Photo: 'புகைப்படம்', 'Write article': 'கட்டுரை எழுத',
  'Start writing a post': 'இடுகை எழுதத் தொடங்குங்கள்', Posts: 'இடுகைகள்', 'Local post': 'இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது',
  Post: 'இடுகையிடு', 'Post saved in this browser.': 'இடுகை இந்த உலாவியில் சேமிக்கப்பட்டது.',
  'This creates a local post in this browser only.': 'இந்த இடுகை இந்த உலாவியில் மட்டும் சேமிக்கப்படும்.',
  'Article body': 'கட்டுரையின் உட்பகுதி',
  'Could not save this post in this browser.': 'இந்த உலாவியில் இடுகையைச் சேமிக்க முடியவில்லை.',
  'Write Article': 'கட்டுரை எழுதுக', Profile: 'சுயவிவரம்', 'Article Editor': 'கட்டுரை திருத்தி',
  'Focus mode': 'கவனக் குவிப்பு முறை', 'Exit focus mode': 'கவனக் குவிப்பு முறையை விட்டு வெளியேறு',
  'SEO Settings': 'SEO அமைப்புகள்', 'Published Post': 'வெளியிடப்பட்ட கட்டுரை', 'Articles Management': 'கட்டுரைகள் நிர்வாகம்',
  'Open navigation': 'வழிசெலுத்தலைத் திறக்கவும்', 'Switch to light mode': 'பகல் பயன்முறைக்கு மாற்றவும்',
  'Choose language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
  'Switch to night mode': 'இரவு பயன்முறைக்கு மாற்றவும்', 'Personal writing space': 'தனிப்பட்ட எழுத்து இடம்',
  'Add an image': 'படம் சேர்க்கவும்', 'Add an emoji': 'எமோஜி சேர்க்கவும்', 'Start writing an article': 'கட்டுரை எழுதத் தொடங்கவும்',
  'Open article editor': 'கட்டுரை திருத்தியைத் திறக்கவும்', "What's on your mind, {name}?": 'என்ன எழுத நினைக்கிறீர்கள், {name}?',
  writer: 'எழுத்தாளர்', 'Writing workspace': 'எழுத்துப் பணி இடம்',
  'Write and edit your article. Your draft is saved in this browser.': 'கட்டுரையை எழுதி திருத்துங்கள். வரைவு இந்த உலாவியில் சேமிக்கப்படும்.',
  Manage: 'நிர்வகி', Next: 'அடுத்து', Style: 'வடிவம்', 'Choose text style': 'உரை வடிவத்தைத் தேர்ந்தெடுக்கவும்',
  Paragraph: 'பத்தி', 'Heading 1': 'தலைப்பு 1', 'Heading 2': 'தலைப்பு 2', Bold: 'தடித்த எழுத்து', Italic: 'சாய்வு எழுத்து',
  'Bulleted list': 'குறிப்புப் பட்டியல்', 'Numbered list': 'எண் பட்டியல்', Quote: 'மேற்கோள்', 'Code block': 'குறியீட்டுப் பகுதி',
  'Horizontal line': 'கிடைமட்ட கோடு', 'Insert link': 'இணைப்பு சேர்க்கவும்', 'Insert image': 'படம் சேர்க்கவும்',
  'Insert image reference': 'பட இணைப்பு சேர்க்கவும்', 'Image URL': 'பட URL', Insert: 'சேர்க்கவும்',
  'Select text, then choose a format.': 'உரையைத் தேர்ந்தெடுத்து வடிவத்தைத் தேர்வு செய்யவும்.',
  'Article title': 'கட்டுரைத் தலைப்பு', 'Write an article title...': 'கட்டுரையின் தலைப்பை எழுதுங்கள்...',
  Draft: 'வரைவு', 'Scheduled locally': 'உள்ளூரில் திட்டமிடப்பட்டது', 'Published locally': 'உள்ளூரில் வெளியிடப்பட்டது',
  'Start writing your article here...': 'உங்கள் கட்டுரையை இங்கே எழுதத் தொடங்குங்கள்...',
  'Draft saved in this browser': 'வரைவு இந்த உலாவியில் சேமிக்கப்பட்டது',
  'Formatting is applied to the selected text in the editor. Publishing and scheduling are local status changes only.': 'தேர்ந்தெடுத்த உரைக்கு வடிவமைப்பு பயன்படுத்தப்படும். வெளியிடுதல் மற்றும் திட்டமிடுதல் இந்த உலாவியில் மட்டும் நிலையை மாற்றும்.',
  characters: 'எழுத்துகள்', words: 'சொற்கள்', 'min read': 'நிமிட வாசிப்பு', 'Last updated': 'கடைசியாக புதுப்பிக்கப்பட்டது',
  'No article is open': 'கட்டுரை திறக்கப்படவில்லை', 'Open a draft from Articles Management or create a new article.': 'கட்டுரைகள் நிர்வாகத்திலிருந்து வரைவைத் திறக்கவும் அல்லது புதிய கட்டுரையை உருவாக்கவும்.',
  'Could not read that image.': 'படத்தைப் படிக்க முடியவில்லை.', 'Choose a PNG, JPEG, GIF, or WebP image up to 4 MB.': '4 MB வரை PNG, JPEG, GIF அல்லது WebP படத்தைத் தேர்ந்தெடுக்கவும்.',
  'Paste a PNG, JPEG, GIF, or WebP image.': 'PNG, JPEG, GIF அல்லது WebP படத்தை ஒட்டவும்.',
  'Pasted images must be 4 MB or smaller for local draft storage.': 'உலாவி வரைவில் சேமிக்க ஒட்டும் படம் 4 MB அல்லது அதற்குக் குறைவாக இருக்க வேண்டும்.',
  'Could not read the pasted image.': 'ஒட்டிய படத்தைப் படிக்க முடியவில்லை.',
  'SEO title': 'SEO தலைப்பு', 'SEO description': 'SEO விளக்கம்', 'URL slug': 'URL பெயர்',
  'Continue to Share Article': 'பகிர்வுக்குத் தொடரவும்', All: 'அனைத்தும்', Drafts: 'வரைவுகள்',
  Scheduled: 'திட்டமிடப்பட்டவை', Published: 'வெளியிடப்பட்டவை', 'New article': 'புதிய கட்டுரை',
  'Copy text': 'உரையை நகலெடுக்கவும்', 'Copy article text': 'கட்டுரை உரையை நகலெடுக்கவும்', 'Download .txt': '.txt பதிவிறக்கவும்',
  'Schedule (optional)': 'திட்டமிடு (விருப்பம்)', 'Publish locally': 'உள்ளூரில் வெளியிடு',
  'Writer profile': 'எழுத்தாளர் சுயவிவரம்', 'Manage the name and introduction shown on your writing profile.': 'உங்கள் எழுத்துப் பக்கத்தில் காட்டப்படும் பெயர் மற்றும் அறிமுகத்தை நிர்வகிக்கவும்.',
  Back: 'திரும்பு', 'Article settings': 'கட்டுரை அமைப்புகள்', 'Article description appears here.': 'கட்டுரையின் விளக்கம் இங்கே தோன்றும்.',
  'Search title for this article': 'இந்தக் கட்டுரைக்கான தேடல் தலைப்பு', 'Short search description': 'சுருக்கமான தேடல் விளக்கம்',
  Preview: 'முன்னோட்டம்', 'Local preview': 'உள்ளூர் முன்னோட்டம்',
  'Article writer': 'கட்டுரை எழுத்தாளர்', 'Name shown to readers': 'வாசகர்களுக்குக் காட்டப்படும் பெயர்',
  'Short introduction': 'சிறு அறிமுகம்', 'Your name': 'உங்கள் பெயர்', 'A few lines about you': 'உங்களைப் பற்றிய சில வரிகள்',
  'Save profile and continue to editor': 'சுயவிவரத்தைச் சேமித்து கட்டுரை திருத்திக்குச் செல்லவும்',
  'These details are saved with the article in this browser.': 'இந்த விவரங்கள் இந்த உலாவியில் கட்டுரையுடன் சேமிக்கப்படும்.',
  'Local search preview': 'உள்ளூர் தேடல் முன்னோட்டம்', 'This data is local to your article and is not sent to a search engine.': 'இந்த விவரங்கள் கட்டுரையுடன் உள்ளூரில் மட்டும் சேமிக்கப்படும்; தேடுபொறிக்கு அனுப்பப்படாது.',
  'All articles': 'அனைத்து கட்டுரைகள்', 'Manage drafts and locally published articles.': 'வரைவுகளையும் உள்ளூரில் வெளியிடப்பட்ட கட்டுரைகளையும் நிர்வகிக்கவும்.',
  'Your writing': 'உங்கள் எழுத்துகள்', Articles: 'கட்டுரைகள்', 'Scheduled articles': 'திட்டமிடப்பட்டவை', 'Published articles': 'வெளியிடப்பட்டவை',
  'Could not save': 'சேமிக்க முடியவில்லை', 'Saved in this browser': 'இந்த உலாவியில் சேமிக்கப்பட்டது',
  'No articles in this category': 'இந்தப் பிரிவில் கட்டுரைகள் இல்லை',
  'Article body has not been added yet.': 'கட்டுரை உரை இன்னும் சேர்க்கப்படவில்லை.', 'Updated:': 'மாற்றிய தேதி:',
  'Open article': 'கட்டுரையைத் திற', 'View article': 'கட்டுரையைப் பார்', 'Article actions': 'கட்டுரை செயல்கள்',
  'Edit article': 'கட்டுரையைத் திருத்து', 'Share / publish': 'பகிர் / வெளியிடு', 'Schedule article': 'கட்டுரையைத் திட்டமிடு',
  'Discard draft': 'வரைவை நீக்கு', 'SEO settings': 'SEO அமைப்புகள்',
  'No articles yet': 'இன்னும் கட்டுரைகள் இல்லை',
  'Start an article': 'கட்டுரையைத் தொடங்கவும்', Writer: 'எழுத்தாளர்', 'Create post': 'கட்டுரையைத் தொடங்கவும்',
  'Write your post': 'உங்கள் கட்டுரையை எழுதுங்கள்', 'Remove image': 'படத்தை நீக்கவும்', 'Add to your post': 'கட்டுரையில் சேர்க்கவும்',
  'Continue to editor': 'திருத்திக்குத் தொடரவும்', 'This saves a local draft; it does not post online.': 'இது உலாவியில் வரைவைச் சேமிக்கும்; இணையத்தில் வெளியிடாது.',
  'Share article': 'கட்டுரையைப் பகிர்', 'External publishing is not connected': 'வெளிப்புற வெளியீட்டு இணைப்பு இல்லை',
  'This app does not publish to social media. You can copy or download the text, or record a local published status in this browser.': 'இந்தச் செயலி சமூக ஊடகங்களில் வெளியிடாது. உரையை நகலெடுக்கலாம் அல்லது பதிவிறக்கலாம்; இந்த உலாவியில் மட்டும் வெளியிட்டதாகக் குறிக்கலாம்.',
  'Article text copied': 'கட்டுரை உரை நகலெடுக்கப்பட்டது', 'Could not copy in this browser': 'இந்த உலாவியில் நகலெடுக்க முடியவில்லை',
  'Publishing here only changes the local status in this browser.': 'இங்கே வெளியிடுவது இந்த உலாவியில் உள்ள நிலையை மட்டும் மாற்றும்.',
  'Published in this browser': 'இந்த உலாவியில் வெளியிடப்பட்டது', '“{title}” was marked as published in this browser. It has not been published on the internet.': '“{title}” இந்த உலாவியில் வெளியிடப்பட்டதாகக் குறிக்கப்பட்டது. இணையத்தில் வெளியிடப்படவில்லை.',
  'Choose a future date and time': 'எதிர்கால தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்', 'Local schedule only': 'உள்ளூர் திட்டமிடல் மட்டும்',
  'The selected time is saved in this browser. Automatic publishing will not happen; no external service is connected.': 'தேர்ந்தெடுத்த நேரம் இந்த உலாவியில் சேமிக்கப்படும். தானியங்கி வெளியீடு நடக்காது; வெளிப்புற சேவை இணைக்கப்படவில்லை.',
  'Schedule locally': 'உள்ளூரில் திட்டமிடு', 'Previous schedule': 'முந்தைய திட்ட நேரம்',
  'Untitled article': 'தலைப்பில்லா கட்டுரை', Edit: 'திருத்து', View: 'பார்', Open: 'திற',
  'Discard Draft': 'வரைவை நீக்கு', 'Are you sure?': 'உறுதியாக உள்ளதா?', 'Back to articles': 'கட்டுரைகளுக்குத் திரும்பு',
  'Discard this draft?': 'இந்த வரைவைக் கைவிடவா?', 'The draft “{title}” will be removed permanently. Cancel to keep your writing.': '“{title}” வரைவு நிரந்தரமாக நீக்கப்படும். எழுத்தை வைத்திருக்க ரத்து செய்யவும்.',
  Share: 'பகிர்', 'Schedule post': 'வெளியீட்டு நேரத்தை அமை', 'Choose date and time': 'தேதி மற்றும் நேரத்தைத் தேர்ந்தெடு',
  'View published post': 'வெளியிடப்பட்ட கட்டுரையைப் பார்', Cancel: 'ரத்து செய்',
  'Local published preview': 'உள்ளூரில் வெளியிட்ட முன்னோட்டம்', 'This page shows the locally saved status in this browser only. It is not a page published on the internet.': 'இந்தப் பக்கம் இந்த உலாவியில் சேமிக்கப்பட்ட நிலையை மட்டும் காட்டுகிறது. இது இணையத்தில் வெளியிடப்பட்ட பக்கம் அல்ல.',
  'Published locally at': 'உள்ளூரில் வெளியிட்ட நேரம்', 'Not yet published': 'இன்னும் வெளியிடப்படவில்லை', 'Local URL slug': 'உள்ளூர் URL பெயர்',
  'A title and body are required to share or publish.': 'பகிர அல்லது வெளியிட தலைப்பும் உரையும் தேவை.',
  'A title and body are required to schedule.': 'திட்டமிட தலைப்பும் உரையும் தேவை.',
  'A title and body are required to publish.': 'வெளியிட தலைப்பும் உரையும் தேவை.',
  'Posting...': '\u0bb5\u0bc6\u0bb3\u0bbf\u0baf\u0bbf\u0b9f\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1...',
  'Scheduling...': '\u0ba4\u0bbf\u0b9f\u0bcd\u0b9f\u0bae\u0bbf\u0b9f\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1...',
  'Post saved as published in this browser.': '\u0b87\u0ba8\u0bcd\u0ba4 \u0b89\u0bb2\u0bbe\u0bb5\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b95\u0b9f\u0bcd\u0b9f\u0bc1\u0bb0\u0bc8 \u0bb5\u0bc6\u0bb3\u0bbf\u0baf\u0bbf\u0b9f\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1.',
  'Could not publish this article. Your draft is still saved.': '\u0b95\u0b9f\u0bcd\u0b9f\u0bc1\u0bb0\u0bc8\u0baf\u0bc8 \u0bb5\u0bc6\u0bb3\u0bbf\u0baf\u0bbf\u0b9f \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bb5\u0bb0\u0bc8\u0bb5\u0bc1 \u0b87\u0ba9\u0bcd\u0ba9\u0bc1\u0bae\u0bcd \u0b9a\u0bc7\u0bae\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1\u0bb3\u0bcd\u0bb3\u0ba4\u0bc1.',
  'Could not save this schedule. Your draft is still saved.': '\u0b85\u0b9f\u0bcd\u0b9f\u0bb5\u0ba3\u0bc8\u0baf\u0bc8\u0b9a\u0bcd \u0b9a\u0bc7\u0bae\u0bbf\u0b95\u0bcd\u0b95 \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bb5\u0bb0\u0bc8\u0bb5\u0bc1 \u0b87\u0ba9\u0bcd\u0ba9\u0bc1\u0bae\u0bcd \u0b9a\u0bc7\u0bae\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1\u0bb3\u0bcd\u0bb3\u0ba4\u0bc1.',
  'The schedule was saved in this browser only.': 'திட்ட நேரம் இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது.', 'Draft discarded.': 'வரைவு நீக்கப்பட்டது.',
  'Something went wrong': 'ஏதோ தவறு ஏற்பட்டது', 'The page encountered an error. Your saved browser data is unchanged.': 'இந்தப் பக்கத்தில் பிழை ஏற்பட்டது. உலாவியில் சேமித்த தரவு மாற்றப்படவில்லை.', 'Try again': 'மீண்டும் முயற்சிக்கவும்',
  'Page not found': 'பக்கம் கிடைக்கவில்லை', 'Go back to your articles.': 'உங்கள் கட்டுரைகள் பக்கத்திற்குத் திரும்புங்கள்.', 'Go to articles': 'கட்டுரைகளுக்குச் செல்லவும்',
}

Object.assign(tamil, { 'Preferred voice': 'விருப்பமான குரல்', 'Use system voice': 'சாதனத்தின் குரலைப் பயன்படுத்தவும்', Language: 'மொழி', 'Speech rate': 'பேச்சு வேகம்', 'Speed at which the text is spoken': 'உரை பேசப்படும் வேகம்', Pitch: 'குரல் சுருதி', 'Affects the tone of the synthesized speech': 'உருவாக்கப்படும் குரலின் தொனியை மாற்றும்', Play: 'இயக்கு', Reset: 'மீட்டமை', Small: 'சிறியது', Medium: 'நடுத்தரம்', Large: 'பெரியது', 'No matching accessibility settings.': 'பொருந்தும் அணுகல்தன்மை அமைப்புகள் இல்லை.', 'Accessibility Menu': 'அணுகல்தன்மை மெனு', 'Quickly open accessibility controls for this app.': 'இந்தச் செயலியின் அணுகல்தன்மை கட்டுப்பாடுகளை விரைவாகத் திறக்கவும்.', 'Use quick controls to adjust this app. Device controls such as volume, brightness, locking, and screenshots are not available to websites.': 'இந்தச் செயலியை மாற்ற விரைவுக் கட்டுப்பாடுகளைப் பயன்படுத்தவும். ஒலி, பிரகாசம், பூட்டுதல் மற்றும் திரைப்பிடிப்பு போன்ற சாதனக் கட்டுப்பாடுகளை இணையதளங்கள் இயக்க முடியாது.', 'Decrease text size': 'உரை அளவைக் குறை', 'Increase text size': 'உரை அளவை அதிகரி', 'Zoom out': 'காட்சியைக் குறை', 'Zoom in': 'காட்சியைப் பெரிதாக்கு', 'Turn bold text off': 'தடித்த உரையை அணை', 'Turn bold text on': 'தடித்த உரையை இயக்கு', 'Use light theme': 'ஒளி தோற்றத்தைப் பயன்படுத்து', Options: 'விருப்பங்கள்', 'Accessibility Menu shortcut': 'அணுகல்தன்மை மெனு குறுக்குவழி', On: 'இயக்கம்', Off: 'நிறுத்தம்', Settings: 'அமைப்புகள்', 'App info': 'செயலி விவரம்', 'Open Accessibility Menu': 'அணுகல்தன்மை மெனுவைத் திற', 'Accessibility Menu quick controls work inside this writing app only. Your preferences are saved in this browser.': 'அணுகல்தன்மை விரைவுக் கட்டுப்பாடுகள் இந்த எழுதும் செயலியில் மட்டுமே இயங்கும். உங்கள் விருப்பங்கள் இந்த உலாவியில் சேமிக்கப்படும்.' })

Object.assign(tamil, { 'Colour and motion': 'நிறமும் இயக்கமும்', 'Adjust colour, blur, and movement in this app.': 'இந்தச் செயலியின் நிறம், மங்கல், இயக்கத்தை மாற்றவும்.', 'Colour inversion': 'நிறங்களைத் தலைகீழாக்கு', Grayscale: 'கருப்பு வெள்ளை', 'Reduced saturation': 'நிற அடர்த்தி குறைப்பு', 'Reduce blur effects': 'மங்கல் விளைவுகளைக் குறை', 'Make backgrounds and panels easier to see': 'பின்னணி மற்றும் பலகைகளைத் தெளிவாகக் காண உதவும்', 'Remove animations': 'அசைவூட்டங்களை நீக்கு', 'Reduce movement on the screen': 'திரை அசைவுகளைக் குறை', 'These preferences affect this website only; they do not change device accessibility settings.': 'இந்த விருப்பங்கள் இந்த இணையதளத்தில் மட்டுமே செயல்படும்; சாதனத்தின் அணுகல்தன்மை அமைப்புகளை மாற்றாது.' })
Object.assign(tamil, { 'Keyboard shortcut: Alt+Shift+A': 'விசைப்பலகை குறுக்குவழி: Alt+Shift+A', 'Colour filter': 'நிற வடிகட்டி', 'Applies a colour filter to this website only.': 'இந்த இணையதளத்திற்கு மட்டுமே நிற வடிகட்டியைப் பயன்படுத்தும்.' })
Object.assign(tamil, { 'About device modes': 'சாதனப் பயன்முறைகள் பற்றி' })
Object.assign(tamil, { Pin: 'பின் செய்', Pinned: 'பின் செய்யப்பட்டது', 'Pin article': 'கட்டுரையைப் பின் செய்', 'Unpin article': 'கட்டுரையின் பின்னை நீக்கு', 'Article pinned.': 'கட்டுரை பின் செய்யப்பட்டது.', 'Article unpinned.': 'கட்டுரையின் பின் நீக்கப்பட்டது.', 'Pinned article replaced.': 'பின் செய்யப்பட்ட கட்டுரை மாற்றப்பட்டது.', 'Could not save pinned articles in this browser.': 'இந்த உலாவியில் பின் செய்த கட்டுரைகளைச் சேமிக்க முடியவில்லை.', 'Replace a pinned article?': 'பின் செய்த கட்டுரையை மாற்றவா?', 'The pin limit is three. Choose a pinned article to replace with:': 'அதிகபட்சம் மூன்று கட்டுரைகளையே பின் செய்யலாம். இதற்குப் பதிலாக ஒரு கட்டுரையைத் தேர்ந்தெடுக்கவும்:', 'Confirm replacement': 'மாற்றத்தை உறுதிப்படுத்து', 'Choose a pinned article to replace': 'மாற்ற வேண்டிய பின் செய்த கட்டுரையைத் தேர்ந்தெடுக்கவும்', 'A selected article is no longer available.': 'தேர்ந்தெடுத்த கட்டுரை இனி கிடைக்கவில்லை.', 'More than three articles were already pinned. Unpin articles until three remain before adding another.': 'ஏற்கனவே மூன்றுக்கும் மேற்பட்ட கட்டுரைகள் பின் செய்யப்பட்டுள்ளன. புதியதைச் சேர்க்கும் முன் சிலவற்றின் பின்னை நீக்கவும்.' })
Object.assign(tamil, { 'You appear to be offline.': 'இணைய இணைப்பு இல்லை எனத் தெரிகிறது.', 'You can keep editing local content. Internet-dependent actions may fail; browser storage determines whether changes save successfully.': 'உள்ளூர் உள்ளடக்கத்தைத் தொடர்ந்து திருத்தலாம். இணையம் தேவைப்படும் செயல்கள் தோல்வியடையலாம்; மாற்றங்கள் சேமிக்கப்படுகிறதா என்பதை உலாவி சேமிப்பகமே தீர்மானிக்கும்.', 'The browser reports that a connection is available again.': 'இணைப்பு மீண்டும் கிடைப்பதாக உலாவி தெரிவிக்கிறது.', 'This does not confirm that every online service is reachable.': 'இதனால் எல்லா இணையச் சேவைகளும் கிடைக்கின்றன என்று உறுதியாகாது.' })
Object.assign(tamil, { 'Outline is applied to article and primary reading text.': 'கட்டுரை மற்றும் முக்கிய வாசிப்பு உரையில் மட்டும் வெளிக்கோடு பயன்படுத்தப்படும்.', 'Changes apply immediately.': 'மாற்றங்கள் உடனடியாக அமல்படுத்தப்படும்.', 'Accessibility preferences saved in this browser.': 'அணுகல்தன்மை விருப்பங்கள் இந்த உலாவியில் சேமிக்கப்பட்டன.', 'Preferences apply for this session but could not be saved.': 'இந்த அமர்வில் விருப்பங்கள் அமலாகும்; ஆனால் சேமிக்க முடியவில்லை.' })
Object.assign(tamil, { 'Save selected text to Highlights': 'தேர்ந்தெடுத்த உரையை சிறப்பம்சங்களில் சேமி', 'Save article to Highlights': 'கட்டுரையை சிறப்பம்சங்களில் சேமி', 'Save selection to Highlights': 'தேர்வை சிறப்பம்சங்களில் சேமி', 'Selected text will be saved.': 'தேர்ந்தெடுத்த உரை சேமிக்கப்படும்.', 'No text selected; the whole article will be saved.': 'உரை தேர்ந்தெடுக்கப்படவில்லை; முழுக் கட்டுரையும் சேமிக்கப்படும்.', 'Create a Highlight Collection before saving.': 'சேமிப்பதற்கு முன் சிறப்பம்சத் தொகுப்பை உருவாக்கவும்.', 'Untitled highlight collection': 'பெயரிடப்படாத சிறப்பம்சத் தொகுப்பு', 'Saved to Highlights': 'சிறப்பம்சங்களில் சேமிக்கப்பட்டது', 'Choose an available Highlight Collection.': 'கிடைக்கும் சிறப்பம்சத் தொகுப்பைத் தேர்ந்தெடுக்கவும்.', 'There is no article text to save.': 'சேமிக்க கட்டுரை உரை இல்லை.', 'This text is already saved in that collection.': 'இந்த உரை ஏற்கனவே அந்தத் தொகுப்பில் சேமிக்கப்பட்டுள்ளது.', 'saved text highlights': 'சேமித்த உரை சிறப்பம்சங்கள்', 'Saved article text': 'சேமித்த கட்டுரை உரை', More: 'மேலும்' })
Object.assign(tamil, { 'Speech and text': 'பேச்சும் உரையும்' })

Object.assign(tamil, { 'Recent Posts': 'சமீபத்திய பதிவுகள்', 'Total posts: {count}': 'மொத்தப் பதிவுகள்: {count}', 'See More': 'மேலும் பார்க்க', 'Show Less': 'குறைவாகக் காட்டு', 'No posts yet': 'இன்னும் பதிவுகள் இல்லை', 'Article preview actions': 'கட்டுரை முன்னோட்ட செயல்கள்', 'Save Draft': 'வரைவைச் சேமி', 'Saving draft...': 'வரைவு சேமிக்கப்படுகிறது...', 'Save failed': 'சேமிக்க முடியவில்லை', 'Your edits remain in this editor. Try saving again.': 'உங்கள் திருத்தங்கள் இங்கே உள்ளன. மீண்டும் சேமிக்கவும்.', 'Your draft changes are stored in this browser.': 'உங்கள் வரைவு மாற்றங்கள் இந்த உலாவியில் சேமிக்கப்பட்டுள்ளன.', 'Your draft changes are being saved in this browser.': 'உங்கள் வரைவு மாற்றங்கள் இந்த உலாவியில் சேமிக்கப்படுகின்றன.', Back: 'பின்செல்' })
Object.assign(tamil, { Bookmarks: 'புத்தகக்குறிகள்', 'Articles you saved for quick access.': 'விரைவாக அணுக நீங்கள் சேமித்த கட்டுரைகள்.', 'Bookmark article': 'கட்டுரையைப் புத்தகக்குறியிடு', 'Remove bookmark': 'புத்தகக்குறியை நீக்கு', Bookmarked: 'புத்தகக்குறியிடப்பட்டது', Bookmark: 'புத்தகக்குறி', 'Home Shortcuts': 'முகப்புக் குறுக்குவழிகள்', 'Add to Home Shortcuts': 'முகப்புக் குறுக்குவழிகளில் சேர்', 'Remove from Home Shortcuts': 'முகப்புக் குறுக்குவழிகளில் இருந்து நீக்கு', 'Remove home shortcut': 'முகப்புக் குறுக்குவழியை நீக்கு', 'In shortcuts': 'குறுக்குவழிகளில் உள்ளது', 'Add shortcut': 'குறுக்குவழி சேர்', 'Article bookmarked.': 'கட்டுரை புத்தகக்குறியிடப்பட்டது.', 'Bookmark removed.': 'புத்தகக்குறி நீக்கப்பட்டது.', 'Could not save bookmarks in this browser.': 'இந்த உலாவியில் புத்தகக்குறிகளைச் சேமிக்க முடியவில்லை.', 'Article added to Home Shortcuts.': 'கட்டுரை முகப்புக் குறுக்குவழிகளில் சேர்க்கப்பட்டது.', 'Article removed from Home Shortcuts.': 'கட்டுரை முகப்புக் குறுக்குவழிகளில் இருந்து நீக்கப்பட்டது.', 'Could not save Home Shortcuts in this browser.': 'இந்த உலாவியில் முகப்புக் குறுக்குவழிகளைச் சேமிக்க முடியவில்லை.', 'This article is no longer available.': 'இந்தக் கட்டுரை இனி கிடைக்கவில்லை.', 'Some shortcuts point to articles that are no longer available.': 'சில குறுக்குவழிகள் இனி கிடைக்காத கட்டுரைகளைக் குறிக்கின்றன.', 'Saved shortcuts are unavailable.': 'சேமித்த குறுக்குவழிகள் கிடைக்கவில்லை.', 'No Home Shortcuts yet': 'முகப்புக் குறுக்குவழிகள் இன்னும் இல்லை', 'Some bookmarked articles are no longer available.': 'சில புத்தகக்குறியிட்ட கட்டுரைகள் இனி கிடைக்கவில்லை.', 'Saved bookmarks are unavailable.': 'சேமித்த புத்தகக்குறிகள் கிடைக்கவில்லை.', 'No bookmarked articles yet': 'புத்தகக்குறியிட்ட கட்டுரைகள் இன்னும் இல்லை' })

Object.assign(tamil, { Archive: 'ஆவணகம்', 'Your library': 'உங்கள் நூலகம்', 'Archived articles are kept here until you restore them.': 'மீட்டெடுக்கும் வரை காப்பகப்படுத்திய கட்டுரைகள் இங்கே இருக்கும்.', 'No archived articles yet': 'காப்பகத்தில் இன்னும் கட்டுரைகள் இல்லை', 'Archive article': 'கட்டுரையை காப்பகப்படுத்து', 'Restore from archive': 'காப்பகத்திலிருந்து மீட்டெடு', 'Article moved to Archive.': 'கட்டுரை காப்பகத்திற்கு நகர்த்தப்பட்டது.', 'Article restored from Archive.': 'கட்டுரை காப்பகத்திலிருந்து மீட்டெடுக்கப்பட்டது.' })

Object.assign(tamil, { 'Open profile': 'சுயவிவரத்தைத் திற' })

Object.assign(tamil, { 'New search': 'புதிய தேடல்', 'Listening...': 'கேட்கிறது...', 'Search by voice': 'குரல் மூலம் தேடு', 'Search with Google Lens': 'Google Lens மூலம் தேடு', 'AI Mode': 'AI பயன்முறை', 'Voice search is not supported in this browser.': 'இந்த உலாவியில் குரல் தேடல் ஆதரிக்கப்படவில்லை.', 'Voice search could not start. Check microphone access and try again.': 'குரல் தேடலைத் தொடங்க முடியவில்லை. மைக்ரோஃபோன் அனுமதியைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.' })

Object.assign(tamil, {
  'All rights reserved.': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  'Contact:': 'தொடர்புக்கு:',
})

const english = Object.fromEntries(Object.entries(tamil).map(([key, value]) => [value, key]))
const LanguageContext = createContext('en')

export function LanguageProvider({ language, children }) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const language = useContext(LanguageContext)
  const t = useCallback((text) => language === 'ta' ? (tamil[text] || text) : (english[text] || text), [language])
  return { language, t }
}
